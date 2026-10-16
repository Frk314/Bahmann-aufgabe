"""Step 4: manual review + export of the final data for the map.

Input:  data/classified.json            (candidates from classify.py)
        data/raw/google_places_raw.json  (coordinates, phone)
        data/review.csv                  (your manual decisions, if it exists)
Output: data/review.csv                  (new candidates appended, decisions kept)
        data/providers.json              (validated against data/schema.json)
"""
import csv
import json
import re
from pathlib import Path
from typing import Dict, Optional

from jsonschema import validate

ROOT = Path(__file__).resolve().parents[1]
CLASSIFIED_INPUT = ROOT / "data" / "classified.json"
PLACES_INPUT = ROOT / "data" / "raw" / "google_places_raw.json"
REVIEW_FILE = ROOT / "data" / "review.csv"
SCHEMA = ROOT / "data" / "schema.json"
OUTPUT = ROOT / "data" / "providers.json"

SCHEMA_VERSION = "1.0"
COUNTRY_CODES = {"Germany": "DE", "Deutschland": "DE", "Austria": "AT", "Österreich": "AT",
                 "Switzerland": "CH", "Schweiz": "CH"}
REVIEW_COLUMNS = ["place_id", "name", "city", "categories", "provider_type", "evidence_url",
                  "verified", "price_note", "note"]
POSTCODE_RE = re.compile(r"(?<=, )\d{4,5}\b")  # right after a comma; DE: 5 digits, AT/CH: 4


def parse_address(formatted: Optional[str]) -> Dict[str, Optional[str]]:
    """Split Google's "Street 1, 12345 City, Country" into street / postal_code / city."""
    result = {"street": None, "postal_code": None, "city": None}
    if not formatted:
        return result

    match = POSTCODE_RE.search(formatted)
    if match:
        result["postal_code"] = match.group(0)
        result["street"] = formatted[:match.start()].strip().rstrip(",") or None
        result["city"] = formatted[match.end():].split(",")[0].strip() or None
    else:
        parts = [p.strip() for p in formatted.split(",") if p.strip()]
        result["street"] = parts[0] if parts else None
        result["city"] = parts[-2] if len(parts) > 2 else None
    return result


def evidence_of(entry: Dict) -> Dict:
    """The evidence that got the entry included (DEXA first, then blood test)."""
    ev = entry["evidence"]
    return ev.get("body_composition") or ev.get("blood_test_self_pay")


def update_review_file(candidates: list) -> Dict[str, Dict]:
    """Append candidates not yet in review.csv; keep all existing decisions.
    Semicolon + UTF-8 BOM so that German Excel opens it correctly."""
    rows: Dict[str, Dict] = {}
    if REVIEW_FILE.exists():
        with REVIEW_FILE.open(encoding="utf-8-sig", newline="") as f:
            rows = {row["place_id"]: row for row in csv.DictReader(f, delimiter=";")}

    new_rows = 0
    for entry in candidates:
        if entry["place_id"] not in rows:
            new_rows += 1
            evidence = evidence_of(entry)
            rows[entry["place_id"]] = {
                "place_id": entry["place_id"],
                "name": entry["name"],
                "city": parse_address(entry["address"])["city"],
                "categories": ",".join(entry["categories"]),
                "provider_type": entry["provider_type"],
                "evidence_url": evidence["url"],
                "verified": "", "price_note": "", "note": "",
            }

    # Only rewrite the file when something was added, so the export also works
    # while review.csv is open in Excel (Excel locks the file).
    if not new_rows:
        return rows

    with REVIEW_FILE.open("w", encoding="utf-8-sig", newline="") as f:
        # extrasaction="ignore": columns removed from REVIEW_COLUMNS (e.g. an old
        # "evidence" column) are dropped instead of raising an error
        writer = csv.DictWriter(f, fieldnames=REVIEW_COLUMNS, delimiter=";", extrasaction="ignore")
        writer.writeheader()
        writer.writerows(sorted(rows.values(), key=lambda r: (r["city"] or "", r["name"])))
    return rows


def to_provider(entry: Dict, place: Dict, review: Dict) -> Dict:
    address = parse_address(entry["address"])
    country = entry["address"].rsplit(",", 1)[-1].strip()
    evidence = evidence_of(entry)
    return {
        "id": entry["place_id"],
        "name": entry["name"],
        # Single main category for the map frontend; DEXA wins if both are offered.
        "category": "DEXA" if "dexa" in entry["categories"] else "Blood Test",
        "categories": entry["categories"],
        "provider_type": entry["provider_type"],
        "services": entry["services"],
        "address": {**address, "country": COUNTRY_CODES.get(country, country)},
        "coordinates": {"lat": place["lat"], "lng": place["lng"]},
        "contact": {"phone": place.get("phone"), "website": entry["website"]},
        "self_pay": True if entry["services"]["blood_test_self_pay"] else None,
        "prices": {"publicly_available": bool(review.get("price_note")), "note": review.get("price_note") or None},
        "source_url": evidence["url"],  # top-level copy, read by the map frontend
        "verification": {
            "verified": review.get("verified", "").strip().lower() == "ja",
            "source_url": evidence["url"],
            "evidence": evidence["text"],
            "note": review.get("note") or None,
        },
    }


def main() -> None:
    classified = json.loads(CLASSIFIED_INPUT.read_text(encoding="utf-8"))
    places = {p["place_id"]: p for p in json.loads(PLACES_INPUT.read_text(encoding="utf-8"))}

    candidates = [e for e in classified if e["included"]]
    reviews = update_review_file(candidates)

    providers = [
        to_provider(e, places[e["place_id"]], reviews[e["place_id"]])
        for e in candidates
        if reviews[e["place_id"]]["verified"].strip().lower() != "nein"
    ]
    data = {"schema_version": SCHEMA_VERSION, "providers": providers}
    validate(data, json.loads(SCHEMA.read_text(encoding="utf-8")))

    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    verified = sum(p["verification"]["verified"] for p in providers)
    print(f"Exported {len(providers)} providers ({verified} verified) to {OUTPUT}")
    print(f"Review file: {REVIEW_FILE} ({len(reviews)} rows)")


if __name__ == "__main__":
    main()
