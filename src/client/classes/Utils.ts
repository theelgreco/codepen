export class Utils {
    static async sleep(time: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, time);
        });
    }

    /**
     * A function to convert degrees to radians.
     * Calculated as (angle * π) / 180
     * @param degrees number
     */
    static degreesToRadians(degrees: number) {
        return (degrees * Math.PI) / 180;
    }

    /**
     * A function to convert radians to degrees.
     * Calculated as radians * (180/π)
     * @param radians number
     */
    static radiansToDegrees(radians: number) {
        return radians * (180 / Math.PI);
    }
}
