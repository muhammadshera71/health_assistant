import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List

from openai import OpenAI, APIError as OpenAIAPIError
from pinecone import Pinecone
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker

from config import get_settings
import database.session as db_session_module
from database.session import create_engine as create_sa_engine
from rag.parser import parse_file, SUPPORTED_EXTENSIONS
from rag.chunker import chunk_text
from rag.indexer import get_or_create_index, ingest_chunks
from routers import auth as auth_router
from routers import users as users_router
from routers import products as products_router
from routers import cart as cart_router
from routers import orders as orders_router

STATIC_DIR = Path(__file__).parent / "static"
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1024   # must match the Pinecone index dimension
TOP_K = 4              # number of products retrieved from Pinecone per query
# g
# Base system prompt — retrieved product context is appended dynamically
SYSTEM_PROMPT_BASE = """You are the Lumière AI Skin Advisor — a warm, expert esthetician and \
skincare consultant for Lumière, a luxury skincare brand rooted in science and elegance.

PERSONALITY:
- Warm, knowledgeable, genuinely caring
- Use beautiful, aspirational yet accessible language
- Address the person as if you're in a private consultation
- Never be pushy — recommend because it serves them

YOUR ROLE:
1. Warmly greet and ask about their skin type (first message)
2. Ask about their primary concern (after they share skin type)
3. Recommend 2–4 products that precisely match their profile using ONLY the products listed below
4. Explain WHY each product is right for them specifically

WHEN RECOMMENDING PRODUCTS:
- Include this tag at the VERY END of messages with recommendations: <recommendations>{"ids":[id1,id2]}</recommendations>
- Recommend ONLY from the RETRIEVED PRODUCTS section below (use exact numeric IDs)
- 2–4 products maximum per recommendation
- Never recommend the same product twice in a conversation

Keep responses under 3 paragraphs. Elegant, warm, specific."""


def build_system_prompt(retrieved: list) -> str:
    """
    Append retrieved Pinecone matches to the base system prompt.
    Handles two vector types:
      - product vectors  (metadata has 'id', 'name', 'type', 'price' …)
      - file-chunk vectors (metadata has 'source', 'text', 'chunk_index' …)
    """
    if not retrieved:
        return SYSTEM_PROMPT_BASE

    product_lines: list[str] = []
    knowledge_lines: list[str] = []

    for match in retrieved:
        m = match["metadata"] if isinstance(match, dict) else match.metadata

        if "name" in m and "price" in m:
            # Product record
            product_lines.append(
                f"- {m['name']} (ID:{m['id']}) | {m['type']} | ${m['price']} {m.get('size','')}\n"
                f"  Skin types: {m.get('skinTypes','')} | Concerns: {m.get('concerns','')}\n"
                f"  {m.get('shortDesc', m.get('text',''))}"
            )
        else:
            # File-chunk record — include the raw text as knowledge context
            source = m.get("source", "uploaded document")
            text_snippet = m.get("text", "")[:600]
            knowledge_lines.append(f"[From '{source}']\n{text_snippet}")

    sections = [SYSTEM_PROMPT_BASE]
    if product_lines:
        sections.append("RETRIEVED PRODUCTS (most relevant to this conversation):\n" + "\n".join(product_lines))
    if knowledge_lines:
        sections.append("ADDITIONAL KNOWLEDGE (from indexed documents):\n" + "\n\n".join(knowledge_lines))

    return "\n\n".join(sections)


def get_pinecone_index():
    """Return a Pinecone Index handle (creates index if needed), or None if not configured."""
    settings = get_settings()
    if not settings.pinecone_api_key:
        return None
    try:
        pc = Pinecone(api_key=settings.pinecone_api_key)
        return get_or_create_index(pc, settings.pinecone_index_name)
    except Exception as exc:
        logging.warning(f"Pinecone init failed (falling back to base prompt): {exc}")
        return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    if not settings.jwt_secret_key:
        raise RuntimeError("JWT_SECRET_KEY must be set in .env")

    # SQLAlchemy async engine (new ORM-based endpoints)
    sa_engine = create_sa_engine()
    db_session_module.AsyncSessionLocal = async_sessionmaker(sa_engine, expire_on_commit=False)
    app.state.sa_engine = sa_engine

    # Pinecone index handle (shared across requests, created if missing)
    app.state.pinecone_index = get_pinecone_index()
    if app.state.pinecone_index:
        logging.info(f"Pinecone index '{settings.pinecone_index_name}' connected.")
    else:
        logging.warning("Pinecone not configured — chat will use base system prompt only.")

    # Shared OpenAI client
    app.state.openai_client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    try:
        yield
    finally:
        await sa_engine.dispose()


