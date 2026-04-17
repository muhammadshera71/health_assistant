# CLAUDE.md

## Running the Application

```bash
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Docs: http://localhost:8000/docs
Health: http://localhost:8000/health

---

## Docker

```bash
docker build -t toca-ai .
docker run -p 8000:8000 --env-file .env toca-ai
```

---

## Environment Variables

Required:

* OPENAI_API_KEY
* DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL_MODE

---

## Architecture Overview

* FastAPI app (`main.py`) manages routing and lifespan
* asyncpg DB pool initialized at startup
* Redis used for chat history (24hr TTL)
* AI responses streamed via SSE (`text/event-stream`)

---

## Core Features

* RPM chatbot (device readings)
* CCM chatbot (care management)
* Streaming AI responses

---

## Module Overview

* `src/chatbot_fastapi/` → main chatbot logic
* `database.py` → DB + mappings
* `models.py` → Pydantic models
* `assistants.py` → LangChain chains

---

## Critical Rules

* Always use asyncpg pool (no direct DB connections)
* Maintain SSE streaming format: `data: {json}\n\n`
* Do not break LangChain chain structure
* Do not modify schema without updating specs

---

## Notes

* DB schema: `renal_consultants`
* Key tables: devices_reading, patients_note, patients_patient
