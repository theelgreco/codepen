class Physics {
    static GRAVITY = 9.81;

    /**
     * Returns a number of pixels based on a given distance in meters and a Pixel to Meter Ratio.
     * i.e if meters = 10 and pmr = 100, the function returns 1000 (pixels).
     * @param meters number - The number in meters.
     * @param pmr number - Pixel to Meter Ratio - default 100.
     * @returns number - The number of pixels.
     */
    static meterToPixel(meters: number, pmr = 100) {
        return meters * 100;
    }

    /**
     * Gets an object's distance fallen (in meters) based on the time it has been falling.
     * The equation is 0.5 * gravity * time²
     * @param time number - the time passed (in seconds)
     * @returns number - the distance fallen after a certain time (in meters)
     */
    static distanceFallen(time: number, asPixels = true): number {
        const gravity = asPixels ? Physics.meterToPixel(Physics.GRAVITY) : Physics.GRAVITY;
        return 0.5 * gravity * time ** 2;
    }

    /**
     * Returns an objects vertical position
     * given an initial speed and the time that has passed since the start of the movement.
     * @param initialSpeed number - The initial speed of the object. in units/s e.g 10 (m/s).
     * @param time number - The time that has passed since the beginning of the movement (in seconds).
     * @param asPixels boolean - If true, the returned number will be in pixels, else meters - default true.
     * @returns number - The vertical (y) position of the object.
     */
    static getVerticalPosition(initialSpeed: number, time: number, height = 0, slamForce = 0, asPixels = true) {
        const gravity = asPixels ? Physics.meterToPixel(Physics.GRAVITY) : Physics.GRAVITY;

        return initialSpeed * time - 0.5 * (gravity + slamForce) * time ** 2 + height;
    }
}

interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface Cell {
    column: number;
    row: number;
}

class SpriteSheet {
    columns: number = 0;
    rows: number = 0;
    cellSize: Size = { width: 0, height: 0 };
    cell: Cell = { column: 0, row: 0 };

    constructor(columns: number, rows: number, cellSize: Size) {
        this.columns = columns;
        this.rows = rows;
        this.cellSize = cellSize;
    }

    get cellPosition(): Position {
        return { x: this.cell.row * this.cellSize.width, y: this.cell.column * this.cellSize.height };
    }
}

class Player {
    id: string | null = null;
    private _element: HTMLDivElement | null = null;
    private _styles: CSSStyleDeclaration | null = null;
    private _game: Game | null = null;
    spriteSheet: SpriteSheet = new SpriteSheet(8, 8, { width: 128, height: 128 });
    jumpSpeed: number = Physics.meterToPixel(8);
    jumpCount: number = 0;
    ascending: boolean = false;
    jumping: boolean = false;
    maxJumps: number = Infinity;

    animations = {
        jump: -1,
        slam: -1,
    };

    moving = {
        left: false,
        right: false,
        down: false,
    };

    constructor(playerId: string) {
        this.id = playerId;
    }

    get element(): HTMLDivElement {
        if (!this.id) throw new Error("Player ID is unset! Please set one to get started.");

        if (this._element === null) this._element = document.getElementById(this.id) as HTMLDivElement;

        return this._element;
    }

    get styles(): CSSStyleDeclaration {
        if (this._styles === null) this._styles = getComputedStyle(this.element);

        return this._styles;
    }

    get game(): Game {
        if (this._game === null) throw new Error("No game set!");

        return this._game;
    }

    set game(value: Game) {
        this._game = value;
    }

    get position(): Position {
        const { x, bottom } = this.element.getBoundingClientRect();
        return { x, y: window.innerHeight - bottom };
    }

    set position(pos: Partial<Position>) {
        if (pos.x !== undefined) {
            this.element.style.setProperty("--sprite-x", `${pos.x}px`);
        }

        if (pos.y !== undefined) {
            this.element.style.setProperty("--sprite-y", `${pos.y}px`);
        }
    }

    get size(): Size {
        const { height, width } = this.element.getBoundingClientRect();
        return { height, width };
    }

    set backgroundPosition(cell: Partial<Cell>) {
        if (cell.row !== undefined) {
            this.spriteSheet.cell.row = cell.row;
            this.element.style.setProperty("--sprite-bg-x", `-${this.spriteSheet.cellPosition.x}px`);
        }

        if (cell.column !== undefined) {
            this.spriteSheet.cell.column = cell.column;
            this.element.style.setProperty("--sprite-bg-y", `-${this.spriteSheet.cellPosition.y}px`);
        }
    }

    get onGround(): boolean {
        return this.position.y === 0;
    }

