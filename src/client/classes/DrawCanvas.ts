export class DrawCanvas {
    CANVAS_WIDTH: number;
    CANVAS_HEIGHT: number;
    RADIUS: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    dpr: number = window.devicePixelRatio || 1;

    constructor(canvasId: string, width: number = 500, height: number = 500) {
        this.CANVAS_WIDTH = width;
        this.CANVAS_HEIGHT = height;
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.RADIUS = this.CANVAS_WIDTH / 2;
        this.setupCanvas();
    }

    protected setupCanvas() {
        // Clear existing inline styles
        this.canvas.style.removeProperty("width");
        this.canvas.style.removeProperty("height");

        // Set CSS size (visible size in the browser)
        this.canvas.style.setProperty("width", `${this.CANVAS_WIDTH}px`);
        this.canvas.style.setProperty("height", `${this.CANVAS_HEIGHT}px`);

        // Set internal resolution (drawing buffer)
        this.canvas.width = this.CANVAS_WIDTH * this.dpr;
        this.canvas.height = this.CANVAS_HEIGHT * this.dpr;

        // Scale the context to prevent blurry drawing
        this.ctx.scale(this.dpr, this.dpr);

        this.resetLine();
    }

    protected resetLine() {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "transparent";
        this.ctx.lineCap = "butt";
    }

    protected clearCanvas() {
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    }

    protected updateCanvasSize() {}
}
