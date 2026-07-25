# Agentic RAG Travel Planner

Production-grade travel planning system using **LangGraph**, **Hybrid RAG** (BM25 + Qdrant), and **Gemini 2.5 Flash**. Optimized for free-tier deployment on **Hugging Face Spaces** (backend) and **Netlify** (frontend).

## Architecture

```
Netlify (React) → HF Spaces Docker (FastAPI + LangGraph)
                      ↓
         Gemini API | Qdrant Cloud | MongoDB Atlas | External APIs
```

**Memory-safe design:** Embeddings are generated **offline only** with `BAAI/bge-m3`. The deployed backend performs retrieval only — no local LLM, no local embedding model, no PDF processing at startup.

## Project Structure

```
├── backend/           # FastAPI + LangGraph (deployed to HF Spaces)
├── frontend/          # React + Vite + MUI (deployed to Netlify)
├── ingestion/         # Offline pipeline (run locally)
├── evaluation/        # RAGAS / DeepEval scripts
└── scripts/           # Utility scripts
```

## Quick Start (Local)

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env        # Fill in API keys
```

Build BM25 index from sample data:

```bash
python ../scripts/build_bm25.py
```

Run API:

```bash
uvicorn app.main:app --reload --port 8000
```

Test: `GET http://localhost:8000/health` → `{"status":"ok"}`

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173

### 3. Offline Ingestion (Qdrant + full BM25)

Run **locally only** — never inside the Docker container:

```bash
cd ingestion
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python ingest.py --qdrant-url YOUR_URL --qdrant-api-key YOUR_KEY --recreate
```

Add more JSON documents to `ingestion/data/raw/` before running.

## API Specification

### `GET /health`

```json
{"status": "ok"}
```

### `POST /chat`

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Plan a 3-day trip to Goa"}
  ]
}
```

**Response:**
```json
{
  "reply": "...",
  "recommendations": [{"title": "...", "type": "hotel", "city": "Goa", "url": "..."}],
  "sources": ["https://..."],
  "end_of_conversation": false,
  "execution_traces": [{"step": "Safety Check", "status": "passed", "detail": "..."}]
}
```

**Agent pipeline:** Safety Check → Intent Analysis → Clarification Decision → Hybrid Retrieval (BM25 + Semantic + RRF) → Tool Router → Planner Agent → Response Generator → Citation Formatter.

## Environment Variables

See `backend/.env.example`. Key secrets for HF Spaces:

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Gemini 2.5 Flash via LiteLLM |
| `EMBEDDING_MODEL` | Gemini embedding model (default: text-embedding-004) |
| `EMBEDDING_PROVIDER` | `gemini` (preferred) or `huggingface` |
| `HF_INFERENCE_API_KEY` | Fallback query embeddings for bge-m3 Qdrant vectors |
| `QDRANT_URL` / `QDRANT_API_KEY` | Vector search |
| `MONGODB_URI` | Chat logs / metadata |
| `OPENWEATHER_API_KEY` | Weather tool |
| `EXCHANGERATE_API_KEY` | Currency tool |
| `GOOGLE_MAPS_API_KEY` | Distance + Places |
| `TAVILY_API_KEY` | Web search |
| `CORS_ORIGINS` | Netlify frontend URL |

## Deployment

### Backend — Hugging Face Spaces (Docker)

1. Create a new **Docker Space**
2. Push `backend/` contents (Dockerfile + app)
3. Set all env vars as **Space Secrets**
4. Include `backend/data/corpus.json` and `bm25_index.pkl` in the repo or mount via build

### Frontend — Netlify

1. Connect repo, set base directory to `frontend`
2. Build command: `npm run build`, publish: `dist`
3. Set `VITE_API_BASE_URL` to your HF Space URL

## Evaluation

```bash
cd evaluation
pip install -r requirements.txt
python evaluate.py
```

## Tech Stack (Strict)

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, MUI, Axios, React Markdown |
| Backend | FastAPI, LangGraph, LiteLLM |
| LLM | Gemini 2.5 Flash |
| Vector DB | Qdrant Cloud |
| App DB | MongoDB Atlas |
| Retrieval | BM25 + Semantic (RRF merge) |
| Embeddings | bge-m3 (offline ingestion) |
| Deployment | Netlify + HF Spaces Docker |

## License

MIT

