// AURORA — an expressive MPE-style instrument driven by raw trackpad multitouch.
//
// Each finger (tracked by its persistent `identifier`) becomes an independent
// polyphonic voice. The three continuous axes of MPE expression map to:
//   • X position  → pitch   (quantized to a scale, with portamento on slides)
//   • Y position  → brightness (lowpass filter cutoff)
//   • press (unk2)→ dynamics (loudness + a touch of brightness)
// Contact size and pressure both feed the visuals so the surface feels alive.

interface Finger {
    frame: number;
    angle: number;
    majorAxis: number;
    minorAxis: number;
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    identifier: number;
    state: number;
    foo3: number;
    foo4: number;
    size: number;
    unk2: number;
}

interface TrackpadEvent extends CustomEvent {
    detail: { frame: number; timestamp: number; fingers: Finger[] };
}

// --- Small helpers ------------------------------------------------------------

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteLabel = (m: number) => NOTE_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

const PORTAMENTO = 0.06; // seconds to glide between scale notes when sliding

// --- Musical configuration ----------------------------------------------------

const SCALES: Record<string, number[]> = {
    Pentatonic: [0, 2, 4, 7, 9],
    "Minor Pent": [0, 3, 5, 7, 10],
    Major: [0, 2, 4, 5, 7, 9, 11],
    Dorian: [0, 2, 3, 5, 7, 9, 10],
    Insen: [0, 1, 5, 7, 10],
};

interface OscSpec {
    type: OscillatorType;
    detune: number; // cents
    gain: number;
    octave?: number; // relative octave offset
}

interface Timbre {
    name: string;
    oscs: OscSpec[];
    filterBase: number; // Hz
    filterRange: number; // Hz added by brightness
    q: number;
    attack: number; // s
    release: number; // s
    sustain: number; // >0 → amplitude follows pressure; 0 → plucked (decays)
    decay: number; // s, only used when sustain === 0
    reverb: number; // 0..1 per-voice reverb send
}

const TIMBRES: Timbre[] = [
    {
        name: "Bloom",
        oscs: [
            { type: "sawtooth", detune: -6, gain: 0.5 },
            { type: "sawtooth", detune: 7, gain: 0.5 },
            { type: "sine", detune: 0, gain: 0.35, octave: -1 },
        ],
        filterBase: 360,
        filterRange: 5400,
        q: 7,
        attack: 0.02,
        release: 0.55,
        sustain: 1,
        decay: 0,
        reverb: 0.5,
    },
    {
        name: "Glass",
        oscs: [
            { type: "sine", detune: 0, gain: 0.7 },
            { type: "sine", detune: 4, gain: 0.25, octave: 1 },
            { type: "triangle", detune: -4, gain: 0.2, octave: 1 },
        ],
        filterBase: 1300,
        filterRange: 7200,
        q: 3,
        attack: 0.005,
        release: 1.5,
        sustain: 0.85,
        decay: 0,
        reverb: 0.72,
    },
    {
        name: "Pluck",
        oscs: [
            { type: "sawtooth", detune: -8, gain: 0.5 },
            { type: "square", detune: 8, gain: 0.28 },
            { type: "sine", detune: 0, gain: 0.3, octave: -1 },
        ],
        filterBase: 520,
        filterRange: 6200,
        q: 6,
        attack: 0.003,
        release: 0.35,
        sustain: 0,
        decay: 0.55,
        reverb: 0.36,
    },
];

let timbreIdx = 0;
let scaleName = "Pentatonic";
let rootMidi = 48; // C3

// Flattened list of playable scale notes spanning the surface left → right.
let playNotes: number[] = [];
let bandLabels: string[] = [];

function rebuildNotes(): void {
    const steps = SCALES[scaleName];
    playNotes = [];
    for (let o = 0; o < 4; o++) {
        for (const s of steps) playNotes.push(rootMidi + o * 12 + s);
    }
    bandLabels = playNotes.map(noteLabel);
}
rebuildNotes();

function xToMidi(x: number): number {
    const n = playNotes.length;
    let idx = Math.floor(clamp01(x) * n);
    if (idx >= n) idx = n - 1;
    return playNotes[idx];
}

