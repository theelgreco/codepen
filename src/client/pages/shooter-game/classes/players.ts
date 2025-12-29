import { DIRECTIONS, HEALTH_LEVELS } from "../constants";
import { GameCanvas } from "../script";
import type { Corners, Dimension, Direction, HealthLevel, Move, Position } from "../types";
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

    draw(): void {
        this.path = new Path2D();
        this.path.rect(this.position.x, this.position.y, this.size.width, this.size.height);
        this.canvas.ctx.fillStyle = "white";
        this.canvas.ctx.fill(this.path);
    }

    move(direction: Direction): void {
        let collidedObj: Move | undefined = undefined;
        let newX: number | null = null;
        let newY: number | null = null;
        let move: Move | null = null;

        switch (direction) {
            case DIRECTIONS.UP:
                newY = this.position.y - this.speed;
                move = { size: { width: this.size.width, height: this.position.y - newY }, position: { x: this.position.x, y: newY } };
                collidedObj = this.canvas.getTopCollisions(move);

                if (collidedObj) this.position.y = collidedObj.position.y + collidedObj.size.height;
                else this.position.y = newY;

                break;
            case DIRECTIONS.DOWN:
                newY = this.position.y + this.speed;
                move = {
                    size: { width: this.size.width, height: newY - this.position.y + this.size.height },
                    position: { x: this.position.x, y: this.position.y + this.size.height },
                };
                collidedObj = this.canvas.getBottomCollisions(move);

                if (collidedObj) this.position.y = collidedObj.position.y - this.size.height;
                else this.position.y = newY;

                break;
            case DIRECTIONS.LEFT:
                newX = this.position.x - this.speed;
                move = {
                    size: { width: this.position.x - newX, height: this.size.height },
                    position: { x: newX, y: this.position.y },
                };
                collidedObj = this.canvas.getLeftCollisions(move);

                if (collidedObj) this.position.x = collidedObj.position.x + collidedObj.size.width;
                else this.position.x = newX;

                break;
            case DIRECTIONS.RIGHT:
                newX = this.position.x + this.speed;
                move = {
                    size: { width: newX - this.position.x, height: this.size.height },
                    position: { x: this.position.x + this.size.width, y: this.position.y },
                };
                collidedObj = this.canvas.getRightCollisions(move);

                if (collidedObj) this.position.x = collidedObj.position.x - this.size.width;
                else this.position.x = newX;

                break;
        }
    }
}
