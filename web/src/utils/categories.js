// Catégories : les clés correspondent au champ "category" du JSON
export const CATEGORIES = {
  DEXA: { label: "DEXA-Scan", color: "var(--color-dexa)" },
  "Blood Test": { label: "Bluttest", color: "var(--color-lab)" },
};

// Options de la barre de filtre
export const FILTERS = [
  { key: "All", label: "Alle" },
  { key: "DEXA", label: "Nur DEXA" },
  { key: "Blood Test", label: "Nur Blutlabor" },
];

// Libellés des prestations
export const SERVICE_LABELS = {
  body_composition: "Körperzusammensetzung",
  bone_density: "Knochendichte",
  blood_test_self_pay: "Bluttest ohne Überweisung",
};

// Couleur d'un établissement (gris si catégorie inconnue)
export const getColor = (category) => CATEGORIES[category]?.color ?? "#64748b";