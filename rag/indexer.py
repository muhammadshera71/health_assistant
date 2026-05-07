"""
Shared ingestion logic: embed text chunks and upsert into Pinecone.
Used by both the upload API endpoint and the CLI ingestion scripts.
"""

import hashlib
import logging
import time
from typing import Any

from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1024   # matches existing skin-care index; text-embedding-3-small supports 256–1536
PINECONE_METRIC = "cosine"
UPSERT_BATCH_SIZE = 100
EMBED_BATCH_SIZE = 50     # OpenAI allows up to 2048 inputs but 50 is safe


logger = logging.getLogger(__name__)


# ── Pinecone helpers ────────────────────────────────────────────────────────

def get_or_create_index(pc: Pinecone, index_name: str) -> Any:
    """Return the Pinecone index handle, creating the index if it doesn't exist."""
    existing = [idx.name for idx in pc.list_indexes().indexes]
    if index_name not in existing:
        logger.info(f"Creating Pinecone index '{index_name}' ...")
        pc.create_index(
            name=index_name,
            dimension=EMBEDDING_DIM,
            metric=PINECONE_METRIC,
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        _wait_until_ready(pc, index_name)
        logger.info(f"Index '{index_name}' ready.")
    return pc.Index(index_name)


def _wait_until_ready(pc: Pinecone, index_name: str, timeout: int = 120) -> None:
    start = time.time()
    while time.time() - start < timeout:
        if pc.describe_index(index_name).status.get("ready"):
            return
        time.sleep(3)
    raise TimeoutError(f"Pinecone index '{index_name}' not ready after {timeout}s")


# ── Embedding ───────────────────────────────────────────────────────────────

def embed_texts(client: OpenAI, texts: list[str]) -> list[list[float]]:
    """Embed a list of strings in batches, returning one vector per text."""
    all_embeddings: list[list[float]] = []
    for i in range(0, len(texts), EMBED_BATCH_SIZE):
        batch = texts[i : i + EMBED_BATCH_SIZE]
        response = client.embeddings.create(model=EMBEDDING_MODEL, input=batch, dimensions=EMBEDDING_DIM)
        sorted_data = sorted(response.data, key=lambda x: x.index)
        all_embeddings.extend(item.embedding for item in sorted_data)
    return all_embeddings


# ── Vector ID helpers ───────────────────────────────────────────────────────

def make_file_chunk_id(filename: str, chunk_index: int) -> str:
    """Stable, collision-resistant vector ID for a file chunk."""
    name_hash = hashlib.md5(filename.encode()).hexdigest()[:10]
    return f"file-{name_hash}-chunk-{chunk_index}"


def make_product_id(product_id: int) -> str:
    return f"product-{product_id}"


# ── Upsert ──────────────────────────────────────────────────────────────────

def upsert_vectors(index: Any, vectors: list[dict]) -> int:
    """
    Upsert vectors to Pinecone in batches.
    Each vector dict: {"id": str, "values": list[float], "metadata": dict}
    Returns total number of vectors upserted.
    """
    total = 0
    for i in range(0, len(vectors), UPSERT_BATCH_SIZE):
        batch = vectors[i : i + UPSERT_BATCH_SIZE]
        index.upsert(vectors=batch)
        total += len(batch)
        logger.debug(f"  Upserted batch {i // UPSERT_BATCH_SIZE + 1} ({len(batch)} vectors)")
    return total


# ── High-level: ingest file chunks ─────────────────────────────────────────

def ingest_chunks(
    openai_client: OpenAI,
    pinecone_index: Any,
    chunks: list[str],
    filename: str,
    extra_metadata: dict | None = None,
) -> int:
    """
    Embed *chunks* and upsert them into *pinecone_index*.

    Metadata stored per vector:
      - source: filename
      - chunk_index: position in the file
      - text: the chunk text itself (for debugging / context display)
      - ...extra_metadata

    Returns the number of vectors upserted.
    """
    if not chunks:
        return 0

    logger.info(f"Embedding {len(chunks)} chunks from '{filename}' ...")
    embeddings = embed_texts(openai_client, chunks)

    vectors = []
    base_meta = extra_metadata or {}
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        vectors.append({
            "id": make_file_chunk_id(filename, i),
            "values": embedding,
            "metadata": {
                "source": filename,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "text": chunk[:1000],   # store first 1000 chars for retrieval display
                **base_meta,
            },
        })

    upserted = upsert_vectors(pinecone_index, vectors)
    logger.info(f"Upserted {upserted} vectors for '{filename}'.")
    return upserted


# ── High-level: ingest product catalog ─────────────────────────────────────

def ingest_products(
    openai_client: OpenAI,
    pinecone_index: Any,
    products: list[dict],
    make_embed_text_fn,
) -> int:
    """Embed and upsert structured product records."""
    texts = [make_embed_text_fn(p) for p in products]
    embeddings = embed_texts(openai_client, texts)

    vectors = []
    for product, embedding, text in zip(products, embeddings, texts):
        vectors.append({
            "id": make_product_id(product["id"]),
            "values": embedding,
            "metadata": {
                "id": product["id"],
                "name": product["name"],
                "type": product["type"],
                "price": product["price"],
                "size": product["size"],
                "shortDesc": product["shortDesc"],
                "skinTypes": ", ".join(product["skinTypes"]),
                "concerns": ", ".join(product["concerns"]),
                "badge": product.get("badge") or "",
                "source": "product_catalog",
                "text": text,
            },
        })

    return upsert_vectors(pinecone_index, vectors)
