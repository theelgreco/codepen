import { DrawCanvas } from "@/classes/DrawCanvas";
import { DIRECTIONS } from "./constants";
import { DrawableMixin, Player } from "./classes";
import type { Key, Move } from "./types";

class Controller {
    keys: Key[] = [
        { name: "ArrowUp", pressed: false },
        { name: "ArrowDown", pressed: false },
        { name: "ArrowLeft", pressed: false },
        { name: "ArrowRight", pressed: false },
    ];

    get pressedKeys() {
        return this.keys.filter((key) => key.pressed).map((key) => key.name);
    }

    constructor() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    toggle(keyName: string) {
        const key = this.keys.find((key) => key.name === keyName);
        if (key) key.pressed = !key.pressed;
    }

    press(keyName: string) {
        const key = this.keys.find((key) => key.name === keyName);
        if (key) key.pressed = true;
    }

    unpress(keyName: string) {
        const key = this.keys.find((key) => key.name === keyName);
        if (key) key.pressed = false;
    }

    handleKeyDown(e: KeyboardEvent) {
        this.press(e.key);
    }

    handleKeyUp(e: KeyboardEvent) {
        this.unpress(e.key);
    }
}

export class GameCanvas extends DrawCanvas {
    elapsed: number = 0;
    objects: DrawableMixin[] = [];

    controller = new Controller();

    constructor(canvasId: string) {
        super(canvasId, { width: window.innerWidth, height: window.innerHeight, autoResize: true });
    }

    get collidables(): Move[] {
        return [...Object.values(this.bounds), ...this.objects.filter((obj) => obj.collidable)];
    }

    get bounds(): { [key: string]: Move } {
        return {
            top: { position: { x: -1, y: -1 }, size: { width: this.canvas.width / 2 + 1, height: 1 } },
            right: { position: { x: this.canvas.width / 2 + 1, y: -1 }, size: { width: 1, height: this.canvas.height / 2 + 1 } },
            bottom: { position: { x: -1, y: this.canvas.height / 2 + 1 }, size: { width: this.canvas.width / 2 + 1, height: 1 } },
            left: { position: { x: -1, y: -1 }, size: { width: 1, height: this.canvas.height / 2 + 1 } },
        };
    }

    translate(point: number) {
        return point * this.dpr;
    }

    checkCollisionBounds(obj: DrawableMixin, position: Position): boolean {
        return (
            this.translate(position.x) < 0 ||
            this.translate(position.y) < 0 ||
            this.translate(position.x + obj.size.width) > this.canvas.width ||
            this.translate(position.y + obj.size.height) > this.canvas.height
        );
    }

    /**
     * This checks if the top of move has collided with the bottom of collidable.
     *
     * To find this out, we must check if moves top edge is inside collidables bottom edge vertically
     * AND moves bottom edge is not above collidables top edge
     * AND either of moves top corners are inside collidables bottom edge horizontally OR if either of collidables bottom corners are inside moves top edge horizontally.
     *
     * @returns `boolean` Whether the top side of move has collided with the bottom side of collidable
     */
    static hasCollidedTop(move: Move, collidable: Move): boolean {
        const moveLeftSide = move.position.x;
        const moveRightSide = move.position.x + move.size.width;
        const moveTopSide = move.position.y;
        const moveBottomSide = move.position.y + move.size.height;

        const collidableLeftSide = collidable.position.x;
        const collidableRightSide = collidable.position.x + collidable.size.width;
        const collidableTopSide = collidable.position.y;
        const collidableBottomSide = collidable.position.y + collidable.size.height;

        const moveInsidecollidableVertically = moveTopSide < collidableBottomSide && moveBottomSide > collidableTopSide;
        const moveInsidecollidableHorizontally =
            (moveLeftSide > collidableLeftSide && moveLeftSide < collidableRightSide) ||
            (moveRightSide > collidableLeftSide && moveRightSide < collidableRightSide);
        const collidableInsidemoveHorizontally =
            (collidableLeftSide > moveLeftSide && collidableLeftSide < moveRightSide) ||
            (collidableRightSide > moveLeftSide && collidableRightSide < moveRightSide);

        return moveInsidecollidableVertically && (moveInsidecollidableHorizontally || collidableInsidemoveHorizontally);
    }

