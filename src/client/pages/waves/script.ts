import { DrawCanvas } from "@/classes/DrawCanvas";
import { TimingFunctions } from "@/classes/TimingFunctions";
import { COLORS } from "@/types/Colors";
import { clamp } from "lodash";

class WaveCanvas extends DrawCanvas {
    WAVELENGTH = 100;
    AMPLITUDE = 50;
    FREQUENCY = 50;
    CURVE_BASELINE = this.CANVAS_HEIGHT / 2;

    private currentAmplitude: number = this.AMPLITUDE;
    private currentFrequency: number = this.FREQUENCY;
    private targetAmplitude: number = this.AMPLITUDE;
    private targetFrequency: number = this.FREQUENCY;
    private previous_points: number[][] = [];
    private target_points: number[][] = [];

    constructor(canvasId: string, width: number = window.innerWidth - 28) {
        super(canvasId, width);
        window.addEventListener("resize", this.handleWindowResize.bind(this));
        this.calculatePoints(); // Initialize points
    }

    private handleWindowResize() {
        this.CANVAS_WIDTH = window.innerWidth - 28;
        this.setupCanvas();
        this.calculatePoints(); // Recalculate points on resize
        this.drawWave(this.currentAmplitude, this.currentFrequency);
    }

    private calculatePoints() {
        this.previous_points = [];
        this.target_points = [];
        for (let i = 0; i < this.CANVAS_WIDTH; i++) {
            const { x, y } = this.waveAlgorithm(i, this.currentFrequency, this.currentAmplitude);
            this.previous_points.push([x, y]);
            const { x: targetX, y: targetY } = this.waveAlgorithm(i, this.targetFrequency, this.targetAmplitude);
            this.target_points.push([targetX, targetY]);
        }
    }

    private waveAlgorithm(x: number, frequency: number, amplitude: number) {
        const freq = (2 * Math.PI) / frequency; // Frequency determines wavelength
        const y = this.CURVE_BASELINE + Math.sin(x * freq) * amplitude;
        return { x, y };
    }

    // Method to update parameters and trigger animation
    updateParameters({ AMPLITUDE, FREQUENCY }: { AMPLITUDE?: number; FREQUENCY?: number }) {
        if (AMPLITUDE !== undefined) this.targetAmplitude = AMPLITUDE;
        if (FREQUENCY !== undefined) this.targetFrequency = FREQUENCY;

        this.calculatePoints(); // Recalculate target points
        this.animate(); // Start animation
    }

    drawWave(amplitude: number, frequency: number) {
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = COLORS.WAVE;

        for (let i = 0; i < this.CANVAS_WIDTH; i++) {
            const { x, y } = this.waveAlgorithm(i, frequency, amplitude);
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
    }

    animate() {
        let startTime: number | null = null;
        const duration = 0; // Animation duration in ms

        const loop = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = TimingFunctions.easeOutSine(progress);

            // Draw wave with interpolated parameters
            this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.lineCap = "round";
            this.ctx.strokeStyle = COLORS.WAVE;

            for (let i = 0; i < this.CANVAS_WIDTH; i++) {
                const [prevX, prevY] = this.previous_points[i];
                const [targetX, targetY] = this.target_points[i];
                const newX = prevX + (targetX - prevX) * easedProgress;
                const newY = prevY + (targetY - prevY) * easedProgress;
                if (i === 0) {
                    this.ctx.moveTo(newX, newY);
                } else {
                    this.ctx.lineTo(newX, newY);
                }
            }
            this.ctx.stroke();

            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(loop);
            } else {
                // Animation complete, update current values
                this.currentAmplitude = this.targetAmplitude;
                this.currentFrequency = this.targetFrequency;
                this.previous_points = [...this.target_points];
                this.AMPLITUDE = this.currentAmplitude;
                this.FREQUENCY = this.currentFrequency;
                this.drawWave(this.currentAmplitude, this.currentFrequency); // Final draw
            }
        };

        requestAnimationFrame(loop);
    }
}

class Knob {
    element: HTMLDivElement;
    active: boolean = false;
    type: "FREQUENCY" | "AMPLITUDE";

    constructor(id: string, type: "FREQUENCY" | "AMPLITUDE") {
        this.element = document.getElementById(id) as HTMLDivElement;
        this.type = type;
        this.element.addEventListener("wheel", this.handleMouseWheel.bind(this));
        this.element.style.setProperty("--rotation", `${clamp(waveCanvas[this.type], 0, 360)}deg`);
    }

    handleMouseWheel(e: WheelEvent) {
        const newValue = waveCanvas[this.type] + e.deltaY * 0.1;
        const clampedValue = clamp(newValue, 1, 360);
        this.element.style.setProperty("--rotation", `${clampedValue}deg`);
        waveCanvas.updateParameters({ [this.type]: clampedValue });
    }
}

const waveCanvas = new WaveCanvas("canvas");
waveCanvas.animate();

const frequency: HTMLInputElement = document.getElementById("frequency") as HTMLInputElement;
frequency.value = waveCanvas.FREQUENCY.toString();
frequency.addEventListener("change", updateValues);

const amplitude: HTMLInputElement = document.getElementById("amplitude") as HTMLInputElement;
amplitude.value = waveCanvas.AMPLITUDE.toString();
amplitude.addEventListener("change", updateValues);

const frequencyKnob = new Knob("freq", "FREQUENCY");
const amplitudeKnob = new Knob("amp", "AMPLITUDE");

function updateValues() {
    const AMPLITUDE = parseFloat(amplitude.value);
    const FREQUENCY = parseFloat(frequency.value);
    waveCanvas.updateParameters({ AMPLITUDE, FREQUENCY });
}

function randomise() {
    amplitude.value = Math.floor(Math.random() * 200).toString();
    frequency.value = Math.floor(Math.random() * 200).toString();
    updateValues();
}

// setInterval(() => {
//     randomise();
// }, 1600);
