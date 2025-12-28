import { DIRECTIONS, HEALTH_LEVELS } from "../constants";
import { GameCanvas } from "../script";
import type { Corners, Dimension, Direction, HealthLevel, Position } from "../types";
import { DrawableMixin, DrawableMixinConstructorOptions } from "./abstract";

export class Player implements DrawableMixin {
    canvas: GameCanvas;

    path: Path2D = new Path2D();
    position: Position = { x: 0, y: 0 };
    size: Dimension = { width: 0, height: 0 };
    collidable: boolean = true;

    health: number = 100;
    speed: number = 10;

    constructor(canvas: GameCanvas, { x = 0, y = 0, width = 0, height = 0 }: DrawableMixinConstructorOptions = {}) {
        this.canvas = canvas;
        this.position.x = x;
        this.position.y = y;
        this.size.width = width;
        this.size.height = height;
    }

    get isDead(): boolean {
        return this.health <= 0;
    }

    get healthLevel(): HealthLevel {
        if (this.health >= 70) return HEALTH_LEVELS.HIGH;
        if (this.health >= 40) return HEALTH_LEVELS.MEDIUM;
        return HEALTH_LEVELS.LOW;
    }

    get corners(): Corners {
        return {
            topLeft: { x: this.position.x, y: this.position.y },
            topRight: { x: this.position.x + this.size.width, y: this.position.y },
            bottomRight: { x: this.position.x + this.size.width, y: this.position.y + this.size.height },
            bottomLeft: { x: this.position.x, y: this.position.y + this.size.height },
        };
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.path = new Path2D();
        this.path.rect(this.position.x, this.position.y, this.size.width, this.size.height);
        ctx.fillStyle = "white";
        ctx.fill(this.path);
    }

    move(direction: Direction): void {
        let collidedObj: DrawableMixin | undefined = undefined;

        switch (direction) {
            case DIRECTIONS.UP:
                this.position.y -= this.speed;
                collidedObj = this.canvas.getTopCollisions(this);
                if (collidedObj) this.position.y = collidedObj.position.y + collidedObj.size.height;
                break;
            case DIRECTIONS.DOWN:
                this.position.y += this.speed;
                collidedObj = this.canvas.getTopCollisions(this);
                if (collidedObj) this.position.y = collidedObj.position.y - this.size.height;
                break;
            case DIRECTIONS.LEFT:
                this.position.x -= this.speed;
                collidedObj = this.canvas.getLeftCollisions(this);
                if (collidedObj) this.position.x = collidedObj.position.x + collidedObj.size.width;
                break;
            case DIRECTIONS.RIGHT:
                this.position.x += this.speed;
                collidedObj = this.canvas.getRightCollisions(this);
                if (collidedObj) this.position.x = collidedObj.position.x - this.size.width;
                break;
        }
    }
}
