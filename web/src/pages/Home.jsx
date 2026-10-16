import { Link } from "react-router-dom";
import { MapPin, Activity, Droplets, ArrowRight } from "lucide-react";

const SERVICES = [
    {
        icon: Activity,
        color: "var(--color-dexa)",
        title: "DEXA-Scan zur Körperzusammensetzung",
        text: "Messung von Körperfettanteil, Muskelmasse und Knochendichte.",
    },
    {
        icon: Droplets,
        color: "var(--color-lab)",
        title: "Bluttest als Selbstzahler",
        text: "Labore und Praxen, in denen Sie Ihr Blut ohne Überweisung untersuchen lassen können.",
    },
    ];

    export default function Home() {
    return (
        <>
        {/* Hero */}
        <section className="bg-primary/5">
            <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Ihre Gesundheit, präzise gemessen.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
                Finden Sie mit wenigen Klicks, wo Sie in Deutschland, Österreich und
                der Schweiz einen DEXA-Scan oder einen Bluttest machen können.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                to="/carte"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                >
                <MapPin size={20} /> Zur Karte
                </Link>
                <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                Unsere Leistungen <ArrowRight size={18} />
                </Link>
            </div>
            </div>
        </section>

        {/* Services */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <div className="grid gap-6 md:grid-cols-2">
            {SERVICES.map(({ icon: Icon, color, title, text }) => (
                <article key={title} className="rounded-xl border border-border p-6">
                <span
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-white"
                    style={{ background: color }}
                >
                    <Icon size={24} />
                </span>
                <h2 className="mt-4 text-lg font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-sm text-muted">{text}</p>
                </article>
            ))}
            </div>
        </section>
        </>
    );
}