import { DrawCanvas } from "@/classes/DrawCanvas";
import { DIRECTIONS } from "./constants";
import { DrawableMixin, Player } from "./classes";

class GameCanvas extends DrawCanvas {
    elapsed: number = 0;
    objects: DrawableMixin[] = [];

    constructor(canvasId: string) {
        super(canvasId, { width: window.innerWidth, height: window.innerHeight, autoResize: true });
    }

    addObject(obj: DrawableMixin) {
        this.objects.push(obj);
    }

    drawObjects() {
        this.objects.forEach((obj) => {
            obj.draw(this.ctx);
        });
    }

    draw(elapsed: number) {
        this.elapsed = elapsed;
        this.clearCanvas();
        this.drawObjects();
    }
}

function main() {
    const canvas = new GameCanvas("canvas");
    const player = new Player();

    canvas.addObject(player);

    const startTime = performance.now();

    function gameLoop(timestamp: number) {
        const elapsedTime = (timestamp - startTime) / 1000; // Time elapsed since start (ms)

        canvas.draw(elapsedTime);

        player.move(DIRECTIONS.DOWN);

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

// main();