    moveBackgroundPositionBy(cell: Partial<Cell>) {
        if (cell.column) {
            if (cell.column > this.spriteSheet.columns - 1 || cell.column < 0) {
                throw new Error(`Out of bounds! Must be between 0 - ${this.spriteSheet.columns}`);
            }

            this.spriteSheet.cell.column += cell.column;
        }

        if (cell.row) {
            if (cell.row > this.spriteSheet.columns - 1 || cell.row < 0) {
                throw new Error(`Out of bounds! Must be between 0 - ${this.spriteSheet.columns}`);
            }

            this.spriteSheet.cell.row += cell.row;
        }

        this.backgroundPosition = this.spriteSheet.cell;
    }

    moveBy(pos: Partial<Position>) {
        if (pos.x) {
            this.element.style.setProperty("--sprite-x", `${this.position.x + pos.x}px`);
        }

        if (pos.y) {
            this.element.style.setProperty("--sprite-y", `${this.position.y + pos.y}px`);
        }
    }

    jump() {
        if (this.jumpCount >= this.maxJumps) return;
        console.log("start");

        let _jumpCount = ++this.jumpCount;

        let id = -1;

        let currentHeight: number = 0;
        let previousY: number | null = null;

        this.ascending = true;
        this.jumping = true;

        if (this.jumpCount > 0) currentHeight = this.position.y;

        const startTime = performance.now();
        let descendingStartTime: number | null = null;

        function loop(this: Player, timestamp: number) {
            if (this.jumpCount !== _jumpCount) {
                console.log("here");
                return cancelAnimationFrame(this.animations.jump);
            }

            console.log("hereee");

            const elapsedMS = timestamp - startTime; // in ms
            const elapsedS = Math.max(elapsedMS / 1000, 0.0001); // in s

            const newY = Physics.getVerticalPosition(this.jumpSpeed, elapsedS, currentHeight);

            if (previousY !== null && previousY > newY && this.ascending) {
                descendingStartTime = timestamp;
                this.ascending = false;
                this.backgroundPosition = { column: 3, row: 2 };
            }

            if (descendingStartTime !== null) {
                const descendingElapsed = timestamp - descendingStartTime;

                if (descendingElapsed > 100) {
                    descendingStartTime = timestamp;
                    this.backgroundPosition = this.spriteSheet.cell.row === 2 ? { row: 3 } : { row: 2 };
                }
            }

            if (newY > 0) {
                this.position = { y: newY };
                this.animations.jump = requestAnimationFrame(loop.bind(this));
            } else {
                this.onLanded();
            }

            previousY = newY;
        }

        this.animations.jump, (id = requestAnimationFrame(loop.bind(this)));
    }

    slam() {
        const startTime = performance.now();

        function loop(this: Player, timestamp: number) {}

        requestAnimationFrame(loop.bind(this));
    }

    onLanded() {
        this.ascending = false;
        this.jumping = false;
        this.jumpCount = 0;
        this.backgroundPosition = { column: 0, row: 0 };
        this.position = { y: 0 };
        this.cancelJump();
        this.cancelSlam();
    }

    cancelJump() {
        cancelAnimationFrame(this.animations.jump);
        this.animations.jump = -1;
    }

    cancelSlam() {
        cancelAnimationFrame(this.animations.slam);
        this.animations.slam = -1;
    }
}

class Game {
    private player = new Player("player");

    constructor() {
        this.player.game = this;
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    private update() {
        let id = -1;

        const startTime = performance.now();

        function loop(this: Game, timestamp: number) {
            if (this.player.moving.right && this.player.position.x < window.innerWidth - this.player.size.width) {
                this.player.moveBy({ x: 10 });
            }

            if (this.player.moving.left && this.player.position.x > 0) {
                this.player.moveBy({ x: -10 });
            }

            id = requestAnimationFrame(loop.bind(this));
        }

        id = requestAnimationFrame(loop.bind(this));
    }

    private onKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowUp" && this.player.onGround) {
            this.player.backgroundPosition = { column: 3, row: 0 };
        }

        if (e.key === "ArrowRight") {
            this.player.moving.right = true;
        }

        if (e.key === "ArrowLeft") {
            this.player.moving.left = true;
        }

        if (e.key === "ArrowDown") {
            this.player.moving.down = true;
            this.player.slam();
        }
    }

    private onKeyUp(e: KeyboardEvent) {
        if (e.key === "ArrowUp") {
            if (this.player.jumpCount <= this.player.maxJumps) {
                this.player.backgroundPosition = { column: 3, row: 1 };
                this.player.jump();
            }
        }

        if (e.key === "ArrowRight") {
            this.player.moving.right = false;
        }

        if (e.key === "ArrowLeft") {
            this.player.moving.left = false;
        }

        if (e.key === "ArrowDown") {
            this.player.moving.down = false;
        }
    }

    start() {
        this.update();
    }
}

const game = new Game();
game.start();
