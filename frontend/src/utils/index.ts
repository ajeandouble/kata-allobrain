// eslint-disable-next-line @typescript-eslint/ban-types
export function throttle<T extends Function>(callback: T, delay = 1000) {
    let timerFlag: ReturnType<typeof setTimeout> | null = null;

    return function (this: unknown, ...args: unknown[]) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;
        if (timerFlag === null) {
            callback.apply(context, args);
            timerFlag = setTimeout(() => {
                // @ts-expect-error: null incompatible with Timeout type
                clearTimeout(timerFlag);
                timerFlag = null;
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
        // @ts-expect-error: null incompatible with Timeout type
        clearTimeout(timerFlag);
        timerFlag = setTimeout(() => {
            timerFlag = null;
        }, delay);
    };
}
