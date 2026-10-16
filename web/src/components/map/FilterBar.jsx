import { FILTERS, CATEGORIES } from "../../utils/categories";

export default function FilterBar({ filter, onChange, counts }) {
  return (
    <div
      role="group"
      aria-label="Nach Kategorie filtern"
      className="flex gap-2 overflow-x-auto rounded-full border border-border bg-background/90 p-1 shadow-lg backdrop-blur"
    >
      {FILTERS.map(({ key, label }) => {
        const active = filter === key;
        const color = CATEGORIES[key]?.color ?? "var(--color-primary)";

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors"
            style={
              active
                ? { background: color, color: "var(--color-white)" }
                : { color: "var(--color-foreground)" }
            }
          >
            {label}
            <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">
              {key === "All" ? counts.total : counts.byCategory[key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}