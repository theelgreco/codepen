import { TimingFunctions } from "@/classes/TimingFunctions";
import { DrawCanvas } from "@/classes/DrawCanvas";

interface DrawChartOptions {
    points: number[][];
    totalDuration: number;
    timingFunction: (x: number) => number;
}

class LineChartCanvas extends DrawCanvas {
    CANVAS_WIDTH = 500;
    CANVAS_HEIGHT = 500;

    mouseX: number = 0;
    mouseY: number = 0;
    chartPoints: number[][] = [];
    segment: number[][] = [];
    segmentIndex: number = -1;

    constructor(canvasId: string) {
        super(canvasId);
        this.initialiseEventListeners();
    }

    private setMousePosition(e: MouseEvent) {
        const mouseX = e.clientX - this.canvas.offsetLeft;
        const mouseY = e.clientY - this.canvas.offsetTop;

        if (mouseX < 0) {
            this.mouseX = 0;
        } else if (mouseX > this.CANVAS_WIDTH) {
            this.mouseX = this.CANVAS_WIDTH;
        } else {
            this.mouseX = mouseX;
        }

        if (mouseY < 0) {
            this.mouseY = 0;
        } else if (mouseY > this.CANVAS_HEIGHT) {
            this.mouseY = this.CANVAS_HEIGHT;
        } else {
            this.mouseY = mouseY;
        }
    }

    private initialiseEventListeners() {
        this.canvas.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
    }

    private handleMouseEnter(e: MouseEvent) {
        this.setMousePosition(e);
    }

    private handleMouseMove(e: MouseEvent) {
        this.setMousePosition(e);

        const { segment, segmentIndex } = this.figureOutSegment();

        if (this.segmentIndex !== segmentIndex) {
            this.segment = segment;
            this.segmentIndex = segmentIndex;
            this.redrawChart();
            this.drawBoxAroundSegment();
        }

        // if (this.mouseX === this.segment[0][0]) {
        //     this.redrawChart();
        //     this.drawBoxAroundSegment();
        //     this.drawVerticalLine();
        // }
    }

    private handleMouseLeave(e: MouseEvent) {
        this.redrawChart();
        this.mouseX = 0;
        this.mouseY = 0;
        this.segment = [];
        this.segmentIndex = -1;
    }

    private figureOutSegment() {
        for (let i = 0; i < this.chartPoints.length - 1; i++) {
            const point = this.chartPoints[i];
            const nextPoint = this.chartPoints[i + 1];

            if (this.mouseX >= point[0] && this.mouseX < nextPoint[0]) {
                const segment = [point, nextPoint];
                const segmentIndex = i;

                return { segment, segmentIndex };
            }
        }

        return { segment: this.segment, segmentIndex: this.segmentIndex };
    }

    private drawBoxAroundSegment() {
        const [bottomLeftX, bottomLeftY] = this.segment[0]; // This is the starting point of the segment
        const [topRightX, topRightY] = this.segment[1]; // This is the ending point segment
        const [topLeftX, topLeftY] = [this.segment[0][0], this.segment[1][1]]; // This is the top left corner of the box
        const [bottomRightX, bottomRightY] = [this.segment[1][0], this.segment[0][1]]; // this is the bottom right corner of the box

        this.resetLine();
        this.ctx.strokeStyle = "#d60e0e";
        this.ctx.fillStyle = "#d60e0e5c";

        this.ctx.beginPath();
        this.ctx.moveTo(topLeftX, topLeftY);
        this.ctx.lineTo(topRightX, topRightY);
        this.ctx.lineTo(bottomRightX, bottomRightY);
        this.ctx.lineTo(bottomLeftX, bottomLeftY);
        this.ctx.lineTo(topLeftX, topLeftY);
        this.ctx.stroke();
        this.ctx.fill();
    }

    private drawVerticalLine() {
        this.resetLine();
        this.ctx.strokeStyle = "#0ed66e";

        this.ctx.beginPath();
        this.ctx.moveTo(this.mouseX, this.CANVAS_HEIGHT);
        this.ctx.lineTo(this.mouseX, 0);
        this.ctx.stroke();
    }

    private hasIntersected() {
        const TOLERANCE = 0.2;
        const [bottomLeftX, bottomLeftY] = this.segment[0]; // This is the starting point of the segment
        const [topRightX, topRightY] = this.segment[1]; // This is the ending point segment

        const slope = (topRightY - bottomLeftY) / (topRightX - bottomLeftX);
        const mouseSlope = (this.mouseY - bottomLeftY) / (this.mouseX - bottomLeftX);

        return Math.abs(slope - mouseSlope) < TOLERANCE;
    }

