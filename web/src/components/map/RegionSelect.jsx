import { MapPinned } from "lucide-react";

export default function RegionSelect({ region, regions, onChange }) {
    return (
        <label className="flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-2 text-sm shadow-lg backdrop-blur">
        <MapPinned size={16} className="text-muted" />
        <span className="sr-only">Region</span>
        <select
            value={region}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent font-medium text-foreground outline-none"
        >
            <option value="All">Gesamte DACH-Region</option>
            {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
            ))}
        </select>
        </label>
    );
}