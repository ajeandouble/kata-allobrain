// eslint-disable-next-line @typescript-eslint/ban-types
export function throttle<T extends Function>(callback: T, delay = 1000) {
    let timerFlag: ReturnType<typeof setTimeout> | null = null;

    return function (this: unknown, ...args: unknown[]) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;
        if (timerFlag === null) {
            callback.apply(context, args);
            timerFlag = setTimeout(() => {
                timerFlag = null;
                clearTimeout(timerFlag);
            }, delay);

        }
    };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function debounce<T extends Function>(callback: T, delay = 1000) {
    let timerFlag: ReturnType<typeof setTimeout> | null = null;

    return function (this: unknown, ...args: unknown[]) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;
        if (timerFlag === null) {
            callback.apply(context, args);
        }
        clearTimeout(timerFlag);
        timerFlag = setTimeout(() => {
            timerFlag = null;
        }, delay);
    };
}