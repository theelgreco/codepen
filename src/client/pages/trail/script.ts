import { DrawCanvas } from "@/classes/DrawCanvas";
import { TimingFunctions } from "@/classes/TimingFunctions";

class TrailCanvas extends DrawCanvas {
    CANVAS_WIDTH: number = 500;
    CANVAS_HEIGHT: number = 500;

    mouseX: number | null = null;
    mouseY: number | null = null;

    animationFrame: number | null = null;

    constructor(canvasId: string) {
        super(canvasId);

        this.initialiseEventListeners();
    }

    private initialiseEventListeners() {
        this.canvas.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
    }

    private handleMouseEnter(e: MouseEvent) {
        this.mouseX = e.clientX - this.canvas.offsetLeft;
        this.mouseY = e.clientY - this.canvas.offsetTop;
        // this.drawTrail();
    }

    private handleMouseMove(e: MouseEvent) {
        this.mouseX = e.clientX - this.canvas.offsetLeft;
        this.mouseY = e.clientY - this.canvas.offsetTop;
    }

    private handleMouseLeave(e: MouseEvent) {
        if (this.animationFrame !== null) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
            this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        }
    }

    drawTrail() {
        const circleWidth = 10;
        const centerX = this.CANVAS_WIDTH / 2 - circleWidth / 2;

        // const startY = 10;
        const targetY = this.CANVAS_HEIGHT - 10;

        const startOpacity = 1;
        const targetOpacity = 0;

        const duration = 500;
        let startTime = performance.now();

        function loop(this: TrailCanvas, timestamp: number): void {
            if (this.mouseX === null || this.mouseY === null) return;

            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = TimingFunctions.linear(progress);

            const newY = this.mouseY + (targetY - this.mouseY) * easedProgress;
            const newOpacity = startOpacity + (targetOpacity - startOpacity) * easedProgress;

            // this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

            this.ctx.beginPath();
            this.ctx.fillStyle = "#ffffff";
            this.ctx.globalAlpha = newOpacity;
            this.ctx.arc(this.mouseX, newY, circleWidth, 0, 360);
            this.ctx.fill();

            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(loop.bind(this));
            } else {
                startTime = performance.now();
                this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
                this.animationFrame = requestAnimationFrame(loop.bind(this));
            }
        }

        this.animationFrame = requestAnimationFrame(loop.bind(this));
    }

    drawGhost() {
        this.clearCanvas();
    }
}

const trailCanvas = new TrailCanvas("canvas");
// trailCanvas.drawTrail();
