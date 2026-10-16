import { Palette, RotateCcw } from "lucide-react";
import { useState } from "react";
import useCategoryColors from "../../hooks/useCategoryColors";

const ITEMS = [
  { key: "dexa", label: "DEXA-Scan" },
  { key: "lab", label: "Bluttest" },
];

export default function ColorSettings() {
  const { colors, setColor, reset } = useCategoryColors();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-background/90 text-xs shadow-lg backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-foreground"
      >
        <Palette size={14} /> Farben
      </button>

      {open && (
        <div className="space-y-2 border-t border-border px-3 py-2">
          {ITEMS.map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between gap-3 text-foreground">
              {label}
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => setColor(key, e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
            </label>
          ))}
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 text-muted hover:text-foreground"
          >
            <RotateCcw size={12} /> Zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
}