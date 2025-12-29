import { DrawCanvas } from "@/classes/DrawCanvas";
import { DIRECTIONS } from "./constants";
import { DrawableMixin, Player } from "./classes";
import { Direction, Key, Move } from "./types";

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

    get collidables(): DrawableMixin[] {
        return this.objects.filter((obj) => obj.collidable);
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
     * This checks if the top of obj1 has collided with the bottom of obj2.
     *
     * To find this out, we must check if obj1s top edge is inside obj2s bottom edge vertically
     * AND obj1s bottom edge is not above obj2s top edge
     * AND either of obj1s top corners are inside obj2s bottom edge horizontally OR if either of obj2s bottom corners are inside obj1s top edge horizontally.
     *
     * @returns `boolean` Whether the top side of obj1 has collided with the bottom side of obj2
     */
    static hasCollidedTop(obj1: Move, obj2: DrawableMixin): boolean {
        const obj1LeftSide = obj1.position.x;
        const obj1RightSide = obj1.position.x + obj1.size.width;
        const obj1TopSide = obj1.position.y;
        const obj1BottomSide = obj1.position.y + obj1.size.height;

        const obj2LeftSide = obj2.position.x;
        const obj2RightSide = obj2.position.x + obj2.size.width;
        const obj2TopSide = obj2.position.y;
        const obj2BottomSide = obj2.position.y + obj2.size.height;

        const obj1InsideObj2Vertically = obj1TopSide < obj2BottomSide && obj1BottomSide > obj2TopSide;
        const obj1InsideObj2Horizontally =
            (obj1LeftSide > obj2LeftSide && obj1LeftSide < obj2RightSide) ||
            (obj1RightSide > obj2LeftSide && obj1RightSide < obj2RightSide);
        const obj2InsideObj1Horizontally =
            (obj2LeftSide > obj1LeftSide && obj2LeftSide < obj1RightSide) ||
            (obj2RightSide > obj1LeftSide && obj2RightSide < obj1RightSide);

        return obj1InsideObj2Vertically && (obj1InsideObj2Horizontally || obj2InsideObj1Horizontally);
    }

    /**
     * This checks if the bottom of obj1 has collided with the top of obj2.
     *
     * To find this out, we must check if obj1s bottom edge is inside obj2s top edge vertically
     * AND obj1s bottom edge is not below obj2s bottom edge
     * AND either of obj1s bottom corners are inside obj2s top edge horizontally OR if either of obj2s top corners are inside obj1s bottom edge horizontally.
     *
     * @returns `boolean` Whether the bottom side of obj1 has collided with the top side of obj2
     */
    static hasCollidedBottom(obj1: Move, obj2: DrawableMixin): boolean {
        const obj1LeftSide = obj1.position.x;
        const obj1RightSide = obj1.position.x + obj1.size.width;
        const obj1TopSide = obj1.position.y;
        const obj1BottomSide = obj1.position.y + obj1.size.height;

        const obj2LeftSide = obj2.position.x;
        const obj2RightSide = obj2.position.x + obj2.size.width;
        const obj2TopSide = obj2.position.y;
        const obj2BottomSide = obj2.position.y + obj2.size.height;

        const obj1InsideObj2Vertically = obj1TopSide < obj2BottomSide && obj1BottomSide > obj2TopSide;
        const obj1InsideObj2Horizontally =
            (obj1LeftSide > obj2LeftSide && obj1LeftSide < obj2RightSide) ||
            (obj1RightSide > obj2LeftSide && obj1RightSide < obj2RightSide);
        const obj2InsideObj1Horizontally =
            (obj2LeftSide > obj1LeftSide && obj2LeftSide < obj1RightSide) ||
            (obj2RightSide > obj1LeftSide && obj2RightSide < obj1RightSide);

        return obj1InsideObj2Vertically && (obj1InsideObj2Horizontally || obj2InsideObj1Horizontally);
    }

    /**
     * This checks if the right side of obj1 has collided with the left side of obj2.
     *
     * To find this out, we must check if obj1s right edge is inside obj2s left edge horizontally
     * AND obj1s left edge is not past obj2s right edge
     * AND either of obj1s right corners are inside obj2s left edge vertically OR if either of obj2s left corners are inside obj1s right edge vertically.
     *
     * @returns `boolean` Whether the right side of obj1 has collided with the left side of obj2
     */
    static hasCollidedRight(obj1: Move, obj2: DrawableMixin): boolean {
        const obj1LeftSide = obj1.position.x;
        const obj1RightSide = obj1.position.x + obj1.size.width;
        const obj1TopSide = obj1.position.y;
        const obj1BottomSide = obj1.position.y + obj1.size.height;

        const obj2LeftSide = obj2.position.x;
        const obj2RightSide = obj2.position.x + obj2.size.width;
        const obj2TopSide = obj2.position.y;
        const obj2BottomSide = obj2.position.y + obj2.size.height;

        const obj1InsideObj2Horizontally = obj1RightSide > obj2LeftSide && obj1LeftSide < obj2RightSide;
        const obj1InsideObj2Vertically =
            (obj1TopSide > obj2TopSide && obj1TopSide < obj2BottomSide) ||
            (obj1BottomSide > obj2TopSide && obj1BottomSide < obj2BottomSide);
        const obj2InsideObj1Vertically =
            (obj2TopSide > obj1TopSide && obj2TopSide < obj1BottomSide) ||
            (obj2BottomSide > obj1TopSide && obj2BottomSide < obj1BottomSide);

        return obj1InsideObj2Horizontally && (obj1InsideObj2Vertically || obj2InsideObj1Vertically);
    }

    /**
     * This checks if the left side of obj1 has collided with the right side of obj2.
     *
     * To find this out, we must check if obj1s left edge is inside obj2s right edge horizontally
     * AND obj1s right edge is not past obj2s left edge
     * AND either of obj1s left corners are inside obj2s right edge vertically OR if either of obj2s right corners are inside obj1s left edge vertically.
     *
     * @returns `boolean` Whether the left side of obj1 has collided with the right side of obj2
     */
    static hasCollidedLeft(obj1: Move, obj2: DrawableMixin): boolean {
        const obj1LeftSide = obj1.position.x;
        const obj1RightSide = obj1.position.x + obj1.size.width;
        const obj1TopSide = obj1.position.y;
        const obj1BottomSide = obj1.position.y + obj1.size.height;

        const obj2LeftSide = obj2.position.x;
        const obj2RightSide = obj2.position.x + obj2.size.width;
        const obj2TopSide = obj2.position.y;
        const obj2BottomSide = obj2.position.y + obj2.size.height;

        const obj1InsideObj2Horizontally = obj1RightSide > obj2LeftSide && obj1LeftSide < obj2RightSide;
        const obj1InsideObj2Vertically =
            (obj1TopSide > obj2TopSide && obj1TopSide < obj2BottomSide) ||
            (obj1BottomSide > obj2TopSide && obj1BottomSide < obj2BottomSide);
        const obj2InsideObj1Vertically =
            (obj2TopSide > obj1TopSide && obj2TopSide < obj1BottomSide) ||
            (obj2BottomSide > obj1TopSide && obj2BottomSide < obj1BottomSide);

        return obj1InsideObj2Horizontally && (obj1InsideObj2Vertically || obj2InsideObj1Vertically);
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

    drawObjects() {
        this.objects.forEach((obj) => obj.draw(this.ctx));
    }

    draw(elapsed: number) {
        this.elapsed = elapsed;
        this.clearCanvas();
        this.drawObjects();
    }
}

function main() {
    const canvas = new GameCanvas("canvas");

    const player = new Player(canvas, { x: 250, y: 650, width: 20, height: 20 });
    const player2 = new Player(canvas, { x: 150, y: 150, width: 9, height: 9 });
    const player3 = new Player(canvas, { x: 350, y: 500, width: 300, height: 300 });

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
