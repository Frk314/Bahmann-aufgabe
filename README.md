# Laborsuche DACH

Eine interaktive Karte mit Anbietern in Deutschland, bei denen man Folgendes machen kann:

- einen **DEXA-Scan zur Körperzusammensetzung** (Körperfett, Muskelmasse, Knochendichte), nicht nur eine Knochendichtemessung
- einen **Bluttest als Selbstzahler** (ohne ärztliche Überweisung)

## Erste Schritte

### Option 1: Docker (ein Befehl)

Voraussetzung: [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up --build
```

Öffnen: http://localhost:5173

### Option 2: Lokal starten

Voraussetzungen: Python 3.12, Node.js 18 oder neuer.

**1. API** (im Projektordner):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

**2. Karte** (in einem zweiten Terminal):

```powershell
cd web
npm install
npm run dev
```

Wenn die Datei `web/.env` fehlt, legen Sie sie mit dieser Zeile an:

```
VITE_API_URL=http://localhost:8000
```

Öffnen: http://localhost:5173

> Die Karte ist leer? Die API muss auf Port **8000** laufen und die Karte auf Port **5173**.
> Die API nimmt nur Anfragen von `localhost:5173` an (CORS).


## So funktioniert es

```
Google Places suchen    ->   Jede Website lesen   ->   Filter (3 Regeln)   ->   Klassifizierte Daten
(Suchbegriffe x Städte)      (fetch_websites.py)       (classify.py)            (classified.json)

      ->   Manuelle Prüfung   ->   Finale Anbieterliste   ->   Karte
           (review.csv)            (providers.json)            (API + web/)
```

1. **Sammeln** (`data_collection.py`): Jeder Suchbegriff aus `keywords.py` („DEXA“, „Körperfettanalyse“,
   „Selbstzahler Bluttest“, ...) wird mit jeder Stadt aus einer Liste von 21 großen deutschen Städten
   kombiniert und an die Google Places API geschickt. Doppelte Einträge werden entfernt.
2. **Websites lesen** (`fetch_websites.py`): Für jeden Ort laden wir die Startseite und bis zu
   5 passende Unterseiten herunter. Wir behalten den Text rund um Stichwörter wie „DXA“ oder „Selbstzahler“.
3. **Filtern** (`classify.py`): Drei Regeln entscheiden, was auf die Karte kommt (siehe unten).
4. **Manuelle Prüfung** (`review.csv`): Jeder verbleibende Anbieter wird von Hand auf seiner Website
   geprüft und mit `ja` oder `nein` markiert.
5. **Export** (`export.py`): Die geprüften Anbieter werden in `data/providers.json` geschrieben. Die
   Datei wird gegen `data/schema.json` validiert.
6. **Karte**: Ein kleiner FastAPI-Server (`api/`) stellt die Datei bereit, und die React-Karte (`web/`)
   zeigt sie an. Das Frontend der Karte wurde von einem anderen Team gebaut.

### Ergebnisse

| Schritt | Anzahl |
|---|---|
| Bei Google gefundene Orte | 2.798 |
| Ausgeschlossen: nur Knochendichte | 336 |
| Ausgeschlossen: keine passende Leistung | 2.167 |
| Ausgeschlossen: keine Website / Website nicht erreichbar / außerhalb von DACH | 224 |
| Kandidaten nach dem Filtern | 71 |
| Auf der Karte nach der manuellen Prüfung | 69 (12 DEXA, 57 Bluttest) |

## Herangehensweise

**Warum die Google Places API?** Suchmaschinen direkt zu scrapen lieferte ungenaue Ergebnisse und
wurde schnell blockiert. Die Places API liefert für jeden Ort saubere Daten: Name, Adresse,
Koordinaten, Telefon und Website.

**Warum die Websites lesen?** Google sagt uns, *dass* es eine Praxis gibt, aber nicht, *was* sie anbietet.
Die echten Informationen stehen auf der Website des Anbieters. Deshalb laden wir sie herunter und
durchsuchen den Text.

**Der Filter in einfachen Worten.** Wir vertrauen nie einem einzelnen Stichwort. Eine Regel trifft nur
zu, wenn **zwei Arten von Wörtern nah beieinander** stehen (innerhalb von 300 Zeichen auf derselben Seite):

1. **DEXA-Körperzusammensetzung**: ein DEXA-Wort („DEXA“, „DXA“) **und** ein Körper-Wort („Körperfett“,
   „Muskelmasse“, „Körperzusammensetzung“). „DXA“ allein bedeutet meistens eine Knochendichtemessung.
   „Körperfett“ allein ist oft eine einfache Körperfettwaage im Fitnessstudio.
2. **Nur Knochendichte**: DEXA zusammen mit Knochen-Wörtern („Knochendichte“, „Osteoporose“), aber
   ohne Körper-Wörter. Das ist der häufigste Fall: 336 Praxen. Sie werden **ausgeschlossen**.
3. **Bluttest als Selbstzahler**: ein Blut-Wort („Bluttest“, „Laboruntersuchung“) **und** ein
   Selbstzahler-Wort („Selbstzahler“, „ohne Überweisung“, „IGeL“). Es zählen nur Gesundheitsbetriebe
   (keine Apotheken, Geschäfte oder Fitnessstudios) und nur Orte in Deutschland, Österreich oder der Schweiz.

Jede Entscheidung wird mit der genauen Textstelle und der URL der Seite gespeichert
(`data/classified.json`), auch für die abgelehnten Orte. So lässt sich jede Entscheidung leicht prüfen.
Die Datei entsteht beim Ausführen der Pipeline und ist nicht im Repository enthalten.

**Warum eine manuelle Prüfung?** Stichwort-Regeln verstehen keine Bedeutung. Manche Seiten schreiben
*„Einen DEXA-Scan bieten wir nicht an“* oder vergleichen ihre eigene Waage mit DEXA. Die manuelle Prüfung
in `review.csv` entfernt diese Fälle. Qualität geht vor Menge.

**Reproduzierbar:** Jeder mit einem API-Schlüssel kann dieselben vier Befehle mit denselben Suchbegriffen
ausführen (die Ergebnisse von Google können sich mit der Zeit ändern). Jeder Schritt schreibt sein
Ergebnis in eine Datei. So kann man jeden Schritt einzeln ausführen und prüfen.

## Datenmodell

Das Schema ist in [`data/schema.json`](data/schema.json) definiert. Ein Anbieter sieht so aus:

```json
{
  "id": "ChIJ9VBu8uQlv0cRes3MMlVCKwY",
  "name": "Orthopädie em Veedel - Köln Lindenthal",
  "category": "DEXA",
  "categories": ["dexa"],
  "provider_type": "practice",
  "services": {
    "body_composition": true,
    "bone_density": true,
    "blood_test_self_pay": false
  },
  "address": {
    "street": "Dürener Str. 199-203",
    "postal_code": "50931",
    "city": "Köln",
    "country": "DE"
  },
  "coordinates": { "lat": 50.93, "lng": 6.914 },
  "contact": { "phone": "+49 221 95587654", "website": "https://orthopaedie-em-veedel.de/" },
  "self_pay": null,
  "prices": { "publicly_available": false, "note": null },
  "source_url": "https://orthopaedie-em-veedel.de/koerperzusammensetzungsanalyse/",
  "verification": {
    "verified": true,
    "source_url": "https://orthopaedie-em-veedel.de/koerperzusammensetzungsanalyse/",
    "evidence": "Körperzusammensetzungsanalyse & Knochendichtemessung (DEXA) ...",
    "note": null
  }
}
```

- **`id`** ist die Google-Place-ID. Sie bleibt zwischen zwei Durchläufen gleich. So findet man doppelte
  Einträge leicht.
- **`categories`** ist eine Liste, weil ein Ort beide Leistungen anbieten kann. `category` ist die
  Hauptkategorie, die die Karte verwendet.
- **`services`** ist ein Objekt mit Ja/Nein-Werten. Eine neue Leistung ist einfach ein neuer Schlüssel.
- **`verification`** speichert, ob der Eintrag von Hand geprüft wurde, und den Text, auf dem er beruht.
- Die Datei wird bei jedem Export gegen das Schema geprüft. Die API stellt die Anbieterliste unter
  `GET /api/providers` bereit (Dokumentation unter http://localhost:8000/docs).

## Was ich mit mehr Zeit noch machen würde

- **Besser filtern mit einem Sprachmodell.** Ein KI-Modell könnte jede Website lesen und Sätze wie
  „wir bieten kein DEXA an“ verstehen. Das würde die Qualität stark verbessern, kostet aber Geld pro Anfrage.
- **Effizientere Suche.** Die Suche läuft pro Stadt. Deshalb lässt sie sich leicht auf weitere Regionen
  erweitern. Aber benachbarte Städte liefern viele gleiche Orte, und das verschwendet Anfragen.
- **Mehr als 20 Ergebnisse pro Suche.** Google liefert höchstens 20 Orte pro Anfrage. Wenn man weitere
  Ergebnisseiten abruft, findet man auch Anbieter, die weiter unten stehen.
- **Anbieter ohne Website.** Wenn ein Anbieter keine Website hat, können wir seine Leistungen nicht
  prüfen. Er erscheint dann nicht auf der Karte.
