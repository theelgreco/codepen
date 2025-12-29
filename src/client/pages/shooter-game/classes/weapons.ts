import { GameCanvas } from "../script";
import { Dimension } from "../types";
import { DrawableMixin, type DrawableMixinConstructorOptions } from "./abstract";

export class Weapon implements DrawableMixin {
    canvas: GameCanvas;
    path: Path2D = new Path2D();
    position: Position = { x: 0, y: 0 };
    size: Dimension = { width: 100, height: 100 };
    collidable: boolean = true;

    damage: number = 10;

    constructor(canvas: GameCanvas, { x = 0, y = 0, width = 0, height = 0 }: DrawableMixinConstructorOptions = {}) {
        this.canvas = canvas;
        this.position.x = x;
        this.position.y = y;
        this.size.width = width;
        this.size.height = height;
    }

    draw(): void {}
}
