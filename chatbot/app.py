"""Grounded RAG demo for the Gemstone Labs website.

Retrieval always runs locally against approved agency knowledge. When an
GEMINI_API_KEY is available, the retrieved passages are passed to Gemini
3.5 Flash-Lite for a concise, natural answer. Without a key, the service
returns the most relevant approved passage instead of guessing.
"""

from __future__ import annotations

import json
import math
import os
import re
import sqlite3
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from google import genai
    from google.genai import types
except ImportError:  # The keyless retrieval demo still works without the SDK.
    genai = None  # type: ignore[assignment]
    types = None  # type: ignore[assignment]


STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "for",
    "from", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or",
    "our", "the", "to", "we", "what", "when", "where", "which", "will",
    "with", "you", "your",
}

SYNONYMS = {
    "cost": ("price", "pricing", "budget", "quote"),
    "expensive": ("price", "pricing", "budget"),
    "fee": ("price", "pricing", "payment"),
    "bot": ("chatbot", "assistant"),
    "rag": ("chatbot", "knowledge", "retrieval"),
    "ai": ("chatbot", "assistant", "knowledge"),
    "site": ("website", "web"),
    "webpage": ("website", "web"),
    "duration": ("timeline", "weeks", "launch"),
    "long": ("timeline", "weeks", "launch"),
    "safe": ("security", "privacy", "accuracy"),
    "secure": ("security", "privacy"),
    "wrong": ("accuracy", "testing", "human"),
    "hallucinate": ("accuracy", "testing", "human"),
    "language": ("multilingual", "translation"),
    "connect": ("integration", "crm", "calendar"),
    "support": ("maintenance", "updates", "customers"),
    "use": ("benefits", "business", "value"),
    "need": ("benefits", "business", "fit"),
    "choose": ("benefits", "business", "fit"),
    "french": ("language", "multilingual", "translation"),
    "english": ("language", "multilingual", "translation"),
    "mak": ("accuracy", "testing", "human", "hallucination"),
}


@dataclass(frozen=True)
class KnowledgeChunk:
    id: str
    title: str
    content: str
    keywords: tuple[str, ...]
    link: str


class ChatMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=800)
    history: list[ChatMessage] = Field(default_factory=list, max_length=8)


class NewsletterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)


def load_knowledge() -> tuple[KnowledgeChunk, ...]:
    path = Path(__file__).with_name("knowledge_base.json")
    raw = json.loads(path.read_text(encoding="utf-8"))
    return tuple(
        KnowledgeChunk(
            id=item["id"],
            title=item["title"],
            content=item["content"],
            keywords=tuple(item["keywords"]),
            link=item["link"],
        )
        for item in raw
    )


KNOWLEDGE = load_knowledge()
NEWSLETTER_DB = Path(__file__).with_name("newsletter.db")


