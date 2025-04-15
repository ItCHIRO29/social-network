"use client"

import { useState, useCallback } from "react";

export default function useDebounce() {
    const [lastTime, setLastTime] = useState(null);

    const debounce = useCallback((callback, time) => {
        const now = Date.now();

        if (!lastTime || now - lastTime >= time) {
            callback();
            setLastTime(now);
        }
    }, [lastTime]);

    return debounce;
}
