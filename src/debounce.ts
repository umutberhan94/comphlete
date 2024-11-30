export function debounce<T extends (...args: any[]) => any>(func: T, delay: number) {
    let timer: NodeJS.Timeout;
    return (...args: Parameters<T>): Promise<ReturnType<T>> =>
        new Promise((resolve) => {
            clearTimeout(timer);
            timer = setTimeout(() => resolve(func(...args)), delay);
        });
}