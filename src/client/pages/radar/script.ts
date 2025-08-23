import { DrawCanvas } from "@/classes/DrawCanvas";
import { TimingFunctions } from "@/classes/TimingFunctions";
import { Utils } from "@/classes/Utils";

interface DrawRadarOptions {
    duration: number;
    timingFunction: (x: number) => number;
    points?: number[][];
}

class RadarCanvas extends DrawCanvas {
    CANVAS_WIDTH = 500;
    CANVAS_HEIGHT = 500;
    RADIUS = this.CANVAS_WIDTH / 2;
    CIRCLE_OFFSET = 15;

    private drawRadarCircles() {
        // Draw outer border
        this.ctx.beginPath();
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = "#03fe03";
        this.ctx.arc(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2, this.RADIUS, 0, 360);
        this.ctx.stroke();

        // Draw inner border
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.arc(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2, this.RADIUS - this.CIRCLE_OFFSET, 0, 360);
        this.ctx.stroke();

        // Draw inner circles
        let finalRadius = 45;
        let startingRadius = this.RADIUS - (this.CIRCLE_OFFSET + finalRadius);
        const steps = Math.round(startingRadius / finalRadius);
        let currentRadius = startingRadius;

        for (let i = 0; i < steps; i++) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#03fe034c";
            this.ctx.arc(this.RADIUS, this.CANVAS_HEIGHT / 2, currentRadius, 0, 360);
            this.ctx.stroke();

            currentRadius -= finalRadius;
        }
    }

    private drawRadarLines() {
        this.ctx.save();

        // Center of the canvas
        const centerX = this.CANVAS_WIDTH / 2;
        const centerY = this.CANVAS_HEIGHT / 2;

        // Draw 12 lines, each 30 degrees apart
        for (let i = 0; i < 12; i++) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#03fe034c";

            // Move to center
            // Calculate endpoint using polar coordinates
            const angle = Utils.degreesToRadians(i * 30); // 30 degrees in radians
            const endX = centerX + (this.RADIUS - this.CIRCLE_OFFSET) * Math.cos(angle);
            const endY = centerY + (this.RADIUS - this.CIRCLE_OFFSET) * Math.sin(angle);
            // this.ctx.clearRect(centerX, centerY, 1, this.CIRCLE_OFFSET);
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(endX, endY);

            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    private drawRadarSweep(newValue: number) {
        this.ctx.beginPath();
        const conicGradient = this.ctx.createConicGradient(newValue, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
        conicGradient.addColorStop(0.4, "transparent");
        conicGradient.addColorStop(1, "#03fe03");
        this.ctx.fillStyle = conicGradient;
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    }

    drawRadar({ duration, timingFunction, points }: DrawRadarOptions) {
        this.canvas.style.borderRadius = "9999px";
        this.canvas.style.borderWidth = "0px";
        this.canvas.style.boxShadow = "0 0 200px 5px #03fe034c, inset 0 0 200px 5px #03fe032c";

        const startValue = 0;
        const targetValue = Utils.degreesToRadians(360);

        let startTime = performance.now();

        function loop(this: RadarCanvas, timestamp: number): void {
            const elapsed: number = timestamp - startTime;
            const progress: number = Math.min(elapsed / duration, 1);
            const easedProgress: number = timingFunction(progress);

            const newValue: number = startValue + (targetValue - startValue) * easedProgress;

            // if (newValue === targetValue) {
            //     const audio = new Audio("/assets/sounds/radar-ping.mp3");
            //     audio.play();
            // }

            // Clear the canvas to prevent overlapping artifacts
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.resetLine();

            // Draw circles
            this.drawRadarCircles();

            // Draw lines
            this.drawRadarLines();

            // Draw sweep line
            this.drawRadarSweep(newValue);

            // Draw dots
            if (points) {
                points.forEach((point) => {
                    this.ctx.beginPath();
                    this.ctx.arc(point[0], point[1], 2.5, 0, 360);
                    this.ctx.fill();
                });
            }

            // Write current degrees
            // const degrees = Math.round(Utils.radiansToDegrees(newValue));
            // this.ctx.font = "50px serif";
            // this.ctx.fillStyle = COLORS.RADAR_GREEN + "7c";
            // this.ctx.textAlign = "center";
            // this.ctx.fillText(degrees.toString(), this.RADIUS, this.CIRCLE_OFFSET * 4);

            // Restart the animation
            if (progress >= 1) {
                startTime = performance.now();
            }

            requestAnimationFrame(loop.bind(this));
        }

        requestAnimationFrame(loop.bind(this));
    }
}

const radarCanvas = new RadarCanvas("canvas");

function randomRadarPoints(size: number = 10): number[][] {
    const points: number[][] = [];

    for (let i = 0; i < size; i++) {
        points.push([Math.floor(Math.random() * radarCanvas.CANVAS_WIDTH), Math.floor(Math.random() * radarCanvas.CANVAS_HEIGHT)]);
    }

    return points;
}

radarCanvas.drawRadar({ duration: 5000, timingFunction: TimingFunctions.linear, points: randomRadarPoints(200) });