// --- Pressure → expression ----------------------------------------------------
// `unk2` is the trackpad's pressure channel (great on Force Touch). We adapt to
// whatever range this trackpad reports, and fold in contact size so even a
// pressure-less trackpad still gives some dynamics. A soft floor keeps every
// note audible.

let pressureCeil = 0.7; // grows to the hardest press seen this session

function fingerPressure(f: Finger): number {
    if (f.unk2 > pressureCeil) pressureCeil = f.unk2;
    const force = clamp01(f.unk2 / pressureCeil);
    const sizeNudge = clamp01((f.majorAxis - 6) / 30);
    return clamp01(Math.max(0.55 * force + 0.3 * sizeNudge, 0.12));
}

const ampFromPressure = (p: number) => 0.06 + 0.46 * p; // per-voice peak gain

// --- Audio engine -------------------------------------------------------------

interface Audio {
    ctx: AudioContext;
    dry: GainNode; // voices' dry path
    wet: GainNode; // voices' reverb-send bus → convolver
    master: GainNode;
    analyser: AnalyserNode;
    freq: Uint8Array;
}

let audio: Audio | null = null;

// Exponentially-decaying noise impulse → a clean algorithmic-ish reverb tail.
function makeIR(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
    const rate = ctx.sampleRate;
    const len = Math.max(1, Math.floor(rate * seconds));
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }
    }
    return buf;
}