    private redrawChart() {
        // Chart
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        this.resetLine();
        this.ctx.beginPath();

        const gradient = this.ctx.createLinearGradient(0, 0, 0, 520);
        gradient.addColorStop(0, "#03fe035c");
        gradient.addColorStop(1, "black");

        // Chart Line
        for (let i = 0; i < this.chartPoints.length; i++) {
            const currentX = this.chartPoints[i][0];
            const currentY = this.chartPoints[i][1];

            this.ctx.strokeStyle = "#03fe03";
            this.ctx.lineWidth = 2;

            this.ctx.lineTo(currentX, currentY);
            this.ctx.stroke();
        }

        // Chart Fill
        this.resetLine();
        this.ctx.fillStyle = gradient;
        this.ctx.lineTo(500, 500);
        this.ctx.lineTo(0, 500);
        this.ctx.fill();
    }

    drawChart({ points, totalDuration, timingFunction }: DrawChartOptions) {
        this.chartPoints = points;
        const duration = totalDuration / (this.chartPoints.length - 1);

        let counter = 0;

        // Initialize with the first point
        let startValue = this.chartPoints[counter];
        let targetValue = this.chartPoints[counter + 1] || this.chartPoints[counter];

        let startTime = performance.now();

        // Initialise context
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.resetLine();
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 520);
        gradient.addColorStop(0, "#03fe035c");
        gradient.addColorStop(1, "black");

        function loop(this: LineChartCanvas, timestamp: number): void {
            const elapsed: number = timestamp - startTime;
            const progress: number = Math.min(elapsed / duration, 1);
            const easedProgress: number = timingFunction(progress);

            // Use subpixel coordinates for smooth lines
            const newX: number = startValue[0] + (targetValue[0] - startValue[0]) * easedProgress;
            const newY: number = startValue[1] + (targetValue[1] - startValue[1]) * easedProgress;

            // Clear the canvas to prevent overlapping artifacts
            this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

            // Draw the entire line up to the current point as a single path
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#03fe03";
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(this.chartPoints[0][0], this.chartPoints[0][1]); // Start at the first point

            // Draw all completed segments
            for (let i: number = 1; i <= counter; i++) {
                this.ctx.lineTo(this.chartPoints[i][0], this.chartPoints[i][1]);
            }

            // Draw the current animating segment
            if (counter < this.chartPoints.length - 1) {
                this.ctx.lineTo(newX, newY);
            }

            this.ctx.stroke();
            this.resetLine();

            // Use integer coordinates for the fill to avoid artifacts
            const fillX: number = Math.round(newX);
            const fillY: number = Math.round(newY);

            // Draw the filled area
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(this.chartPoints[0][0], this.chartPoints[0][1]); // Start at the first point

            for (let i: number = 1; i <= counter; i++) {
                this.ctx.lineTo(this.chartPoints[i][0], this.chartPoints[i][1]);
            }

            if (counter < this.chartPoints.length - 1) {
                this.ctx.lineTo(fillX, fillY);
            }

            this.ctx.lineTo(fillX, 500);
            this.ctx.lineTo(this.chartPoints[0][0], 500);
            this.ctx.closePath();
            this.ctx.fill();

            // Check if the current segment is complete
            if (progress >= 1 && counter < this.chartPoints.length - 1) {
                counter += 1;
                startValue = this.chartPoints[counter];
                targetValue = this.chartPoints[counter + 1] || this.chartPoints[counter];
                startTime = performance.now(); // Reset startTime for the new segment
            }

            // Continue the animation if there are more points or the current segment isn't done
            if (progress < 1 || counter < this.chartPoints.length - 1) {
                requestAnimationFrame(loop.bind(this));
            }
        }

        requestAnimationFrame(loop.bind(this));
    }
}

const points = [
    [0, 400],
    [50, 350],
    [150, 300],
    [250, 200],
    [400, 350],
    [450, 300],
    [475, 220],
    [500, 240],
];

const chartCanvas = new LineChartCanvas("canvas");

const options: DrawChartOptions = {
    points,
    timingFunction: TimingFunctions.linear,
    totalDuration: 1000,
};

chartCanvas.drawChart(options);
