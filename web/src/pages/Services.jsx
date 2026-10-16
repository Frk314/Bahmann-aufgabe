import { Link } from "react-router-dom";
import { Activity, Droplets, Check, MapPin } from "lucide-react";

const SERVICES = [
    {
        icon: Activity,
        color: "var(--color-dexa)",
        title: "DEXA-Scan zur Körperzusammensetzung",
        text: "Ganzkörper-Röntgenmessung mit sehr niedriger Strahlendosis, die Ihre Körperzusammensetzung präzise bestimmt.",
        points: [
        "Körperfettanteil",
        "Muskelmasse",
        "Knochendichte",
        ],
        note: "Achtung: Nicht jede Praxis mit DEXA bietet Body Composition an, viele messen nur die Knochendichte.",
    },
    {
        icon: Droplets,
        color: "var(--color-lab)",
        title: "Bluttest als Selbstzahler",
        text: "Blutuntersuchungen im Labor ohne ärztliche Überweisung, Sie bezahlen direkt.",
        points: [
        "Keine Überweisung nötig",
        "Direkte Bezahlung",
        "Ergebnisse zur Kontrolle Ihrer Gesundheit",
        ],
        note: "Die Preise hängen vom Labor und den gewählten Untersuchungen ab.",
    },
    ];

    export default function Services() {
    return (
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Unsere Leistungen</h1>
            <p className="mt-3 text-muted">
            Zwei Leistungen, um Ihre Gesundheit zu messen und zu verfolgen, und die
            Karte, um Anbieter in Ihrer Nähe zu finden.
            </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
            {SERVICES.map(({ icon: Icon, color, title, text, points, note }) => (
            <article key={title} className="flex flex-col rounded-xl border border-border p-6">
                <span
                className="flex h-12 w-12 items-center justify-center rounded-lg text-white"
                style={{ background: color }}
                >
                <Icon size={24} />
                </span>
                <h2 className="mt-4 text-xl font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-sm text-muted">{text}</p>

                <ul className="mt-4 space-y-2">
                {points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-foreground">
                    <Check size={16} style={{ color }} /> {p}
                    </li>
                ))}
                </ul>

                <p className="mt-4 rounded-lg bg-primary/5 p-3 text-xs text-muted">{note}</p>
            </article>
            ))}
        </div>

        <div className="mt-12 text-center">
            <Link
            to="/carte"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
            <MapPin size={20} /> Anbieter finden
            </Link>
        </div>
        </section>
    );
}