function initAudio(): void {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ctx: AudioContext = new AC();

    const master = ctx.createGain();
    master.gain.value = 0.72;

    // A limiter on the bus keeps dense chords from clipping.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -8;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.25;
    master.connect(limiter);
    limiter.connect(ctx.destination);

    const dry = ctx.createGain();
    dry.gain.value = 1;
    dry.connect(master);

    // Reverb send bus → convolver → return
    const conv = ctx.createConvolver();
    conv.buffer = makeIR(ctx, 2.8, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 1;
    wet.connect(conv);
    const wetReturn = ctx.createGain();
    wetReturn.gain.value = 0.85;
    conv.connect(wetReturn);
    wetReturn.connect(master);

    // A gentle feedback delay for width/space, fed from the dry bus.
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.34;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const delaySend = ctx.createGain();
    delaySend.gain.value = 0.16;
    dry.connect(delaySend);
    delaySend.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(master);

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;
    master.connect(analyser);

    audio = {
        ctx,
        dry,
        wet,
        master,
        analyser,
        freq: new Uint8Array(analyser.frequencyBinCount),
    };
}

// A single playing voice (one finger).
class Voice {
    private ctx: AudioContext;
    private timbre: Timbre;
    private oscs: OscillatorNode[] = [];
    private octaves: number[] = [];
    private filter: BiquadFilterNode;
    private amp: GainNode;
    private wetSend: GainNode;
    private glideMidi: number;

    constructor(a: Audio, timbre: Timbre, midi: number, pressure: number, bright: number) {
        this.ctx = a.ctx;
        this.timbre = timbre;
        this.glideMidi = midi;
        const t = a.ctx.currentTime;

        this.filter = a.ctx.createBiquadFilter();
        this.filter.type = "lowpass";
        this.filter.Q.value = timbre.q;
        this.filter.frequency.value = timbre.filterBase + bright * timbre.filterRange;

        this.amp = a.ctx.createGain();
        this.amp.gain.value = 0.0001;
        this.filter.connect(this.amp);

        // Dry + reverb send
        this.amp.connect(a.dry);
        this.wetSend = a.ctx.createGain();
        this.wetSend.gain.value = timbre.reverb;
        this.amp.connect(this.wetSend);
        this.wetSend.connect(a.wet);

        const base = midiToFreq(midi);
        for (const o of timbre.oscs) {
            const osc = a.ctx.createOscillator();
            osc.type = o.type;
            osc.detune.value = o.detune;
            osc.frequency.value = base * Math.pow(2, o.octave || 0);
            const g = a.ctx.createGain();
            g.gain.value = o.gain;
            osc.connect(g);
            g.connect(this.filter);
            osc.start(t);
            this.oscs.push(osc);
            this.octaves.push(o.octave || 0);
        }

        // Attack envelope. For plucked timbres, decay toward a near-silent tail.
        const peak = ampFromPressure(pressure);
        this.amp.gain.cancelScheduledValues(t);
        this.amp.gain.setValueAtTime(0.0001, t);
        this.amp.gain.linearRampToValueAtTime(peak, t + timbre.attack);
        if (timbre.sustain === 0) {
            this.amp.gain.exponentialRampToValueAtTime(
                Math.max(0.0001, peak * 0.03),
                t + timbre.attack + timbre.decay
            );
        }
    }

    update(midi: number, pressure: number, bright: number): void {
        const t = this.ctx.currentTime;

        if (midi !== this.glideMidi) {
            this.glideMidi = midi;
            const base = midiToFreq(midi);
            for (let i = 0; i < this.oscs.length; i++) {
                const target = Math.max(1, base * Math.pow(2, this.octaves[i]));
                const osc = this.oscs[i];
                osc.frequency.cancelScheduledValues(t);
                osc.frequency.setValueAtTime(osc.frequency.value, t);
                osc.frequency.exponentialRampToValueAtTime(target, t + PORTAMENTO);
            }
        }

        const cutoff = clamp(this.timbre.filterBase + bright * this.timbre.filterRange, 80, 18000);
        this.filter.frequency.setTargetAtTime(cutoff, t, 0.02);

        // Sustaining timbres ride pressure continuously (aftertouch).
        if (this.timbre.sustain > 0) {
            const target = ampFromPressure(pressure) * this.timbre.sustain;
            this.amp.gain.setTargetAtTime(target, t, 0.04);
        }
    }

    stop(): void {
        const t = this.ctx.currentTime;
        const rel = this.timbre.release;
        const cur = Math.max(0.0001, this.amp.gain.value);
        this.amp.gain.cancelScheduledValues(t);
        this.amp.gain.setValueAtTime(cur, t);
        this.amp.gain.exponentialRampToValueAtTime(0.0001, t + rel);
        for (const osc of this.oscs) osc.stop(t + rel + 0.05);
        setTimeout(() => {
            try {
                this.filter.disconnect();
                this.amp.disconnect();
                this.wetSend.disconnect();
            } catch (e) {
                /* already torn down */
            }
        }, (rel + 0.25) * 1000);
    }
}

// --- Notes (audio voice + visual state, keyed by finger id) -------------------

interface Note {
    id: number;
    voice: Voice | null;
    x: number; // normalized 0..1, raw trackpad
    y: number; // normalized 0..1, Y up
    px: number; // last canvas px (computed during render)
    py: number;
    pressure: number;
    bright: number;
    midi: number;
    hue: number;
    trail: { x: number; y: number }[];
}

const notes = new Map<number, Note>();

interface Ripple {
    x: number;
    y: number;
    r: number;
    maxR: number;
    hue: number;
    a: number;
}
const ripples: Ripple[] = [];

const hueForX = (x: number) => 14 + clamp01(x) * 296; // warm → cool across the surface

function spawnRipple(x: number, y: number, hue: number, strength: number): void {
    ripples.push({ x, y, r: 8, maxR: 50 + strength * 130, hue, a: 0.6 });
}

// --- Canvas -------------------------------------------------------------------

const surface = document.getElementById("surface") as HTMLCanvasElement;
const cx = surface.getContext("2d") as CanvasRenderingContext2D;
let W = 0;
let H = 0;
let DPR = 1;

function resize(): void {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    surface.width = Math.floor(W * DPR);
    surface.height = Math.floor(H * DPR);
    surface.style.width = W + "px";
    surface.style.height = H + "px";
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener("resize", resize);
resize();

function drawFrets(): void {
    const n = playNotes.length;
    cx.save();
    cx.font = "11px ui-monospace, Menlo, monospace";
    cx.textAlign = "center";
    for (let i = 0; i < n; i++) {
        const x = (i / n) * W;
        const isRoot = (((playNotes[i] - rootMidi) % 12) + 12) % 12 === 0;
        cx.fillStyle = isRoot ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.035)";
        cx.fillRect(x, 70, 1, H - 110);
        const labelX = ((i + 0.5) / n) * W;
        cx.fillStyle = isRoot ? "rgba(200,220,255,0.5)" : "rgba(160,170,200,0.2)";
        cx.fillText(bandLabels[i], labelX, H - 46);
    }
    cx.restore();
}

// A reactive aurora rising from the bottom, colored by frequency band.
function drawAurora(): void {
    if (!audio) return;
    audio.analyser.getByteFrequencyData(audio.freq);
    const bins = audio.freq;
    const n = 110;
    cx.globalCompositeOperation = "lighter";
    for (let i = 0; i < n; i++) {
        const idx = Math.floor((i / n) * bins.length * 0.55);
        const v = bins[idx] / 255;
        if (v < 0.02) continue;
        const x = (i / n) * W;
        const w = W / n;
        const h = v * v * H * 0.46;
        const hue = 14 + (i / n) * 296;
        const g = cx.createLinearGradient(0, H, 0, H - h);
        g.addColorStop(0, `hsla(${hue},92%,58%,0)`);
        g.addColorStop(1, `hsla(${hue},92%,62%,${0.2 * v})`);
        cx.fillStyle = g;
        cx.fillRect(x, H - h, w + 1, h);
    }
    cx.globalCompositeOperation = "source-over";
}

function drawRipples(): void {
    for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += (r.maxR - r.r) * 0.12;
        r.a *= 0.92;
        cx.strokeStyle = `hsla(${r.hue},90%,66%,${r.a})`;
        cx.lineWidth = 2;
        cx.beginPath();
        cx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        cx.stroke();
        if (r.a < 0.02) ripples.splice(i, 1);
    }
}

