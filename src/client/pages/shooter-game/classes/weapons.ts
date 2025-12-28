import { Dimension } from "../types";
import { DrawableMixin } from "./abstract";

export class Weapon implements DrawableMixin {
    path: Path2D = new Path2D();
    position: Position = { x: 0, y: 0 };
    size: Dimension = { width: 100, height: 100 };
    collidable: boolean = true;

    damage: number = 10;

    draw(ctx: CanvasRenderingContext2D): void {}
}