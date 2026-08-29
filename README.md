# Gemstone Labs

Marketing website and grounded Graph RAG demo for Gemstone Labs. The web app is
built with Next.js; the live-demo assistant calls the published n8n workflow.

## RAG workflow

The assistant uses a precision-first n8n workflow:

1. Rewrites short follow-up questions using recent conversation context.
2. Ranks approved agency knowledge with deterministic intent and TF-IDF search.
3. Uses Cohere multilingual embeddings, Pinecone retrieval, and Cohere reranking.
4. Refuses questions that do not pass the evidence gate.
5. Generates only from selected passages through the configured OpenRouter model.
6. Returns source citations with every grounded answer.

The browser calls the published n8n webhook. Provider credentials remain in
n8n and are never exposed to the browser.

## Local development

```bash
npm install
npm run dev
```

## Environment variables

- `NEXT_PUBLIC_NEWSLETTER_API_URL` — optional external newsletter endpoint.

## Verification

```bash
npm run build
```
