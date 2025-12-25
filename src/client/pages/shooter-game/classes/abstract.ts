import { Dimension } from "../types";

export abstract class DrawableMixin {
    path: Path2D = new Path2D();
    position: Position = { x: 0, y: 0 };
    size: Dimension = { width: 0, height: 0 };
    draw(ctx: CanvasRenderingContext2D) {}
}
