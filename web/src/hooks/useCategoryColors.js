import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "category-colors";
const DEFAULTS = { dexa: "#2563eb", lab: "#16a34a" };

// Applique les couleurs aux variables CSS
const apply = (colors) => {
    const root = document.documentElement.style;
    root.setProperty("--color-dexa", colors.dexa);
    root.setProperty("--color-lab", colors.lab);
    };

    export default function useCategoryColors() {
    const [colors, setColors] = useState(() => {
        try {
        return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
        } catch {
        return DEFAULTS;
        }
    });

    useEffect(() => {
        apply(colors);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    }, [colors]);

    const setColor = useCallback(
        (key, value) => setColors((c) => ({ ...c, [key]: value })),
        []
    );
    const reset = useCallback(() => setColors(DEFAULTS), []);

    return { colors, setColor, reset };
}