import { CATEGORIES } from "../../utils/categories";

export default function Legend({ counts }) {
    return (
        <ul
        aria-label="Legende"
        className="rounded-lg border border-border bg-background/90 px-3 py-2 text-xs shadow-lg backdrop-blur"
        >
        {Object.entries(CATEGORIES).map(([key, { label, color }]) => (
            <li key={key} className="flex items-center gap-2 py-0.5 text-foreground">
            <span
                className="h-3 w-3 rounded-full border border-white"
                style={{ background: color }}
            />
            {label} ({counts.byCategory[key] ?? 0})
            </li>
        ))}
        </ul>
    );
}