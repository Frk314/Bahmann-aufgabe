"""Step 1: collect provider candidates from the Google Places API (New).

Input:  GOOGLE_MAPS_API_KEY             (environment variable)
        keywords.py                     (search terms; cities are listed below)
Output: data/raw/google_places_raw.json (one entry per unique place, unfiltered)

Every search term is combined with every city ("DEXA Hannover", ...) and sent to
the Text Search endpoint, biased to a 50 km circle around the city. Results are
de-duplicated by place_id. The filtering happens later, in classify.py.
A run that collects nothing does not overwrite earlier results.
"""
import json
import os
from pathlib import Path
from typing import Dict, List, Set

from keywords import SEARCH_TERMS, build_search_queries

import requests

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
OUTPUT_PATH = RAW_DIR / "google_places_raw.json"

API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

FIELD_MASK = (
    "id,displayName,formattedAddress,location,types,"
    "internationalPhoneNumber,websiteUri,googleMapsUri"
)
SEARCH_FIELD_MASK = (
    "places.id,places.displayName,places.formattedAddress,places.location,places.types,"
    "places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri"
)

CITY_TO_SEARCH = {
    "Berlin": {"lat": 52.5200, "lng": 13.4050},
    "Hamburg": {"lat": 53.5511, "lng": 9.9937},
    "München": {"lat": 48.1351, "lng": 11.5820},
    "Köln": {"lat": 50.9375, "lng": 6.9603},
    "Frankfurt": {"lat": 50.1109, "lng": 8.6821},
    "Stuttgart": {"lat": 48.7758, "lng": 9.1829},
    "Düsseldorf": {"lat": 51.2277, "lng": 6.7735},
    "Bremen": {"lat": 53.0793, "lng": 8.8017},
    "Hannover": {"lat": 52.3759, "lng": 9.7320},
    "Nürnberg": {"lat": 49.4521, "lng": 11.0767},
    "Dresden": {"lat": 51.0504, "lng": 13.7373},
    "Leipzig": {"lat": 51.3397, "lng": 12.3731},
    "Bonn": {"lat": 50.7374, "lng": 7.0982},
    "Aachen": {"lat": 50.7753, "lng": 6.0839},
    "Mannheim": {"lat": 49.4875, "lng": 8.4660},
    "Erfurt": {"lat": 50.9848, "lng": 11.0299},
    "Kassel": {"lat": 51.3128, "lng": 9.4797},
    "Potsdam": {"lat": 52.3906, "lng": 13.0645},
    "Magdeburg": {"lat": 52.1205, "lng": 11.6276},
    "Rostock": {"lat": 54.0924, "lng": 12.0991},
    "Wiesbaden": {"lat": 50.0782, "lng": 8.2398},
}

CITIES = list(CITY_TO_SEARCH.keys())
SEARCH_QUERIES = build_search_queries(CITIES, SEARCH_TERMS)



def places_headers() -> Dict[str, str]:
    """Return required headers for Places API (New)."""
    if not API_KEY:
        raise RuntimeError("GOOGLE_MAPS_API_KEY is missing. Add it to your environment before running this script.")

    return {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": FIELD_MASK,
    }


def search_places_headers() -> Dict[str, str]:
    """Header for the searchText endpoint; the field mask uses the places.* prefix."""
    if not API_KEY:
        raise RuntimeError("GOOGLE_MAPS_API_KEY is missing. Add it to your environment before running this script.")

    return {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": SEARCH_FIELD_MASK,
    }


def get_city_bias(city_name: str) -> Dict[str, float]:
    """Centre of the search circle for a city; Hannover is the fallback."""
    return CITY_TO_SEARCH.get(city_name, {"lat": 52.3759, "lng": 9.7320})


def search_places(query: str, city: str = "Hannover", radius_meters: int = 50000) -> List[Dict]:
    """Use Places API (New) Text Search instead of the legacy textsearch endpoint."""
    cities = get_city_bias(city)

    payload = {
        "textQuery": query,
        "maxResultCount": 20,
        "locationBias": {
            "circle": {
                "center": {
                    "latitude": cities["lat"],
                    "longitude": cities["lng"],
                },
                "radius": float(radius_meters),
            }
        },
    }

    response = requests.post(
        "https://places.googleapis.com/v1/places:searchText",
        headers=search_places_headers(),
        json=payload,
        timeout=20,
    )

    if response.status_code != 200:
        print(f"Google Places API error for query '{query}': {response.status_code} - {response.text[:500]}")
        return []

    data = response.json()
    return data.get("places", [])


def fetch_place_details(place_id: str) -> Dict:
    """Fetch additional place data using Places API (New) details endpoint."""
    url = f"https://places.googleapis.com/v1/places/{place_id}"
    response = requests.get(url, headers=places_headers(), timeout=20)

    if response.status_code != 200:
        print(f"Place details failed for {place_id}: {response.status_code} - {response.text[:500]}")
        return {}

    return response.json()


def collect_google_places() -> List[Dict]:
    """Collect a broader set of provider candidates; filter later for relevance."""
    all_results: List[Dict] = []
    seen_place_ids: Set[str] = set()

    for query in SEARCH_QUERIES:
        city = "Hannover"
        for known_city in CITY_TO_SEARCH:
            if known_city.lower() in query.lower():
                city = known_city
                break

        try:
            found = search_places(query, city=city, radius_meters=50000)
        except Exception as exc:
            print(f"Search failed for query '{query}': {exc}")
            continue

        for item in found:
            place_id = item.get("id")
            if not place_id or place_id in seen_place_ids:
                continue

            seen_place_ids.add(place_id)

            # The search field mask already returns every field we need,
            # so no separate (billed) details call per place.
            display_name = item.get("displayName") or {}
            name = display_name.get("text") if isinstance(display_name, dict) else display_name
            location = item.get("location") or {}

            result = {
                "query": query,
                "name": name,
                "place_id": place_id,
                "address": item.get("formattedAddress"),
                "lat": location.get("latitude"),
                "lng": location.get("longitude"),
                "types": item.get("types"),
                "phone": item.get("internationalPhoneNumber"),
                "website": item.get("websiteUri"),
                "url": item.get("googleMapsUri"),
                "raw": item,
            }
            all_results.append(result)

    return all_results


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    results = collect_google_places()
    if not results:
        # Never replace earlier data with an empty list (e.g. invalid key, no network).
        print(f"No results collected - keeping the existing {OUTPUT_PATH.name}")
        return

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(results)} Google Places API (New) candidates to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
