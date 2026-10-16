// Convertit un établissement (providers.json OU providers_enriched.json)
// vers le format interne du front. Retourne null si inutilisable.

const SERVICE_KEYS = {
    "Body Composition": "body_composition",
    Knochendichte: "bone_density",
    "Blood Test": "blood_test_self_pay",
    };

    const normalizeServices = (services) => {
    if (Array.isArray(services)) return services;
    if (services && typeof services === "object") {
        return Object.entries(services)
        .filter(([, active]) => active)
        .map(([key]) => SERVICE_KEYS[key] ?? key);
    }
    return [];
    };

    // Catégorie : celle du fichier si valide, sinon déduite des services
    const deriveCategory = (category, services) => {
    if (category === "DEXA" || category === "Blood Test") return category;
    if (services.includes("body_composition")) return "DEXA";
    if (services.includes("blood_test_self_pay")) return "Blood Test";
    return null;
    };

    export default function normalizeProvider(p) {
    const lat = p.coordinates?.lat ?? p.coordinates?.latitude;
    const lng = p.coordinates?.lng ?? p.coordinates?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") return null;

    const services = normalizeServices(p.services);
    const category = deriveCategory(p.category, services);
    if (!category) return null; // jamais affiché sur la carte

    return {
        id: p.id,
        name: p.name,
        category,
        services,
        address: {
        street: p.address?.street ?? "",
        postal_code: p.address?.postal_code ?? "",
        city: p.address?.city ?? "",
        country: p.address?.country ?? "DE",
        },
        region: p.region ?? p.address?.city ?? "",
        coordinates: { lat, lng },
        contact: {
        phone: p.contact?.phone ?? null,
        website: p.contact?.website ?? null,
        email: p.contact?.email ?? p.contact?.mail ?? null,
        },
        self_pay: p.self_pay ?? null,
        prices: {
        publicly_available: p.prices?.publicly_available ?? false,
        amount_eur: p.prices?.amount_eur ?? null,
        note: p.prices?.note ?? null,
        },
        source_url: p.source_url ?? p.provenance?.source ?? null,
    };
}