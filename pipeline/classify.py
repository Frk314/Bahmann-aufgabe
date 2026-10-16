"""Step 3: We decide for every Google Places candidate whether it belongs on the map.

Input:  data/raw/google_places_raw.json  (candidates)
        data/raw/websites.json           (keyword passages from fetch_websites.py)
Output: data/classified.json             (every candidate + decision + evidence)

Rules (the core data-quality decision of the project):
- DEXA body composition: "DEXA"/"DXA" AND a body-composition term (Körperfett,
  Muskelmasse, ...) within PROXIMITY characters of each other. Requiring both close
  together is what separates real body-comp scans from bone-density-only practices.
- Bone density only: DEXA near a bone term (Knochendichte, Osteoporose, ...) or the
  measurement named explicitly (Knochendichtemessung, Osteodensitometrie), but no
  body-composition evidence. Recorded as a service; such a provider is NOT included.
- Self-pay blood test: a blood/lab term AND a self-pay term (Selbstzahler, ohne
  Überweisung, IGeL, ...) within PROXIMITY characters of each other, and no DEXA /
  bone-density term in that window (radiology sites mention "Blutwerte" next to a
  self-pay bone scan). Google must list the place as a health business (filters out
  supermarkets, gyms, shops) and not as a pharmacy (their menus list "Laborwerte A-Z").
- Only places in Germany are considered.
- provider_type: "lab" if Google lists it as medical_lab or the name says Labor/Lab,
  otherwise "practice" (e.g. a GP offering self-pay blood tests as IGeL).
"""
import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Dict, List, Optional

from keywords import CLASSIFY_PATTERNS

ROOT = Path(__file__).resolve().parents[1]
PLACES_INPUT = ROOT / "data" / "raw" / "google_places_raw.json"
WEBSITES_INPUT = ROOT / "data" / "raw" / "websites.json"
OUTPUT = ROOT / "data" / "classified.json"

PATTERNS = {name: re.compile("|".join(p), re.IGNORECASE) for name, p in CLASSIFY_PATTERNS.items()}
HEALTH_TYPES = {"health", "doctor", "medical_lab", "medical_clinic", "medical_center", "hospital"}
EXCLUDED_BLOOD_TYPES = {"pharmacy", "drugstore"}
DACH_COUNTRIES = ("Germany", "Deutschland", "Austria", "Österreich", "Switzerland", "Schweiz")
PROXIMITY = 300  # max. characters between the two terms of a rule
EVIDENCE_RADIUS = 200
LAB_NAME = re.compile(r"labor|\blab\b|laboratori", re.IGNORECASE)


def find_evidence(
    passages: List[Dict], first: str, second: Optional[str] = None, exclude: List[str] = ()
) -> Optional[Dict]:
    """First hit of pattern `first` with a hit of `second` within PROXIMITY chars (if given)
    and none of the `exclude` patterns in that window."""
    for passage in passages:
        text = passage["text"]
        for match in PATTERNS[first].finditer(text):
            nearby = text[max(0, match.start() - PROXIMITY):match.end() + PROXIMITY]
            if second and not PATTERNS[second].search(nearby):
                continue
            if any(PATTERNS[name].search(nearby) for name in exclude):
                continue
            start = max(0, match.start() - EVIDENCE_RADIUS)
            return {"url": passage["url"], "text": text[start:match.end() + EVIDENCE_RADIUS].strip()}
    return None


def classify(place: Dict, site: Optional[Dict]) -> Dict:
    # The Google name counts as a passage too ("DEXA Body Scan Berlin").
    passages = [{"url": place.get("url"), "text": place.get("name") or ""}]
    if site:
        passages += [{"url": page["url"], "text": s} for page in site["pages"] for s in page["snippets"]]

    evidence = {
        "body_composition": find_evidence(passages, "dexa", "body_composition"),
        "bone_density": find_evidence(passages, "dexa", "bone_density") or find_evidence(passages, "bone_scan"),
        "blood_test_self_pay": find_evidence(passages, "blood_test", "self_pay", exclude=["dexa", "bone_density"]),
    }
    types = set(place.get("types") or [])
    if not HEALTH_TYPES & types or EXCLUDED_BLOOD_TYPES & types:
        evidence["blood_test_self_pay"] = None

    in_dach = (place.get("address") or "").endswith(DACH_COUNTRIES)

    categories = []
    if evidence["body_composition"]:
        categories.append("dexa")
    if evidence["blood_test_self_pay"]:
        categories.append("blood_lab")

    if not in_dach:
        categories, reason = [], "outside_dach"
    elif categories:
        reason = "included"
    elif not place.get("website"):
        reason = "no_website"
    elif site and site["error"]:
        reason = "website_unreachable"
    elif evidence["bone_density"]:
        reason = "bone_density_only"
    else:
        reason = "no_matching_service"

    return {
        "place_id": place["place_id"],
        "name": place.get("name"),
        "address": place.get("address"),
        "website": place.get("website"),
        "google_types": place.get("types"),
        "included": bool(categories),
        "categories": categories,
        "provider_type": "lab" if "medical_lab" in types or LAB_NAME.search(place.get("name") or "") else "practice",
        "services": {name: found is not None for name, found in evidence.items()},
        "reason": reason,
        "evidence": {name: found for name, found in evidence.items() if found},
    }


def main(places_path: Path, websites_path: Path, output_path: Path) -> None:
    places = json.loads(places_path.read_text(encoding="utf-8"))
    websites = json.loads(websites_path.read_text(encoding="utf-8"))

    results = [classify(place, websites.get(place.get("website"))) for place in places]
    output_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Classified {len(results)} candidates -> {output_path}")
    for reason, count in Counter(r["reason"] for r in results).most_common():
        print(f"  {reason:22} {count}")
    included = [r for r in results if r["included"]]
    print(f"  dexa: {sum('dexa' in r['categories'] for r in included)}, "
          f"blood_lab: {sum('blood_lab' in r['categories'] for r in included)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Classify candidates into DEXA body composition / self-pay blood lab.")
    parser.add_argument("--places", type=Path, default=PLACES_INPUT)
    parser.add_argument("--websites", type=Path, default=WEBSITES_INPUT)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    args = parser.parse_args()
    main(args.places, args.websites, args.output)
