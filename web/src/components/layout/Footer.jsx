import { Link } from "react-router-dom";

// Mêmes liens que le Header (vous pouvez les extraire dans constants/navigation.js
// pour n'avoir qu'un seul endroit à modifier)
    const NAV_LINKS = [
    { to: "/", label: "Startseite" },
    { to: "/services", label: "Leistungen" },
    // { to: "/carte", label: "Karte" },
    { to: "/a-propos", label: "Über uns" },
    { to: "/contact", label: "Kontakt" },
    ];

    // Pages légales (obligatoires en Europe : mentions légales, RGPD)
    const LEGAL_LINKS = [
    { to: "/mentions-legales", label: "Impressum" },
    { to: "/confidentialite", label: "Datenschutzerklärung" },
    ];

    // Réseaux sociaux : laissez uniquement ceux que vous utilisez
    const SOCIAL_LINKS = [
    { href: "https://instagram.com/", label: "Instagram" },
    { href: "https://linkedin.com/", label: "LinkedIn" },
    { href: "https://facebook.com/", label: "Facebook" },
    ];

    export default function Footer() {
    // L'année se met à jour automatiquement
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            {/* Grille : 1 colonne sur mobile, 3 colonnes dès md */}
            <div className="grid gap-10 md:grid-cols-3">
            {/* Colonne 1 : marque + description */}
            <div>
                <Link to="/" className="text-xl font-bold text-primary">
                Logo
                </Link>
                <p className="mt-3 max-w-xs text-sm text-muted">
                Persönliches Gesundheitscoaching: DEXA-Scans und Bluttests ohne Überweisung in Ihrer Nähe.
                </p>
            </div>

            {/* Colonne 2 : navigation */}
            <nav aria-label="Fußzeilen-Navigation">
                <h2 className="text-sm font-semibold text-foreground">Navigation</h2>
                <ul className="mt-3 space-y-2">
                {NAV_LINKS.map(({ to, label }) => (
                    <li key={to}>
                    <Link
                        to={to}
                        className="text-sm text-muted transition-colors hover:text-primary"
                    >
                        {label}
                    </Link>
                    </li>
                ))}
                </ul>
            </nav>

            {/* Colonne 3 : contact + réseaux sociaux */}
            <div>
                <h2 className="text-sm font-semibold text-foreground">Kontakt</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>
                    <a
                    href="mailto:contact@gmail.com"
                    className="transition-colors hover:text-primary"
                    >
                    kontakt@beispiel.de
                    </a>
                </li>
                <li>
                    <a
                    href="tel:+000000000000"
                    className="transition-colors hover:text-primary"
                    >
                    +49 0 00 00 00 00
                    </a>
                </li>
                </ul>

                <ul className="mt-4 flex gap-4">
                {SOCIAL_LINKS.map(({ href, label }) => (
                    <li key={label}>
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer" // sécurité pour les liens externes
                        className="text-sm text-muted transition-colors hover:text-primary"
                    >
                        {label}
                    </a>
                    </li>
                ))}
                </ul>
            </div>
            </div>

            {/* Barre du bas : copyright + liens légaux */}
            <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} Coach Santé. Alle Rechte vorbehalten.</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {LEGAL_LINKS.map(({ to, label }) => (
                <li key={to}>
                    <Link to={to} className="transition-colors hover:text-primary">
                    {label}
                    </Link>
                </li>
                ))}
            </ul>
            </div>
        </div>
        </footer>
    );
}