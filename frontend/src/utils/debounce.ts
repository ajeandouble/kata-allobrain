// eslint-disable-next-line @typescript-eslint/ban-types
export default function debounce<T extends Function>(func: T, timeout = 300) {
    let timer: number;
    return (...args: unknown[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), timeout);
    };
}
