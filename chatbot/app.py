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
import unicodedata
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
    "with", "who", "you", "your",
    "ai", "au", "aux", "avec", "ce", "ces", "comment", "dans", "de",
    "des", "du", "elle", "en", "est", "et", "etre", "il", "je", "la",
    "le", "les", "ma", "mais", "me", "mes", "mon", "ne", "nos", "notre",
    "nous", "on", "ou", "par", "pas", "pour", "que", "quel", "quelle",
    "qui", "sa", "se", "ses", "son", "sur", "tu", "un", "une", "vos",
    "votre", "vous",
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
    "cout": ("price", "pricing", "budget", "quote"),
    "coute": ("price", "pricing", "budget", "quote"),
    "prix": ("price", "pricing", "budget", "quote"),
    "tarif": ("price", "pricing", "budget", "quote"),
    "devis": ("price", "pricing", "proposal", "quote"),
    "delai": ("timeline", "weeks", "launch"),
    "temps": ("timeline", "duration", "weeks"),
    "duree": ("timeline", "duration", "weeks"),
    "securise": ("security", "privacy", "accuracy"),
    "securite": ("security", "privacy"),
    "confidentialite": ("privacy", "personal", "data"),
    "donnee": ("privacy", "security", "personal"),
    "site": ("website", "web"),
    "connecter": ("integration", "crm", "calendar"),
    "francais": ("language", "multilingual", "translation"),
    "langue": ("language", "multilingual", "translation"),
    "maintenance": ("support", "updates", "monitoring"),
    "faux": ("accuracy", "testing", "human", "hallucination"),
    "erreur": ("accuracy", "testing", "human"),
    "mak": ("accuracy", "testing", "human", "hallucination"),
}

INTENT_RULES = {
    "pricing": {
        "tokens": {"price", "pricing", "cost", "budget", "quote", "fee", "prix", "cout", "coute", "tarif", "devis", "payer"},
        "phrases": {"how much", "combien coute", "quel prix", "quel tarif"},
    },
    "timeline": {
        "tokens": {"timeline", "duration", "deadline", "weeks", "delai", "duree"},
        "phrases": {"how long", "combien de temps", "quel delai", "quelle duree"},
    },
    "accuracy": {
        "tokens": {"accuracy", "accurate", "wrong", "hallucinate", "hallucination", "faux", "fausse", "erreur", "fiable"},
        "phrases": {"wrong answer", "prevent errors", "eviter les erreurs", "reponse fausse"},
    },
    "privacy-security": {
        "tokens": {"privacy", "security", "secure", "safe", "data", "securise", "securite", "confidentialite", "donnee"},
        "phrases": {"personal data", "donnees personnelles", "est ce securise"},
    },
    "integrations": {
        "tokens": {"integration", "integrate", "connect", "crm", "calendar", "email", "api", "connecter"},
        "phrases": {"work with my", "connect to", "se connecter a"},
    },
    "languages": {
        "tokens": {"language", "languages", "multilingual", "translation", "french", "english", "francais", "francai", "anglais", "anglai", "langue", "speak", "parler"},
        "phrases": {"in french", "in english", "en francais", "plusieurs langues"},
    },
    "websites": {
        "tokens": {"website", "websites", "webpage", "landing", "redesign", "responsive", "site"},
        "phrases": {"build websites", "make websites", "creer un site", "refaire mon site"},
    },
    "support": {
        "tokens": {"support", "maintenance", "update", "updates", "monitoring", "suivi"},
        "phrases": {"after launch", "apres le lancement"},
    },
    "ideal-fit": {
        "tokens": {"industry", "industries", "clinic", "clinics", "ecommerce", "education", "hospitality", "secteur", "entreprise"},
        "phrases": {"right for me", "good fit", "pour mon entreprise", "pour quel secteur"},
    },
    "process": {
        "tokens": {"process", "steps", "discovery", "build", "test", "launch", "etapes", "methode"},
        "phrases": {"how do you work", "comment travaillez vous", "comment ca marche"},
    },
    "services-chatbots": {
        "tokens": {"chatbot", "chatbots", "assistant", "rag", "bot"},
        "phrases": {"what do you do", "what do you offer", "que faites vous", "quels services"},
    },
    "contact": {
        "tokens": {"contact", "book", "consultation", "email", "start", "commencer", "rendez", "contacter"},
        "phrases": {"get started", "start a project", "prendre rendez vous", "demarrer un projet"},
    },
}

