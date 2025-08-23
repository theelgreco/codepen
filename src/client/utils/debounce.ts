namespace Debounce {
    export type Func = (...args: any[]) => void;
    export type Wait = number;
}

export function debounce(func: Debounce.Func, wait: Debounce.Wait) {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function (...args: any[]) {
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

export function throttle(func: Debounce.Func, wait: Debounce.Wait) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastExecuted = 0;

    return function (...args: any[]) {
        const now = performance.now();

        if (timeout) {
            clearTimeout(timeout);
        }

        if (!lastExecuted || now - lastExecuted >= wait) {
            func(...args);
            lastExecuted = now;
        }
    };
}

export class Debounce {
    timeout: ReturnType<typeof setTimeout> | null = null;
    lastExecuted = 0;
    func: Debounce.Func;
    wait: Debounce.Wait;

    constructor(func: Debounce.Func, wait: Debounce.Wait) {
        this.func = func;
        this.wait = wait;
    }

    debounced(...args: any[]) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.func(...args);
        }, this.wait);
    }
}
