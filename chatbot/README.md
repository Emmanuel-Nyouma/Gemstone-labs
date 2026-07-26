# Gemstone Labs FAQ assistant

This Python service retrieves the strongest matching sections from the approved
agency knowledge base. With a Gemini API key, those passages are passed to
Gemini 3.5 Flash-Lite to create a concise, natural answer. Without a key, it
returns the best approved passage rather than inventing an answer.

Start it locally from this folder:

```powershell
python -m pip install -r requirements.txt
$env:GEMINI_API_KEY="your_rotated_server_side_key"
python -m uvicorn app:app --reload --port 8000
```

The API key must stay on the Python server and must never be placed in
`NEXT_PUBLIC_*`, browser code, or committed files. Set `ALLOWED_ORIGINS` to the
deployed website URL in production.