FRENCH_FALLBACKS = {
    "services-chatbots": (
        "Nous créons des assistants qui répondent à partir des informations "
        "approuvées par votre entreprise. Ils peuvent guider les visiteurs, "
        "qualifier les demandes et transmettre les cas sensibles à une personne."
    ),
    "rag-explained": (
        "L'assistant consulte d'abord les informations validées par votre entreprise "
        "avant de répondre. Nous limitons les sujets autorisés, testons les questions "
        "difficiles et prévoyons un transfert vers une personne en cas de doute."
    ),
    "business-value": (
        "Un assistant peut répondre après les heures d'ouverture, orienter les "
        "visiteurs, recueillir des demandes utiles et réduire les questions "
        "répétitives traitées par votre équipe."
    ),
    "websites": (
        "Nous concevons des sites professionnels, rapides et adaptés aux mobiles, "
        "avec un message clair et des appels à l'action visibles. Le site peut être "
        "livré seul ou avec un assistant intelligent."
    ),
    "combined-system": (
        "Le site présente clairement votre offre, puis l'assistant aide chaque "
        "visiteur à trouver la bonne réponse et la prochaine étape. Ensemble, ils "
        "créent un parcours plus simple jusqu'à la prise de contact."
    ),
    "ideal-fit": (
        "Cette solution convient surtout aux entreprises qui reçoivent souvent les "
        "mêmes questions, perdent des demandes hors horaires ou ont des informations "
        "dispersées dans plusieurs documents."
    ),
    "process": (
        "Nous commençons par comprendre vos clients et leurs questions, puis nous "
        "organisons vos informations, construisons l'expérience et testons des cas "
        "réels. Après le lancement, nous l'améliorons selon les usages observés."
    ),
    "pricing": (
        "Le prix dépend du volume d'informations, des langues, des pages et des "
        "intégrations nécessaires. Nous commençons par une conversation gratuite, "
        "puis proposons le périmètre utile le plus simple avec un devis clair."
    ),
    "timeline": (
        "Un projet ciblé peut généralement être lancé en quelques semaines. Le "
        "délai exact dépend du nombre de pages, du volume d'informations, des langues, "
        "des intégrations et de la rapidité des retours."
    ),
    "accuracy": (
        "Nous limitons les réponses aux informations approuvées, testons les "
        "questions difficiles et affichons une réponse prudente lorsque la confiance "
        "est faible. Les demandes sensibles ou incertaines sont transmises à une personne."
    ),
    "privacy-security": (
        "Nous évitons de demander des données sensibles inutiles et définissons avec "
        "chaque client les informations autorisées, les accès et la conservation. Les "
        "données personnelles ne sont pas vendues."
    ),
    "integrations": (
        "Selon le projet, l'assistant peut se connecter aux formulaires, e-mails, "
        "calendriers, CRM, outils de support ou catalogues. Nous retenons uniquement "
        "les connexions qui apportent une valeur claire."
    ),
    "languages": (
        "Oui. Un site et un assistant peuvent fonctionner en français, en anglais et "
        "dans d'autres langues prévues au projet. Les informations importantes sont "
        "revues par une personne dans chaque langue."
    ),
    "support": (
        "Un accompagnement après lancement peut inclure la mise à jour des "
        "informations, l'analyse des questions sans réponse, les tests et "
        "l'amélioration continue du site ou de l'assistant."
    ),
    "contact": (
        "La première étape est une conversation gratuite sur votre activité, vos "
        "clients et les questions répétitives. Vous pouvez contacter Gemstone Labs à "
        "hello@gemstonelabs.ai."
    ),
}

