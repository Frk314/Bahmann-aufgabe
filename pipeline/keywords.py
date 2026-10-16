"""Shared vocabulary for the pipeline (no logic to run on its own).

Used by: data_collection.py (SEARCH_TERMS, build_search_queries)
         fetch_websites.py  (CLASSIFY_PATTERNS, LINK_HINTS)
         classify.py        (CLASSIFY_PATTERNS)

"""
from typing import Dict, List


def build_search_queries(cities: List[str], terms: List[str]) -> List[str]:
    """Build city x term queries without duplicates."""
    queries: List[str] = []
    seen: set[str] = set()

    for city in cities:
        for term in terms:
            query = f"{term} {city}".strip()
            key = query.casefold()
            if key in seen:
                continue
            seen.add(key)
            queries.append(query)

    return queries


SEARCH_TERMS = [
    "DEXA",
    "DXA",
    "Body Composition",
    "Body Fat Analysis",
    "Body Scan",
    "Knochendichte",
    "Osteoporose",
    "Körperfettanalyse",
    "Körperanalyse",
    "Körperzusammensetzung",
    "Muskelmasseanalyse",
    "Fitness Body Analysis",
    "Metabolic Health",
    "Selbstzahler Bluttest",
    "Bluttest ohne Arzt",
    "Bluttest ohne Rezept",
    "Laboranalyse ohne Überweisung",
    "Blood Test without referral",
    "Self-pay blood test",
    "Self-pay lab test",
    "Biochemische Analyse Selbstzahler",
    "Body Composition Scan",
    "Körperanalyse DEXA",
]


# --- Classification vocabulary (used by fetch_websites.py and classify.py) ---
# Regex patterns, matched case-insensitively against website text.
# \b avoids false hits such as "Dexamethason" for "dexa".
CLASSIFY_PATTERNS: Dict[str, List[str]] = {
    "dexa": [r"\bdexa\b", r"\bdxa\b", r"dual[- ]energy x[- ]ray"],
    "body_composition": [
        r"körperzusammensetzung", r"koerperzusammensetzung", r"body[- ]?composition",
        r"körperfett", r"koerperfett", r"body ?fat", r"fettmasse", r"fettanteil", r"fat mass",
        r"muskelmasse", r"magermasse", r"lean mass", r"viszeral",
    ],
    "bone_density": [
        r"knochendichte", r"osteoporose", r"osteodensitometrie", r"bone density", r"bone mineral",
    ],
    # The measurement itself (not just the disease "Osteoporose").
    "bone_scan": [r"knochendichte-? ?messung", r"osteodensitometrie"],
    "blood_test": [
        r"blutuntersuchung", r"bluttest", r"blutabnahme", r"blutbild", r"blutwerte",
        r"blutanalyse", r"laboruntersuchung", r"laborwerte", r"laboranalyse", r"labortest",
        r"laborcheck", r"blood test",
    ],
    "self_pay": [
        r"selbstzahler", r"ohne (?:ärztliche |aerztliche )?überweisung", r"ohne rezept",
        r"self[- ]pay", r"without (?:a )?referral", r"privatleistung", r"auf eigene kosten",
        r"\bigel\b", r"individuelle gesundheitsleistung",
    ],
}

# Subpages worth following from a homepage.
LINK_HINTS = [
    "dexa", "dxa", "knochendichte", "osteo", "körper", "koerper", "body", "labor", "blut",
    "selbstzahler", "igel", "leistung", "angebot", "preis", "check", "service",
]