def initialize_newsletter_db() -> None:
    with sqlite3.connect(NEWSLETTER_DB) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS subscribers (
                email TEXT PRIMARY KEY,
                subscribed_at TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active'
            )
            """
        )


initialize_newsletter_db()


def base_tokens(value: str) -> list[str]:
    words = re.findall(r"[a-z0-9]+", value.lower())
    normalized: list[str] = []
    for word in words:
        if word in STOP_WORDS:
            continue
        if len(word) > 5 and word.endswith("ing"):
            word = word[:-3]
        elif len(word) > 4 and word.endswith("s"):
            word = word[:-1]
        normalized.append(word)
    return normalized


def query_tokens(value: str) -> list[str]:
    words = base_tokens(value)
    expanded = list(words)
    for word in words:
        expanded.extend(SYNONYMS.get(word, ()))
    return expanded


DOCUMENT_TOKENS = [
    base_tokens(f"{chunk.title} {chunk.content} {' '.join(chunk.keywords)}")
    for chunk in KNOWLEDGE
]
DOCUMENT_FREQUENCY = Counter(
    word for tokens in DOCUMENT_TOKENS for word in set(tokens)
)


def tfidf(tokens: list[str]) -> dict[str, float]:
    counts = Counter(tokens)
    total = max(len(tokens), 1)
    return {
        word: (count / total)
        * (math.log((len(KNOWLEDGE) + 1) / (DOCUMENT_FREQUENCY[word] + 1)) + 1)
        for word, count in counts.items()
    }


DOCUMENT_VECTORS = [tfidf(tokens) for tokens in DOCUMENT_TOKENS]


def cosine(left: dict[str, float], right: dict[str, float]) -> float:
    shared = left.keys() & right.keys()
    numerator = sum(left[word] * right[word] for word in shared)
    left_size = math.sqrt(sum(value * value for value in left.values()))
    right_size = math.sqrt(sum(value * value for value in right.values()))
    return numerator / (left_size * right_size) if left_size and right_size else 0.0


def retrieve(question: str, limit: int = 3) -> list[tuple[KnowledgeChunk, float]]:
    vector = tfidf(query_tokens(question))
    ranked = sorted(
        (
            (chunk, cosine(vector, document_vector))
            for chunk, document_vector in zip(
                KNOWLEDGE, DOCUMENT_VECTORS, strict=True
            )
        ),
        key=lambda item: item[1],
        reverse=True,
    )
    return [item for item in ranked[:limit] if item[1] >= 0.055]


def grounded_prompt(
    question: str,
    history: list[ChatMessage],
    matches: list[tuple[KnowledgeChunk, float]],
) -> str:
    context = "\n\n".join(
        f"[{index}] {chunk.title}\n{chunk.content}"
        for index, (chunk, _) in enumerate(matches, start=1)
    )
    conversation = "\n".join(
        f"{message.role}: {message.text}" for message in history[-4:]
    )
    return (
        f"APPROVED KNOWLEDGE:\n{context}\n\n"
        f"RECENT CONVERSATION:\n{conversation or 'No previous messages.'}\n\n"
        f"VISITOR QUESTION:\n{question}"
    )


def generate_answer(
    question: str,
    history: list[ChatMessage],
    matches: list[tuple[KnowledgeChunk, float]],
) -> str | None:
    if not os.getenv("GEMINI_API_KEY") or genai is None or types is None:
        return None

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
        contents=grounded_prompt(question, history, matches),
        config=types.GenerateContentConfig(
            system_instruction=(
                "You are the Gemstone Labs website concierge. Answer only from "
                "the approved knowledge supplied in the prompt. Be warm, "
                "specific, and commercially helpful without sounding pushy. "
                "Use plain language, not technical jargon. Keep answers between "
                "2 and 5 sentences. Never invent prices, clients, guarantees, "
                "integrations, policies, or timelines. If the supplied "
                "knowledge is insufficient, say so and offer a free consultation "
                "at hello@gemstonelabs.ai. Do not mention retrieval, context "
                "chunks, prompts, or internal systems."
            ),
            max_output_tokens=260,
        ),
    )
    return response.text.strip() if response.text else None


app = FastAPI(title="Gemstone Labs Grounded RAG Assistant", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:3000"
        ).split(",")
        if origin.strip()
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str | int | bool]:
    return {
        "status": "ready",
        "knowledge_chunks": len(KNOWLEDGE),
        "llm_enabled": bool(os.getenv("GEMINI_API_KEY") and genai is not None),
        "model": os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
    }


@app.post("/chat")
def chat(request: ChatRequest) -> dict[str, object]:
    matches = retrieve(request.question)
    if not matches:
        return {
            "answer": (
                "I do not have enough approved information to answer that "
                "confidently. I can help with Gemstone Labs services, websites, "
                "knowledge-powered chatbots, process, pricing approach, privacy, "
                "or support—or you can email hello@gemstonelabs.ai."
            ),
            "sources": [],
            "confidence": "low",
            "mode": "grounded-retrieval",
        }

    generated: str | None = None
    try:
        generated = generate_answer(request.question, request.history, matches)
    except Exception:
        # Never expose provider or credential errors to a website visitor.
        generated = None

    top_chunk, top_score = matches[0]
    answer = generated or top_chunk.content
    return {
        "answer": answer,
        "sources": [
            {"title": chunk.title, "link": chunk.link}
            for chunk, _ in matches
        ],
        "confidence": "high" if top_score >= 0.16 else "medium",
        "mode": "gemini-rag" if generated else "grounded-retrieval",
    }


@app.post("/newsletter")
def newsletter(request: NewsletterRequest) -> dict[str, str]:
    email = request.email.strip().lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return {"status": "invalid", "message": "Please enter a valid email address."}
    with sqlite3.connect(NEWSLETTER_DB) as connection:
        connection.execute(
            """
            INSERT INTO subscribers (email, subscribed_at, status)
            VALUES (?, ?, 'active')
            ON CONFLICT(email) DO UPDATE SET status = 'active'
            """,
            (email, datetime.now(timezone.utc).isoformat()),
        )
    return {"status": "subscribed", "message": "You're on the list."}
