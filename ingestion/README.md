# Offline Ingestion Guide

This pipeline runs **on your laptop only** — never on Hugging Face Spaces. It builds the knowledge base your agent retrieves from.

## What it does

```
ingestion/data/raw/*.json
        ↓
   clean + chunk
        ↓
   embed with bge-m3 (local)
        ↓
   upload vectors → Qdrant Cloud
   save BM25 index → backend/data/
```

After ingestion, restart your backend so BM25 loads the new `corpus.json`.

---

## Step 1 — Understand the JSON format

Each file is a **JSON array** of documents. Every document needs these fields:

| Field | Required | Example |
|-------|----------|---------|
| `title` | Yes | `"Chennai — Gateway to South India"` |
| `city` | Yes | `"Chennai"` |
| `category` | Yes | `"destination"`, `"hotel"`, `"visa"`, `"transport"`, `"guideline"` |
| `url` | Yes | `"https://en.wikipedia.org/wiki/Chennai"` (public source URL) |
| `text` | Yes | 100–800 words of factual travel content |

**Example single document:**

```json
{
  "title": "Chennai — Gateway to South India",
  "city": "Chennai",
  "category": "destination",
  "url": "https://en.wikipedia.org/wiki/Chennai",
  "text": "Chennai is the capital of Tamil Nadu. Major attractions include Marina Beach, Kapaleeshwarar Temple..."
}
```

---

## Step 2 — Add your JSON files

Place files in:

```
ingestion/data/raw/
```

**Already included:**
- `destinations.json` — Jaipur, Goa, Manali, Delhi, Kochi, visa
- `chennai.json` — Chennai destination, hotels, flights
- `metro_cities.json` — Mumbai, Bangalore, Hyderabad
- `travel_guidelines.json` — monsoon/summer tips, Golden Triangle

**Recommended categories to add** (one file per topic or city):

| Category | What to include | Example sources |
|----------|-----------------|-----------------|
| Destinations | Attractions, best time, food | Wikipedia, state tourism sites |
| Hotels | Areas to stay, budget tips | Tourism boards, Lonely Planet |
| Transport | Airports, trains, local transit | Official airport/rail sites |
| Visa | Requirements, e-visa steps | `indianvisaonline.gov.in`, IATA |
| Weather | Seasonal advice | OpenWeather blog, tourism sites |
| Flights | Route info (not live prices) | Airline route pages |

**Tips:**
- Use **one city per document** in the `city` field — retrieval filters by city.
- Write **200–500 words** per entry; ingestion auto-chunks longer text.
- Always include a real **`url`** — the agent cites these in answers.
- Only use **public** data; respect `robots.txt` when scraping.
- You can add many files: `ingestion/data/raw/udaipur.json`, `hotels.json`, etc.

---

## Step 3 — Set up the ingestion environment

Open PowerShell:

```powershell
cd C:\Users\aryan\OneDrive\Desktop\Agentic_RAG_Travel_Planner\ingestion

python -m venv .venv
.venv\Scripts\activate

pip install -r requirements.txt
```

> First run downloads `BAAI/bge-m3` (~2 GB). Ensure stable internet and ~8 GB free RAM.

---

## Step 4 — Run ingestion

Copy your Qdrant credentials from `backend/.env`:

```powershell
python ingest.py `
  --qdrant-url "YOUR_QDRANT_URL" `
  --qdrant-api-key "YOUR_QDRANT_API_KEY" `
  --collection travel_knowledge `
  --recreate
```

| Flag | Meaning |
|------|---------|
| `--recreate` | Rebuilds Qdrant collection (use first time or after schema change) |
| `--skip-qdrant` | Only rebuilds BM25 files locally (no embedding model download) |

**BM25-only quick rebuild** (fast, no GPU/RAM heavy step):

```powershell
python ingest.py --qdrant-url x --qdrant-api-key x --skip-qdrant
```

This updates:
- `backend/data/corpus.json`
- `backend/data/bm25_index.pkl`

---

## Step 5 — Verify

```powershell
# Count chunks created
python -c "import json; d=json.load(open('../backend/data/corpus.json')); print(len(d), 'chunks'); cities=set(x['city'] for x in d); print('Cities:', sorted(cities))"
```

Restart backend:

```powershell
cd ..\backend
.venv\Scripts\uvicorn app.main:app --reload --port 8000
```

Test in chat:
- "Places to visit in Chennai"
- "Best time to visit Goa in summer"
- "Plan a 5-day trip to Jaipur"

---

## Step 6 — Deploy note

When deploying to Hugging Face Spaces, **commit** these files to your repo:
- `backend/data/corpus.json`
- `backend/data/bm25_index.pkl`

Qdrant vectors live in Qdrant Cloud — not in the Docker image.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `No documents found` | Add at least one `.json` file under `data/raw/` |
| Out of memory loading bge-m3 | Close other apps; use `--skip-qdrant` first for BM25 only |
| Qdrant upload fails | Check URL/API key; use `--recreate` on first upload |
| Agent still shows old answers | Restart uvicorn after ingestion |

---

## Adding more data later

1. Add new JSON files to `data/raw/`
2. Re-run `ingest.py` **without** `--recreate` to upsert new vectors, or with `--recreate` for a clean rebuild
3. Restart backend
