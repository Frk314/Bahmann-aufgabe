import { Link, useNavigate } from "react-router-dom";
import { Home, MapPin, ArrowLeft } from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <section className="mx-auto flex misn-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        {/* Gros "404" décoratif */}
        <p className="text-8xl font-extrabold tracking-tight text-primary sm:text-9xl">
            404
        </p>

        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            Seite nicht gefunden
        </h1>
        <p className="mt-3 max-w-md text-muted">
            Die gesuchte Seite existiert nicht, wurde verschoben oder die Adresse
            ist fehlerhaft.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
            <Home size={18} /> Zur Startseite
            </Link>

            {/* <Link
            to="/carte"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
            <MapPin size={18} /> Zur Karte
            </Link> */}

            {/* navigate(-1) = revient à la page précédente dans l'historique */}
            <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-muted transition-colors hover:text-primary"
            >
            <ArrowLeft size={18} /> Zurück
            </button>
        </div>
        </section>
    );
}