import { DIRECTIONS, HEALTH_LEVELS } from "../constants";
import type { Dimension, Direction, HealthLevel } from "../types";
import { DrawableMixin } from "./abstract";

export class Player implements DrawableMixin {
    path: Path2D = new Path2D();
    position: Position = { x: 0, y: 0 };
    size: Dimension = { width: 100, height: 100 };

    health: number = 100;
    speed: number = 3;

    get isDead(): boolean {
        return this.health <= 0;
    }

    get healthLevel(): HealthLevel {
        if (this.health >= 70) return HEALTH_LEVELS.HIGH;
        if (this.health >= 40) return HEALTH_LEVELS.MEDIUM;
        return HEALTH_LEVELS.LOW;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.path = new Path2D();
        this.path.rect(this.position.x, this.position.y, this.size.width, this.size.height);
        ctx.fillStyle = "white";
        ctx.fill(this.path);
    }

    move(direction: Direction): void {
        switch (direction) {
            case DIRECTIONS.UP:
                this.position.y -= this.speed;
                break;
            case DIRECTIONS.DOWN:
                this.position.y += this.speed;
                break;
            case DIRECTIONS.LEFT:
                this.position.x += this.speed;
                break;
            case DIRECTIONS.RIGHT:
                this.position.x -= this.speed;
                break;
            default:
                throw new TypeError("Invalid direction");
        }
    }
}
