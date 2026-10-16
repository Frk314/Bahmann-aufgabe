import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import AccountButton from "./AccountButton";

// Liens de navigation : un seul endroit à modifier pour ajouter/retirer une page
const NAV_LINKS = [
  { to: "/", label: "Startseite", end: true }, // "end" : évite que "/" soit actif sur toutes les pages
    { to: "/services", label: "Leistungen" },
    { to: "/carte", label: "Karte" },
    { to: "/a-propos", label: "Über uns" },
    ];

    // Style d'un lien desktop selon son état (actif ou non)
    const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-primary ${
        isActive ? "text-primary" : "text-muted"
    }`;

    export default function Header() {
    const [open, setOpen] = useState(false); // état du menu mobile
    const { pathname } = useLocation();
    const user = null; // ou { name: "Marie Dupont", email: "marie@mail.com" }

    // Ferme le menu mobile à chaque changement de page
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Bloque le scroll de la page quand le menu mobile est ouvert
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
        document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
        {/* z-[1100] : Leaflet utilise des z-index jusqu'à 1000 */}
        <header className="sticky top-0 z-[1100] border-b border-border bg-background/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-primary">
                Logo
            </Link>

            {/* Navigation desktop (cachée en dessous de md) */}
            <nav className="hidden items-center gap-8 md:flex" aria-label="Hauptnavigation">
                {NAV_LINKS.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={linkClass}>
                    {label}
                </NavLink>
                ))}
                <Link
                to="/contact"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-primary ring ring-primary transition-opacity hover:bg-primary/10 hover:opacity-90"
                >
                Kontakt
                </Link>
            </nav>

            {/* Zone de droite : avatar + burger (deux éléments séparés) */}
            <div className="flex items-center gap-2">
                <AccountButton user={user} onLogout={() => console.log("logout")} />

                <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="rounded-md p-2 text-foreground md:hidden"
                aria-label={open ? "Menü schließen" : "Menü öffnen"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {open ? (
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    ) : (
                    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
                </button>
            </div>
            </div>
        </header>

        {/* Menu mobile : HORS du <header> pour que "fixed" se base sur l'écran.
            - bg-background/60 : fond semi-transparent
            - backdrop-blur-xl : floute tout ce qui est derrière (la page)
            z-[1099] : juste sous le header, au-dessus de la carte Leaflet */}
        {open && (
            <nav
            id="mobile-menu"
            aria-label="Navigation mobile"
            className="fixed inset-x-0 bottom-0 top-16 z-[1099] flex flex-col gap-1 overflow-y-auto bg-background/60 px-4 py-6 backdrop-blur-xl md:hidden"
            >
            {NAV_LINKS.map(({ to, label, end }) => (
                <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                    `rounded-lg px-3 py-3 text-lg font-medium ${
                    isActive ? "bg-primary/10 text-primary" : "text-foreground"
                    }`
                }
                >
                {label}
                </NavLink>
            ))}

            <Link
                to="/contact"
                className="mt-4 rounded-lg px-4 py-3 text-center text-lg font-semibold text-white ring ring-primary"
            >
                Kontakt
            </Link>
            </nav>
        )}
        </>
    );
    }