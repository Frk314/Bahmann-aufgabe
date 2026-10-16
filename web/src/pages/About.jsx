import { Link } from "react-router-dom";
import { Target, ShieldCheck, Map, MapPin } from "lucide-react";

const VALUES = [
  {
    icon: Target,
    title: "Unsere Mission",
    text: "Gesundheitsmessungen einfach zugänglich machen: finden, wo man einen DEXA-Scan oder einen Bluttest machen kann.",
  },
  {
    icon: ShieldCheck,
    title: "Geprüfte Daten",
    text: "Qualität vor Menge: Jeder Anbieter wird geprüft, bevor er auf der Karte erscheint.",
  },
  {
    icon: Map,
    title: "Ein Überblick",
    text: "Es gab bisher keine zentrale Übersicht für die DACH-Region. Unsere Karte schließt diese Lücke.",
  },
];

export default function About() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Über uns</h1>
        <p className="mt-3 text-muted">
          Wir begleiten Menschen dabei, ihre Gesundheit im Blick zu behalten, mit
          verlässlichen und leicht zugänglichen Messungen.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-xl border border-border p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon size={24} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-sm text-muted">{text}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/carte"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          <MapPin size={20} /> Karte entdecken
        </Link>
      </div>
    </section>
  );
}