export function throttle(func, delay) {
    let lastTime = 0;

    return function (...args) {
        const now = new Date().getTime();
        if (now - lastTime >= delay) {
            lastTime = now;
            func(...args);
        }
    };
}