function drawNote(n: Note): void {
    const px = n.x * W;
    const py = (1 - n.y) * H;
    n.px = px;
    n.py = py;

    // Comet trail
    n.trail.push({ x: px, y: py });
    if (n.trail.length > 24) n.trail.shift();
    for (let i = 0; i < n.trail.length; i++) {
        const t = n.trail[i];
        const f = i / n.trail.length;
        const r = (6 + n.pressure * 26) * f + 1;
        const g = cx.createRadialGradient(t.x, t.y, 0, t.x, t.y, r);
        g.addColorStop(0, `hsla(${n.hue},90%,66%,${0.12 * f})`);
        g.addColorStop(1, `hsla(${n.hue},90%,66%,0)`);
        cx.fillStyle = g;
        cx.beginPath();
        cx.arc(t.x, t.y, r, 0, Math.PI * 2);
        cx.fill();
    }

    // Main glow — radius and intensity scale with pressure
    const R = 26 + n.pressure * 72;
    const g = cx.createRadialGradient(px, py, 0, px, py, R);
    g.addColorStop(0, `hsla(${n.hue},96%,76%,0.95)`);
    g.addColorStop(0.25, `hsla(${n.hue},92%,60%,0.5)`);
    g.addColorStop(1, `hsla(${n.hue},92%,55%,0)`);
    cx.fillStyle = g;
    cx.beginPath();
    cx.arc(px, py, R, 0, Math.PI * 2);
    cx.fill();

    // Bright core
    const cr = 5 + n.pressure * 11;
    const cg = cx.createRadialGradient(px, py, 0, px, py, cr);
    cg.addColorStop(0, "rgba(255,255,255,0.95)");
    cg.addColorStop(1, `hsla(${n.hue},96%,72%,0)`);
    cx.fillStyle = cg;
    cx.beginPath();
    cx.arc(px, py, cr, 0, Math.PI * 2);
    cx.fill();
}

function drawLabels(): void {
    cx.font = "600 13px ui-rounded, -apple-system, sans-serif";
    cx.textAlign = "center";
    for (const n of notes.values()) {
        cx.fillStyle = "rgba(255,255,255,0.92)";
        cx.fillText(noteLabel(n.midi), n.px, n.py - (34 + n.pressure * 64));
    }
}

function render(): void {
    // Translucent wash → motion trails / glow persistence
    cx.globalCompositeOperation = "source-over";
    cx.fillStyle = "rgba(6,7,14,0.3)";
    cx.fillRect(0, 0, W, H);

    drawFrets();
    drawAurora();

    cx.globalCompositeOperation = "lighter";
    drawRipples();
    for (const n of notes.values()) drawNote(n);
    cx.globalCompositeOperation = "source-over";
    drawLabels();

    requestAnimationFrame(render);
}
requestAnimationFrame(render);

// --- Input --------------------------------------------------------------------

window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
window.addEventListener("gesturestart", (e) => e.preventDefault(), { passive: false });
document.addEventListener("contextmenu", (e) => e.preventDefault());

