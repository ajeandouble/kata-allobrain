// eslint-disable-next-line @typescript-eslint/ban-types
export function throttle<T extends Function>(mainFunction: T, delay = 1000) {
    let timerFlag: ReturnType<typeof setTimeout> | null = null;

    return function (this: unknown, ...args: unknown[]) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;

        if (timerFlag === null) {
            mainFunction.apply(context, args);
            timerFlag = setTimeout(() => {
                timerFlag = null;
                clearTimeout;
            }, delay);
        }
    };
}
