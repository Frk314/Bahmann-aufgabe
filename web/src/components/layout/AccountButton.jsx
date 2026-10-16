import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MapPin, User, Settings, LogOut, LogIn, UserPlus, HelpCircle } from "lucide-react";

// Avatar : photo si disponible, sinon première lettre du nom, sinon icône
function Avatar({ user, size = "h-9 w-9", text = "text-sm" }) {
    const [imgError, setImgError] = useState(false);

    if (user?.avatarUrl && !imgError) {
        return (
        <img
            src={user.avatarUrl}
            alt=""
            onError={() => setImgError(true)} // si l'image ne charge pas → on affiche la lettre
            className={`${size} rounded-full object-cover`}
        />
        );
    }

    return (
        <span className={`${size} ${text} flex items-center justify-center rounded-full bg-primary font-semibold text-white`}>
        {user?.name ? user.name.trim().charAt(0).toUpperCase() : <User size={18} />}
        </span>
    );
    }

    // Ligne de menu réutilisable
    const itemClass =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-primary/10";

    // Props :
    // - user : null si non connecté, sinon { name, email, avatarUrl? }
    // - onLogout : fonction appelée au clic sur "Déconnexion"
    export default function AccountButton({ user = null, onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { pathname } = useLocation();

    // Ferme le panneau à chaque changement de page
    useEffect(() => setOpen(false), [pathname]);

    // Ferme au clic extérieur et avec Échap
    useEffect(() => {
        const onClick = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
        document.removeEventListener("mousedown", onClick);
        document.removeEventListener("keydown", onKey);
        };
    }, []);

    return (
        <div ref={ref} className="relative">
        {/* Bouton avatar (toujours visible, desktop et mobile) */}
        <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Kontomenü"
            aria-haspopup="menu"
            aria-expanded={open}
            className="rounded-full ring-2 ring-transparent transition hover:ring-primary/40 focus-visible:ring-primary"
        >
            <Avatar user={user} />
        </button>

        {open && (
            <div
            role="menu"
            // Mobile : panneau quasi plein largeur sous le header
            // Desktop (sm+) : petite fenêtre ancrée sous l'avatar, à droite
            className="fixed inset-x-2 top-[4.25rem] rounded-xl border border-border bg-background p-2 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-72"
            >
            {/* En-tête du panneau */}
            {user ? (
                <div className="flex items-center gap-3 px-3 py-3">
                <Avatar user={user} size="h-11 w-11" text="text-lg" />
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
                </div>
            ) : (
                <div className="px-3 py-3">
                <p className="text-sm font-semibold text-foreground">Willkommen</p>
                <p className="text-xs text-muted">Melden Sie sich an, um auf Ihren Bereich zuzugreifen.</p>
                </div>
            )}

            <div className="my-1 h-px bg-border" />

            {/* ACCÈS À LA CARTE : mis en avant */}
            <Link to="/carte" role="menuitem" className={`${itemClass} font-semibold text-primary`}>
                <MapPin size={18} /> Anbieterkarte
            </Link>

            <div className="my-1 h-px bg-border" />

            {user ? (
                <>
                <Link to="/compte" role="menuitem" className={itemClass}>
                    <User size={18} /> Mein Profil
                </Link>
                <Link to="/compte/parametres" role="menuitem" className={itemClass}>
                    <Settings size={18} /> Einstellungen
                </Link>
                <Link to="/contact" role="menuitem" className={itemClass}>
                    <HelpCircle size={18} /> Hilfe und Kontakt
                </Link>

                <div className="my-1 h-px bg-border" />

                <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                    setOpen(false);
                    onLogout?.();
                    }}
                    className={`${itemClass} text-lab hover:bg-lab/10`}
                >
                    <LogOut size={18} /> Abmelden
                </button>
                </>
            ) : (
                <>
                {/* <Link to="/connexion" role="menuitem" className={itemClass}>
                    <LogIn size={18} /> Anmelden
                </Link> */}
                {/* <Link to="/inscription" role="menuitem" className={itemClass}>
                    <UserPlus size={18} /> Konto erstellen
                </Link> */}
                <Link to="/contact" role="menuitem" className={itemClass}>
                    <HelpCircle size={18} /> Hilfe und Kontakt
                </Link>
                </>
            )}
            </div>
        )}
        </div>
    );
}