app = FastAPI(title="Lumière — Healthcare AI Assistant", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(products_router.router)
app.include_router(cart_router.router)
app.include_router(orders_router.router)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    content: str
    retrieved_product_ids: List[int] = []  # for debugging / observability


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    openai_client = app.state.openai_client
    if openai_client is None:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")

    # ── RAG: embed the latest user turn and retrieve from Pinecone ──────────
    retrieved = []
    pinecone_index = app.state.pinecone_index

    if pinecone_index:
        # Use the last user message as the retrieval query
        user_messages = [m for m in request.messages if m.role == "user"]
        query_text = user_messages[-1].content if user_messages else ""

        try:
            embed_response = openai_client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=query_text,
                dimensions=EMBEDDING_DIM,
            )
            query_vector = embed_response.data[0].embedding

            results = pinecone_index.query(
                vector=query_vector,
                top_k=TOP_K,
                include_metadata=True,
            )
            retrieved = results.matches  # list of ScoredVector
        except Exception as exc:
            logging.warning(f"Pinecone retrieval failed (continuing without RAG): {exc}")

    # ── Build dynamic system prompt ─────────────────────────────────────────
    system_prompt = build_system_prompt(retrieved)

    # ── Call GPT-4o ──────────────────────────────────────────────────────────
    messages = [{"role": "system", "content": system_prompt}] + \
               [{"role": m.role, "content": m.content} for m in request.messages]

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            max_tokens=1024,
            messages=messages,
        )
    except OpenAIAPIError as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI API error: {exc}") from exc

    retrieved_ids = [int(r.metadata["id"]) for r in retrieved if r.metadata.get("id")]

    return ChatResponse(
        content=response.choices[0].message.content,
        retrieved_product_ids=retrieved_ids,
    )


class UploadResponse(BaseModel):
    filename: str
    chunks_indexed: int
    message: str


@app.post("/api/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)) -> UploadResponse:
    """
    Upload a document (PDF, DOCX, TXT, MD) and index it into Pinecone.
    The file is chunked, embedded with text-embedding-3-small, and upserted.
    """
    openai_client = app.state.openai_client
    if openai_client is None:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")

    pinecone_index = app.state.pinecone_index
    if pinecone_index is None:
        raise HTTPException(status_code=503, detail="Pinecone not configured — set PINECONE_API_KEY in .env")

    # ── Validate extension ──────────────────────────────────────────────────
    suffix = Path(file.filename).suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{suffix}'. Allowed: {', '.join(sorted(SUPPORTED_EXTENSIONS))}",
        )

    # ── Read & parse ────────────────────────────────────────────────────────
    raw_bytes = await file.read()
    if len(raw_bytes) > 20 * 1024 * 1024:  # 20 MB guard
        raise HTTPException(status_code=413, detail="File too large (max 20 MB)")

    try:
        text = parse_file(file.filename, raw_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    if not text.strip():
        raise HTTPException(status_code=422, detail="File appears to be empty or unreadable")

    # ── Chunk ───────────────────────────────────────────────────────────────
    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=422, detail="No text content extracted from file")

    # ── Embed & upsert ──────────────────────────────────────────────────────
    try:
        count = ingest_chunks(
            openai_client=openai_client,
            pinecone_index=pinecone_index,
            chunks=chunks,
            filename=file.filename,
            extra_metadata={"content_type": file.content_type or "unknown"},
        )
    except OpenAIAPIError as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI embedding error: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Indexing error: {exc}") from exc

    return UploadResponse(
        filename=file.filename,
        chunks_indexed=count,
        message=f"Successfully indexed {count} chunks from '{file.filename}' into Pinecone.",
    )


@app.get("/api/chat/index-stats")
async def index_stats() -> dict:
    """Quick health-check for the Pinecone index."""
    index = app.state.pinecone_index
    if not index:
        return {"status": "pinecone_not_configured"}
    stats = index.describe_index_stats()
    return {"status": "ok", "total_vectors": stats.total_vector_count}


@app.get("/", include_in_schema=False)
async def root() -> RedirectResponse:
    return RedirectResponse(url="/docs")


@app.get("/demo", include_in_schema=False)
async def demo() -> FileResponse:
    return FileResponse(STATIC_DIR / "demo.html")


@app.get("/test", include_in_schema=False)
async def test_console() -> FileResponse:
    return FileResponse(STATIC_DIR / "test.html")


@app.get("/health")
async def health() -> dict:
    if db_session_module.AsyncSessionLocal is None:
        return {"status": "ok", "db": "unavailable"}
    try:
        async with db_session_module.AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"db unavailable: {exc}") from exc
    return {"status": "ok", "db": "up"}