FRENCH_MARKERS = {
    "bonjour", "combien", "comment", "francais", "quel", "quelle", "peut",
    "pouvez", "pourquoi", "votre", "vous", "cout", "prix", "delai", "duree",
    "securise", "donnee", "site", "entreprise",
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


def normalize_text(value: str) -> str:
    return unicodedata.normalize("NFKD", value.lower()).encode(
        "ascii", "ignore"
    ).decode("ascii")


def base_tokens(value: str) -> list[str]:
    ascii_value = normalize_text(value)
    words = re.findall(r"[a-z0-9]+", ascii_value)
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


def is_french(value: str) -> bool:
    words = set(re.findall(r"[a-z0-9]+", normalize_text(value)))
    return bool(words & FRENCH_MARKERS)


def smalltalk_answer(value: str) -> str | None:
    normalized = " ".join(re.findall(r"[a-z0-9]+", normalize_text(value)))
    if normalized in {"hi", "hello", "hey", "good morning", "good afternoon"}:
        return (
            "Hello! I can help with Gemstone Labs chatbots, websites, pricing, "
            "timelines, privacy, integrations, or support. What would you like to know?"
        )
    if normalized in {"bonjour", "salut", "bonsoir"}:
        return (
            "Bonjour ! Je peux vous renseigner sur les chatbots, les sites web, "
            "les tarifs, les délais, la confidentialité ou les intégrations de "
            "Gemstone Labs. Que souhaitez-vous savoir ?"
        )
    if normalized in {"thanks", "thank you", "merci", "merci beaucoup"}:
        return "Avec plaisir !" if is_french(value) else "You're welcome!"
    return None


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
    normalized_question = " ".join(re.findall(r"[a-z0-9]+", normalize_text(question)))
    question_words = set(base_tokens(question))
    boosts: Counter[str] = Counter()
    for chunk_id, rule in INTENT_RULES.items():
        token_hits = question_words & rule["tokens"]
        phrase_hits = sum(
            phrase in normalized_question for phrase in rule["phrases"]
        )
        if token_hits or phrase_hits:
            boosts[chunk_id] += 0.7 * len(token_hits) + 1.4 * phrase_hits

    vector = tfidf(query_tokens(question))
    ranked = sorted(
        (
            (
                chunk,
                cosine(vector, document_vector) + boosts[chunk.id],
            )
            for chunk, document_vector in zip(
                KNOWLEDGE, DOCUMENT_VECTORS, strict=True
            )
        ),
        key=lambda item: item[1],
        reverse=True,
    )
    if not ranked or ranked[0][1] < 0.12:
        return []

    top_score = ranked[0][1]
    return [
        item
        for item in ranked[:limit]
        if item[1] >= max(0.12, top_score * 0.22)
    ]


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
    conversational_answer = smalltalk_answer(request.question)
    if conversational_answer:
        return {
            "answer": conversational_answer,
            "sources": [],
            "confidence": "high",
            "mode": "conversation",
        }

    retrieval_question = request.question
    if len(base_tokens(request.question)) <= 2:
        previous_user = next(
            (
                message.text
                for message in reversed(request.history)
                if message.role == "user"
            ),
            None,
        )
        if previous_user:
            retrieval_question = f"{previous_user} {request.question}"

    matches = retrieve(retrieval_question)
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
    answer = generated or (
        FRENCH_FALLBACKS.get(top_chunk.id, top_chunk.content)
        if is_french(request.question)
        else top_chunk.content
    )
    return {
        "answer": answer,
        "sources": [
            {"title": chunk.title, "link": chunk.link}
            for chunk, _ in matches
        ],
        "confidence": "high" if top_score >= 0.7 else "medium",
        "mode": "gemini-rag" if generated else "grounded-retrieval",
    }


@app.post("/newsletter")
def newsletter(request: NewsletterRequest) -> dict[str, str]:
    email = request.email.strip().lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return {"status": "invalid", "message": "Please enter a valid email address."}
    initialize_newsletter_db()
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