    /**
     * This checks if the bottom of move has collided with the top of collidable.
     *
     * To find this out, we must check if moves bottom edge is inside collidables top edge vertically
     * AND moves bottom edge is not below collidables bottom edge
     * AND either of moves bottom corners are inside collidables top edge horizontally OR if either of collidables top corners are inside moves bottom edge horizontally.
     *
     * @returns `boolean` Whether the bottom side of move has collided with the top side of collidable
     */
    static hasCollidedBottom(move: Move, collidable: Move): boolean {
        const moveLeftSide = move.position.x;
        const moveRightSide = move.position.x + move.size.width;
        const moveTopSide = move.position.y;
        const moveBottomSide = move.position.y + move.size.height;

        const collidableLeftSide = collidable.position.x;
        const collidableRightSide = collidable.position.x + collidable.size.width;
        const collidableTopSide = collidable.position.y;
        const collidableBottomSide = collidable.position.y + collidable.size.height;

        const moveInsidecollidableVertically = moveTopSide < collidableBottomSide && moveBottomSide > collidableTopSide;
        const moveInsidecollidableHorizontally =
            (moveLeftSide > collidableLeftSide && moveLeftSide < collidableRightSide) ||
            (moveRightSide > collidableLeftSide && moveRightSide < collidableRightSide);
        const collidableInsidemoveHorizontally =
            (collidableLeftSide > moveLeftSide && collidableLeftSide < moveRightSide) ||
            (collidableRightSide > moveLeftSide && collidableRightSide < moveRightSide);

        return moveInsidecollidableVertically && (moveInsidecollidableHorizontally || collidableInsidemoveHorizontally);
    }

    /**
     * This checks if the right side of move has collided with the left side of collidable.
     *
     * To find this out, we must check if moves right edge is inside collidables left edge horizontally
     * AND moves left edge is not past collidables right edge
     * AND either of moves right corners are inside collidables left edge vertically OR if either of collidables left corners are inside moves right edge vertically.
     *
     * @returns `boolean` Whether the right side of move has collided with the left side of collidable
     */
    static hasCollidedRight(move: Move, collidable: Move): boolean {
        const moveLeftSide = move.position.x;
        const moveRightSide = move.position.x + move.size.width;
        const moveTopSide = move.position.y;
        const moveBottomSide = move.position.y + move.size.height;

        const collidableLeftSide = collidable.position.x;
        const collidableRightSide = collidable.position.x + collidable.size.width;
        const collidableTopSide = collidable.position.y;
        const collidableBottomSide = collidable.position.y + collidable.size.height;

        const moveInsidecollidableHorizontally = moveRightSide > collidableLeftSide && moveLeftSide < collidableRightSide;
        const moveInsidecollidableVertically =
            (moveTopSide > collidableTopSide && moveTopSide < collidableBottomSide) ||
            (moveBottomSide > collidableTopSide && moveBottomSide < collidableBottomSide);
        const collidableInsidemoveVertically =
            (collidableTopSide > moveTopSide && collidableTopSide < moveBottomSide) ||
            (collidableBottomSide > moveTopSide && collidableBottomSide < moveBottomSide);

        return moveInsidecollidableHorizontally && (moveInsidecollidableVertically || collidableInsidemoveVertically);
    }

