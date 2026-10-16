// import { X, MapPin, Phone, Globe, Wallet, Euro, Crosshair } from "lucide-react";
import { CATEGORIES, SERVICE_LABELS, getColor } from "../../utils/categories";
import { X, MapPin, Phone, Globe, Wallet, Euro, Crosshair, Mail, ExternalLink } from "lucide-react";

const yesNo = (v) => (v === true ? "Ja" : v === false ? "Nein" : "Keine Angabe");

export default function DetailsPanel({ provider, onClose }) {
  if (!provider) return null;

  // const { name, category, services, address, coordinates, contact, self_pay, prices } = provider;
  const { name, category, services, address, coordinates, contact, self_pay, prices, source_url } = provider;

  const price = prices?.publicly_available && prices.amount_eur != null
    ? `${prices.amount_eur} €`
    : "Preis auf Anfrage";

  return (
    <aside
      aria-label={`Details zu ${name}`}
      // Mobile : bottom sheet ; desktop (md+) : sidebar à gauche
      className="absolute inset-x-0 bottom-0 z-[1000] max-h-[55%] overflow-y-auto rounded-t-2xl border border-border bg-background p-5 shadow-2xl md:inset-y-0 md:left-0 md:right-auto md:max-h-none md:w-96 md:rounded-none md:rounded-r-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ background: getColor(category) }}
          >
            {CATEGORIES[category]?.label ?? category}
          </span>
          <h2 className="mt-2 text-lg font-bold text-foreground">{name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="rounded-md p-1 text-muted hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      {services?.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {services.map((s) => (
            <li key={s} className="rounded-md bg-primary/10 px-2 py-1 text-xs text-foreground">
              {SERVICE_LABELS[s] ?? s}
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex gap-3">
          <MapPin size={18} className="mt-0.5 shrink-0 text-muted" />
          <dd className="text-foreground">
            {address.street}, {address.postal_code} {address.city}
          </dd>
        </div>

        {contact?.phone && (
          <div className="flex gap-3">
            <Phone size={18} className="mt-0.5 shrink-0 text-muted" />
            <dd>
              <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                {contact.phone}
              </a>
            </dd>
          </div>
        )}

        {contact?.website && (
          <div className="flex gap-3">
            <Globe size={18} className="mt-0.5 shrink-0 text-muted" />
            <dd className="min-w-0 truncate">
              <a
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {contact.website}
              </a>
            </dd>
          </div>
        )}

        <div className="flex gap-3">
          <Wallet size={18} className="mt-0.5 shrink-0 text-muted" />
          <dd className="text-foreground">Selbstzahler: {yesNo(self_pay)}</dd>
        </div>

        <div className="flex gap-3">
          <Euro size={18} className="mt-0.5 shrink-0 text-muted" />
          <dd className="text-foreground">
            {price}
            {prices?.note && <span className="block text-xs text-muted">{prices.note}</span>}
          </dd>
        </div>
        {/* Coordonnée : longitude latiture */}
        <div className="flex gap-3">
          <Crosshair size={18} className="mt-0.5 shrink-0 text-muted" />
          <dd className="text-foreground">
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </dd>
        </div>

        <div className="flex gap-3">
          <Crosshair size={18} className="mt-0.5 shrink-0 text-muted" />
          <dd className="text-foreground">
            {coordinates.lat}, {coordinates.lng}
          </dd>
        </div>

          {/* téléphone */}
        {contact?.email && (
        <div className="flex gap-3">
          <Mail size={18} className="mt-0.5 shrink-0 text-muted" />
          <dd className="min-w-0 truncate">
            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
              {contact.email}
            </a>
          </dd>
        </div>

        
)}
      {source_url?.startsWith("http") && (
        <div className="flex gap-3">
          <ExternalLink size={18} className="mt-0.5 shrink-0 text-muted" />
          <dd>
            <a
              href={source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Quelle ansehen
            </a>
          </dd>
        </div>
      )}
      </dl>
    </aside>
  );
}