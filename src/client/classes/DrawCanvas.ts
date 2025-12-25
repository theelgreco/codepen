interface DrawCanvasOptions {
    width?: number;
    height?: number;
    autoResize?: boolean;
}

/**
 * DrawCanvas is a utility class for managing and drawing on an HTML5 canvas element.
 * It handles device pixel ratio scaling, canvas sizing, and provides basic drawing context setup.
 *
 * @example
 * const drawer = new DrawCanvas('myCanvas', { width: 800, height: 600, autoResize: false });
 * // Use drawer.ctx to draw shapes, lines, etc.
 */
export class DrawCanvas {
    /**
     * The width of the canvas in CSS pixels.
     */
    CANVAS_WIDTH: number;

    /**
     * The height of the canvas in CSS pixels.
     */
    CANVAS_HEIGHT: number;

    /**
     * The radius, typically half the width. Useful for circular drawings.
     */
    RADIUS: number;

    /**
     * The HTMLCanvasElement managed by this class.
     */
    canvas: HTMLCanvasElement;

    /**
     * The 2D rendering context for the canvas.
     */
    ctx: CanvasRenderingContext2D;

    /**
     * The device pixel ratio, used for high-DPI screens.
     */
    dpr: number = window.devicePixelRatio || 1;

    /**
     * Create a new DrawCanvas instance.
     * @param canvasId - The id of the canvas element in the DOM.
     * @param width - The desired width of the canvas in CSS pixels (default: 500).
     * @param height - The desired height of the canvas in CSS pixels (default: 500).
     */
    constructor(canvasId: string, { width = 500, height = 500, autoResize = false }: DrawCanvasOptions = {}) {
        this.CANVAS_WIDTH = width;
        this.CANVAS_HEIGHT = height;
        // Get the canvas element by id
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        // Get the 2D drawing context
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        // Set the radius (half the width)
        this.RADIUS = this.CANVAS_WIDTH / 2;
        // Initialize canvas size and context
        this.setupCanvas();

        if (autoResize) {
            document.addEventListener("resize", this.updateCanvasSize.bind(this));
        }
    }

    /**
     * Set up the canvas element for high-DPI displays and initialize drawing context.
     * This method clears any inline width/height styles, sets the CSS size,
     * adjusts the internal resolution, and scales the context to prevent blurriness.
     * Also resets the line style to default.
     * @protected
     */
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

        // Reset line style to default
        this.resetLine();
    }

    /**
     * Reset the drawing context's line style to default values.
     * Sets line width to 1, stroke style to transparent, and line cap to 'butt'.
     * @protected
     */
    protected resetLine() {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "transparent";
        this.ctx.lineCap = "butt";
    }

    /**
     * Clear the entire canvas.
     * Removes all drawings from the canvas.
     * @protected
     */
    protected clearCanvas() {
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    }

    /**
     * Placeholder for updating the canvas size dynamically.
     * Intended to be implemented in subclasses or future versions.
     * @protected
     */
    protected updateCanvasSize() {
        this.CANVAS_WIDTH = window.innerWidth;
        this.CANVAS_HEIGHT = window.innerHeight;
        this.setupCanvas();
    }
}
