"""Vercel entrypoint for the SmartG Automation Python API."""

"""Small newsletter-only API kept after the legacy chatbot was removed."""

from datetime import datetime, timezone
import re
import sqlite3
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="SmartG Automation website API")
NEWSLETTER_DB = Path("/tmp/smartg-newsletter.db")


class NewsletterRequest(BaseModel):
    email: str


@app.post("/newsletter")
def newsletter(request: NewsletterRequest) -> dict[str, str]:
    email = request.email.strip().lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return {"status": "invalid", "message": "Please enter a valid email address."}

    with sqlite3.connect(NEWSLETTER_DB) as connection:
        connection.execute(
            """CREATE TABLE IF NOT EXISTS subscribers
               (email TEXT PRIMARY KEY, subscribed_at TEXT NOT NULL)"""
        )
        connection.execute(
            """INSERT INTO subscribers (email, subscribed_at)
               VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET subscribed_at = excluded.subscribed_at""",
            (email, datetime.now(timezone.utc).isoformat()),
        )
    return {"status": "subscribed", "message": "You're on the list."}

__all__ = ["app"]
