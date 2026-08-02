# Gemstone Labs

Marketing website and grounded RAG demo for Gemstone Labs. The web app is built
with Next.js; the assistant is a Python FastAPI endpoint deployed through
`api/index.py`.

## RAG workflow

The assistant uses a precision-first workflow:

1. Rewrites short follow-up questions using recent conversation context.
2. Ranks approved agency knowledge with deterministic intent and TF-IDF search.
3. Uses Gemini embeddings to rerank that evidence and reciprocal rank fusion to
   combine the two rankings.
4. Refuses questions that do not pass the local evidence gate.
5. Gives only the selected passages to Gemini through LangChain.
6. Runs an independent grounding verifier on the draft answer.
7. Falls back to the best approved passage if generation, verification, quota,
   or network access fails.

Gemini never receives secrets in the browser. The API key is read only by the
Python server.

## Local development

```bash
npm install
npm run dev
```

Run the Python API separately when developing locally:

```bash
python -m pip install -r chatbot/requirements.txt
python -m uvicorn chatbot.app:app --reload --port 8002
```

## Environment variables

Copy `chatbot/.env.example` to a local environment file and supply your own
secret:

- `GEMINI_API_KEY` — required for embeddings and generated answers.
- `GEMINI_MODEL` — defaults to `gemini-3.5-flash-lite`.
- `GEMINI_EMBEDDING_MODEL` — defaults to `models/gemini-embedding-001`.
- `RAG_VERIFY_ANSWERS` — defaults to `true`; keep enabled in production.
- `ALLOWED_ORIGINS` — comma-separated browser origins accepted by FastAPI.

## Verification

```bash
python -m unittest discover -s tests -v
npm run build
```