    /**
     * This checks if the left side of move has collided with the right side of collidable.
     *
     * To find this out, we must check if moves left edge is inside collidables right edge horizontally
     * AND moves right edge is not past collidables left edge
     * AND either of moves left corners are inside collidables right edge vertically OR if either of collidables right corners are inside moves left edge vertically.
     *
     * @returns `boolean` Whether the left side of move has collided with the right side of collidable
     */
    static hasCollidedLeft(move: Move, collidable: Move): boolean {
        const moveLeftSide = move.position.x;
        const moveRightSide = move.position.x + move.size.width;
        const moveTopSide = move.position.y;
        const moveBottomSide = move.position.y + move.size.height;

        const collidableLeftSide = collidable.position.x;
        const collidableRightSide = collidable.position.x + collidable.size.width;
        const collidableTopSide = collidable.position.y;
        const collidableBottomSide = collidable.position.y + collidable.size.height;

        const moveInsidecollidableHorizontally = moveRightSide > collidableLeftSide && moveLeftSide < collidableRightSide;
        const moveInsidecollidableVertically =
            (moveTopSide > collidableTopSide && moveTopSide < collidableBottomSide) ||
            (moveBottomSide > collidableTopSide && moveBottomSide < collidableBottomSide);
        const collidableInsidemoveVertically =
            (collidableTopSide > moveTopSide && collidableTopSide < moveBottomSide) ||
            (collidableBottomSide > moveTopSide && collidableBottomSide < moveBottomSide);

        return moveInsidecollidableHorizontally && (moveInsidecollidableVertically || collidableInsidemoveVertically);
    }

    getTopCollisions(obj: Move) {
        return this.collidables
            .filter((collidable) => collidable !== obj)
            .find((collidable) => {
                return GameCanvas.hasCollidedTop(obj, collidable);
            });
    }

    getBottomCollisions(obj: Move) {
        return this.collidables
            .filter((collidable) => collidable !== obj)
            .find((collidable) => {
                return GameCanvas.hasCollidedBottom(obj, collidable);
            });
    }

    getRightCollisions(obj: Move) {
        return this.collidables
            .filter((collidable) => collidable !== obj)
            .find((collidable) => {
                return GameCanvas.hasCollidedRight(obj, collidable);
            });
    }

    getLeftCollisions(obj: Move) {
        return this.collidables
            .filter((collidable) => collidable !== obj)
            .find((collidable) => {
                return GameCanvas.hasCollidedLeft(obj, collidable);
            });
    }

    addObject(obj: DrawableMixin) {
        this.objects.push(obj);
    }

    removeObject(obj: DrawableMixin) {
        const indexToRemove = this.objects.findIndex((_obj) => _obj === obj);
        if (indexToRemove > -1) this.objects.splice(indexToRemove, 1);
    }

    drawObjects() {
        this.objects.forEach((obj) => obj.draw());
    }

    draw(elapsed: number) {
        this.elapsed = elapsed;
        this.clearCanvas();
        this.drawObjects();
    }
}

function main() {
    const canvas = new GameCanvas("canvas");

    const player = new Player(canvas, { x: 450, y: canvas.CANVAS_HEIGHT - 500, width: 20, height: 20 });
    const player2 = new Player(canvas, { x: 150, y: 150, width: 9, height: 9 });
    const player3 = new Player(canvas, { x: 350, y: 0, width: 300, height: 300 });

    canvas.addObject(player);
    canvas.addObject(player2);
    canvas.addObject(player3);

    const startTime = performance.now();

    // const gamepad = navigator.getGamepads().filter((gp) => gp)[0]!;

    function gameLoop(timestamp: number) {
        const elapsedTime = (timestamp - startTime) / 1000; // Time elapsed since start (ms)

        canvas.draw(elapsedTime);

        if (canvas.controller.pressedKeys.includes("ArrowUp")) player.move(DIRECTIONS.UP);
        if (canvas.controller.pressedKeys.includes("ArrowDown")) player.move(DIRECTIONS.DOWN);
        if (canvas.controller.pressedKeys.includes("ArrowLeft")) player.move(DIRECTIONS.LEFT);
        if (canvas.controller.pressedKeys.includes("ArrowRight")) player.move(DIRECTIONS.RIGHT);

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

main();
