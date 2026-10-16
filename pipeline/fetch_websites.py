"""Step 2: download provider websites and keep only the text passages that matter.
(This is neccessary because some sites are huge and we don't want to store them all, 
also directly fetching leads to blockages by some sites. )

Input:  data/raw/google_places_raw.json (website URL per candidate)
        keywords.py                     (CLASSIFY_PATTERNS, LINK_HINTS)
Output: data/raw/websites.json          (per website: pages + keyword passages, or error)

For each website from the Google Places results we load the homepage plus up to
MAX_SUBPAGES internal links that look relevant (e.g. "/leistungen/dexa").
Instead of storing whole pages we store short passages around keyword hits,
together with the page URL. This keeps the file small and gives classify.py
evidence it can show for every decision.

Results are cached per website URL in data/raw/websites.json, so the script can
be stopped and re-run; already fetched sites are skipped. --retry-errors fetches
the failed ones again (useful after network dropouts).
"""
import argparse
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from keywords import CLASSIFY_PATTERNS, LINK_HINTS

ROOT = Path(__file__).resolve().parents[1]
RAW_INPUT = ROOT / "data" / "raw" / "google_places_raw.json"
OUTPUT = ROOT / "data" / "raw" / "websites.json"

REQUEST_HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; laborsuche-research/1.0)"}
MAX_SUBPAGES = 5
SNIPPET_RADIUS = 250  # characters kept on each side of a keyword hit
MAX_SNIPPETS_PER_PAGE = 15

ANY_KEYWORD = re.compile("|".join(p for patterns in CLASSIFY_PATTERNS.values() for p in patterns), re.IGNORECASE)


def get_html(url: str) -> bytes:
    response = requests.get(url, headers=REQUEST_HEADERS, timeout=10)
    response.raise_for_status()
    if "html" not in response.headers.get("Content-Type", ""):
        return b""
    return response.content  # bytes: BeautifulSoup detects the charset itself


def extract_snippets(text: str) -> List[str]:
    """Return passages around keyword hits; overlapping windows are merged."""
    windows = []
    for match in ANY_KEYWORD.finditer(text):
        start, end = max(0, match.start() - SNIPPET_RADIUS), match.end() + SNIPPET_RADIUS
        if windows and start <= windows[-1][1]:
            windows[-1][1] = end
        else:
            windows.append([start, end])
    return [text[s:e] for s, e in windows[:MAX_SNIPPETS_PER_PAGE]]


def relevant_links(soup: BeautifulSoup, base_url: str) -> List[str]:
    """Internal links whose URL or link text contains one of LINK_HINTS."""
    base_host = urlparse(base_url).netloc
    links = []
    for a in soup.find_all("a", href=True):
        url = urljoin(base_url, a["href"]).split("#")[0]
        if urlparse(url).netloc != base_host or url in links or url.rstrip("/") == base_url.rstrip("/"):
            continue
        label = (url + " " + a.get_text(" ")).lower()
        if any(hint in label for hint in LINK_HINTS):
            links.append(url)
    return links[:MAX_SUBPAGES]


def parse_page(html: bytes) -> BeautifulSoup:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    return soup


def fetch_site(website: str) -> Dict:
    """Fetch homepage + relevant subpages; return {pages: [{url, snippets}], error}."""
    result = {"pages": [], "error": None}
    try:
        soup = parse_page(get_html(website))
    except Exception as exc:
        result["error"] = f"{type(exc).__name__}: {str(exc)[:150]}"
        return result

    subpages = relevant_links(soup, website)
    pages = [(website, soup)]
    for url in subpages:
        try:
            pages.append((url, parse_page(get_html(url))))
        except Exception:
            continue  # a broken subpage is not worth failing the whole site

    for url, page in pages:
        text = re.sub(r"\s+", " ", page.get_text(" "))
        snippets = extract_snippets(text)
        if snippets:
            result["pages"].append({"url": url, "snippets": snippets})
    return result


def main(input_path: Path, output_path: Path, workers: int, retry_errors: bool) -> None:
    places = json.loads(input_path.read_text(encoding="utf-8"))
    cache: Dict[str, Dict] = {}
    if output_path.exists():
        cache = json.loads(output_path.read_text(encoding="utf-8"))
    if retry_errors:
        cache = {url: site for url, site in cache.items() if not site["error"]}

    websites = sorted({p["website"] for p in places if p.get("website")} - cache.keys())
    print(f"{len(cache)} websites cached, {len(websites)} to fetch")

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(fetch_site, url): url for url in websites}
        for done, future in enumerate(as_completed(futures), start=1):
            cache[futures[future]] = future.result()
            if done % 100 == 0:
                print(f"  {done}/{len(websites)}")
                output_path.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")

    output_path.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
    errors = sum(1 for site in cache.values() if site["error"])
    print(f"Saved {len(cache)} websites to {output_path} ({errors} could not be loaded)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download provider websites and keep keyword passages.")
    parser.add_argument("--input", type=Path, default=RAW_INPUT)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--workers", type=int, default=16)
    parser.add_argument("--retry-errors", action="store_true", help="Fetch sites that failed last time again")
    args = parser.parse_args()
    main(args.input, args.output, args.workers, args.retry_errors)
