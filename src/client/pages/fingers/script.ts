const trackpad = document.getElementById("trackpad") as HTMLDivElement;

document.body.addEventListener("mousedown", async () => {
    await document.body.requestPointerLock();
});

window.addEventListener("message", (event) => {
    if (event.data.type === "trackpad") {
        window.dispatchEvent(new CustomEvent("trackpad", { detail: event.data.data }));
    }
});

window.addEventListener(
    "wheel",
    (e) => {
        e.preventDefault();
    },
    { passive: false }
);

window.addEventListener(
    "gesturestart",
    (e) => {
        e.preventDefault();
    },
    { passive: false }
);

interface Finger {
    frame: number;
    angle: number;
    majorAxis: number;
    minorAxis: number;
    position: {
        x: number;
        y: number;
    };
    velocity: {
        x: number;
        y: number;
    };
    identifier: number;
    state: number;
    foo3: number;
    foo4: number;
    size: number;
    unk2: number;
}

interface TrackpadEvent extends CustomEvent {
    detail: {
        frame: number;
        timestamp: number;
        fingers: Finger[];
    };
}

const gestureHandlers = {
    1: singleFingerGestures,
    2: twoFingerGestures,
};

let initialData: Finger[] = [];
let numFingers = 0;

const gestureTextElement = document.getElementById("gesture") as HTMLHeadingElement;

function singleFingerGestures(data: Finger[]) {}

function twoFingerGestures(data: Finger[]) {
    if (initialData?.length < 2 || data?.length < 2) return;

    let fingerOne = false;
    let fingerTwo = false;

    if (data[0].position.y - initialData[0].position.y >= 0.1) {
        fingerOne = true;
    }

    if (data[1].position.y - initialData[1].position.y >= 0.1) {
        fingerTwo = true;
    }

    if (fingerOne && fingerTwo) {
        gestureTextElement.textContent = "Swipe up";
    }
}

window.addEventListener("trackpad", (e) => {
    const ev = e as TrackpadEvent;
    const { fingers } = ev.detail;

    if (numFingers && numFingers === fingers.length) {
        switch (fingers.length) {
            case 1:
                singleFingerGestures(fingers);
                break;
            case 2:
                twoFingerGestures(fingers);
                break;
        }
    } else {
        numFingers = fingers.length;
        initialData = fingers;
    }

    if (numFingers === 0) gestureTextElement.textContent = "";

    // remove previous frame data from screen
    while (trackpad.firstChild) {
        trackpad.removeChild(trackpad.firstChild);
    }

    // draw current frame fingers to the screen
    fingers.forEach((finger) => {
        const el = document.createElement("div");
        el.className = "finger";
        el.style.top = `${trackpad.offsetHeight * (1 - finger.position.y)}px`;
        el.style.left = `${trackpad.offsetWidth * finger.position.x}px`;
        el.style.width = `${finger.majorAxis * 5}px`;
        el.style.height = `${finger.minorAxis * 5}px`;
        el.style.opacity = `${finger.unk2}`;
        trackpad.appendChild(el);
    });
});
