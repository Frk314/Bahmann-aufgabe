import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// Sujets proposés dans la liste déroulante
const SUBJECTS = [
    "Persönliches Gesundheitscoaching",
    // "Anbieterkarte",
    "Partnerschaft / Anbieter hinzufügen",
    "DEXA-Scan",
    "Sonstige Anfrage",
    ];

    const INITIAL = { name: "", email: "", subject: SUBJECTS[0], message: "", website: "" };

    // Coordonnées affichées à gauche : à remplacer par les vôtres
    const CONTACT_INFO = [
    { icon: Mail, label: "E-Mail", value: "kontakt@beispiel.de", href: "mailto:contact@gmail.com" },
    { icon: Phone, label: "Telefon", value: "+49 0 00 00 00 00", href: "tel:+490000000000" },
    { icon: MapPin, label: "Adresse", value: "Unsere Adresse, Hannover, Deutschland" },
    ];

    // Validation simple côté client
    function validate(values) {
    const errors = {};
    if (values.name.trim().length < 2) errors.name = "Bitte geben Sie Ihren Namen ein.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Ungültige E-Mail-Adresse.";
    if (values.message.trim().length < 10) errors.message = "Ihre Nachricht ist zu kurz (mindestens 10 Zeichen).";
    return errors;
    }

    // Classes communes aux champs (rouge si erreur)
    const fieldClass = (hasError) =>
    `mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 ${
        hasError ? "border-lab" : "border-border"
    }`;

    export default function Contact() {
    const [values, setValues] = useState(INITIAL);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [consent, setConsent] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((v) => ({ ...v, [name]: value }));
        // Efface l'erreur du champ dès que l'utilisateur modifie
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Anti-spam : le champ "website" est invisible, seuls les robots le remplissent
        if (values.website) return;

        const found = validate(values);
        if (!consent) found.consent = "Bitte stimmen Sie der Verarbeitung Ihrer Daten zu.";
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setStatus("loading");
        try {
        // TODO : remplacez par votre vrai backend (API, Supabase, Formspree, EmailJS...)
        const res = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            name: values.name,
            email: values.email,
            subject: values.subject,
            message: values.message,
            }),
        });
        if (!res.ok) throw new Error("Erreur serveur");

        setStatus("success");
        setValues(INITIAL);
        setConsent(false);
        } catch {
        setStatus("error");
        }
    };

    return (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {/* En-tête */}
        <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Kontakt</h1>
            <p className="mt-3 text-muted">
            Sie haben eine Frage zu unserem Coaching oder zur Karte? Schreiben Sie uns,
            wir antworten schnell.
            </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-5">
            {/* Colonne gauche : coordonnées */}
            <aside className="space-y-6 lg:col-span-2">
            {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={20} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    {href ? (
                    <a href={href} className="text-sm text-muted transition-colors hover:text-primary">
                        {value}
                    </a>
                    ) : (
                    <p className="text-sm text-muted">{value}</p>
                    )}
                </div>
                </div>
            ))}
            </aside>

            {/* Colonne droite : formulaire */}
            <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5 rounded-xl border border-border bg-background p-6 shadow-sm lg:col-span-3"
            >
            {/* Champ piège anti-spam (invisible pour les humains) */}
            <input
                type="text"
                name="website"
                value={values.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
            />

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Ihr Name"
                    aria-invalid={!!errors.name}
                    className={fieldClass(errors.name)}
                />
                {errors.name && <p className="mt-1 text-xs text-lab">{errors.name}</p>}
                </div>

                <div>
                <label htmlFor="email" className="text-sm font-medium text-foreground">E-Mail</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="sie@beispiel.de"
                    aria-invalid={!!errors.email}
                    className={fieldClass(errors.email)}
                />
                {errors.email && <p className="mt-1 text-xs text-lab">{errors.email}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="subject" className="text-sm font-medium text-foreground">Betreff</label>
                <select
                id="subject"
                name="subject"
                value={values.subject}
                onChange={handleChange}
                className={fieldClass(false)}
                >
                {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                ))}
                </select>
            </div>

            <div>
                <label htmlFor="message" className="text-sm font-medium text-foreground">Nachricht</label>
                <textarea
                id="message"
                name="message"
                rows={6}
                value={values.message}
                onChange={handleChange}
                placeholder="Wie können wir Ihnen helfen?"
                aria-invalid={!!errors.message}
                className={fieldClass(errors.message)}
                />
                {errors.message && <p className="mt-1 text-xs text-lab">{errors.message}</p>}
            </div>

            {/* Consentement RGPD */}
            <div>
                <label className="flex items-start gap-3 text-sm text-muted">
                <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                    setConsent(e.target.checked);
                    if (errors.consent) setErrors((er) => ({ ...er, consent: undefined }));
                    }}
                    className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span>
                    Ich bin damit einverstanden, dass meine Daten zur Beantwortung meiner Anfrage verwendet werden.
                </span>
                </label>
                {errors.consent && <p className="mt-1 text-xs text-lab">{errors.consent}</p>}
            </div>

            {/* Messages de statut */}
            {status === "success" && (
                <div role="status" className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
                <CheckCircle2 size={18} /> Nachricht gesendet! Wir melden uns in Kürze.
                </div>
            )}
            {status === "error" && (
                <div role="alert" className="flex items-center gap-2 rounded-lg bg-lab/10 px-4 py-3 text-sm text-lab">
                <AlertCircle size={18} /> Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt per E-Mail.
                </div>
            )}

            <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
                {status === "loading" ? (
                <><Loader2 size={18} className="animate-spin" /> Wird gesendet...</>
                ) : (
                <><Send size={18} /> Nachricht senden</>
                )}
            </button>
            </form>
        </div>
        </section>
    );
}