export class TimingFunctions {
    static linear(x: number) {
        return x;
    }

    static easeInOutQuad(x: number) {
        return x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x;
    }

    static easeInSine(x: number) {
        return 1 - Math.cos((x * Math.PI) / 2);
    }

    static easeOutSine(x: number) {
        return Math.sin((x * Math.PI) / 2);
    }

    static easeInExpo(x: number) {
        return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
    }

    static easeInCirc(x: number) {
        return 1 - Math.sqrt(1 - Math.pow(x, 2));
    }

    static easeInElastic(x: number) {
        const c4 = (2 * Math.PI) / 3;
        return x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
    }
}
