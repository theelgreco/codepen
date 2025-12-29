import { GameCanvas } from "../script";
import { Dimension } from "../types";

export interface DrawableMixinConstructorOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

export abstract class DrawableMixin {
    canvas: GameCanvas;
    path: Path2D = new Path2D();
    position: Position = { x: 0, y: 0 };
    size: Dimension = { width: 0, height: 0 };
    collidable: boolean = false;
    constructor(canvas: GameCanvas, { x = 0, y = 0, width = 0, height = 0 }: DrawableMixinConstructorOptions = {}) {
        this.canvas = canvas;
        this.position.x = x;
        this.position.y = y;
        this.size.width = width;
        this.size.height = height;
    }
    draw() {}
}