const readout = document.getElementById("readout") as HTMLElement;

window.addEventListener("trackpad", (e) => {
    const ev = e as TrackpadEvent;
    const fingers = ev.detail.fingers;
    const seen = new Set<number>();

    for (const f of fingers) {
        seen.add(f.identifier);
        const pressure = fingerPressure(f);
        const bright = clamp01(0.12 + 0.6 * f.position.y + 0.42 * pressure);
        const midi = xToMidi(f.position.x);
        const hue = hueForX(f.position.x);

        let n = notes.get(f.identifier);
        if (!n) {
            const voice = audio ? new Voice(audio, TIMBRES[timbreIdx], midi, pressure, bright) : null;
            n = {
                id: f.identifier,
                voice,
                x: f.position.x,
                y: f.position.y,
                px: f.position.x * W,
                py: (1 - f.position.y) * H,
                pressure,
                bright,
                midi,
                hue,
                trail: [],
            };
            notes.set(f.identifier, n);
            spawnRipple(n.px, n.py, hue, pressure);
        } else {
            n.x = f.position.x;
            n.y = f.position.y;
            n.pressure = pressure;
            n.bright = bright;
            n.midi = midi;
            n.hue = hue;
            if (n.voice) n.voice.update(midi, pressure, bright);
        }
    }

    // Any finger that vanished was lifted → release its voice
    for (const [id, n] of notes) {
        if (!seen.has(id)) {
            if (n.voice) n.voice.stop();
            spawnRipple(n.px, n.py, n.hue, 0.8);
            notes.delete(id);
        }
    }

    updateReadout(fingers);
});

function updateReadout(fingers: Finger[]): void {
    if (fingers.length === 0) {
        readout.textContent = "— idle —";
        return;
    }
    let best = fingers[0];
    for (const f of fingers) if (f.unk2 > best.unk2) best = f;
    const n = notes.get(best.identifier);
    const label = n ? noteLabel(n.midi) : "";
    const v = fingers.length === 1 ? "voice" : "voices";
    readout.textContent = `${fingers.length} ${v} · ${label} · press ${best.unk2.toFixed(2)}`;
}

// --- Toolbar ------------------------------------------------------------------

function buildSegment(host: HTMLElement, labels: string[], active: number, onPick: (i: number) => void): void {
    host.innerHTML = "";
    labels.forEach((label, i) => {
        const b = document.createElement("button");
        b.textContent = label;
        if (i === active) b.classList.add("active");
        b.addEventListener("click", () => {
            for (const child of host.children) child.classList.remove("active");
            b.classList.add("active");
            ensureAudio();
            onPick(i);
        });
        host.appendChild(b);
    });
}

buildSegment(
    document.getElementById("timbreSeg") as HTMLElement,
    TIMBRES.map((t) => t.name),
    timbreIdx,
    (i) => {
        timbreIdx = i;
    }
);

const scaleKeys = Object.keys(SCALES);
buildSegment(
    document.getElementById("scaleSeg") as HTMLElement,
    scaleKeys,
    scaleKeys.indexOf(scaleName),
    (i) => {
        scaleName = scaleKeys[i];
        rebuildNotes();
    }
);

const rootSel = document.getElementById("rootSel") as HTMLSelectElement;
[36, 40, 43, 45, 48, 50, 52, 55].forEach((m) => {
    const opt = document.createElement("option");
    opt.value = String(m);
    opt.textContent = noteLabel(m);
    if (m === rootMidi) opt.selected = true;
    rootSel.appendChild(opt);
});
rootSel.addEventListener("change", () => {
    rootMidi = parseInt(rootSel.value, 10);
    rebuildNotes();
    ensureAudio();
});

// --- Audio unlock -------------------------------------------------------------
// WebAudio only starts from a trusted gesture — synthetic trackpad events can't
// unlock it, so the overlay button (a real click) bootstraps the context.

function ensureAudio(): void {
    if (!audio) initAudio();
    if (audio && audio.ctx.state === "suspended") audio.ctx.resume();
}

const overlay = document.getElementById("overlay") as HTMLElement;
const startBtn = document.getElementById("startBtn") as HTMLButtonElement;

startBtn.addEventListener("click", () => {
    ensureAudio();
    overlay.classList.add("hidden");
});
