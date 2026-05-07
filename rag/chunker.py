"""
Split text into overlapping chunks for embedding.
Uses a sentence-aware approach: splits on paragraph / sentence
boundaries when possible so chunks don't cut mid-thought.
"""

import re

DEFAULT_CHUNK_SIZE = 400   # words per chunk
DEFAULT_OVERLAP = 60       # words of overlap between consecutive chunks


def chunk_text(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_OVERLAP,
) -> list[str]:
    """
    Split *text* into overlapping word-based chunks.

    1. Normalise whitespace.
    2. Split into sentences (rough heuristic).
    3. Accumulate sentences until chunk_size words is reached.
    4. Slide forward by (chunk_size - overlap) words.

    Returns a list of non-empty chunk strings.
    """
    text = _normalise(text)
    if not text:
        return []

    sentences = _split_sentences(text)
    words_per_sentence = [s.split() for s in sentences]

    chunks: list[str] = []
    current_words: list[str] = []

    for sentence_words in words_per_sentence:
        current_words.extend(sentence_words)

        if len(current_words) >= chunk_size:
            chunk = " ".join(current_words[:chunk_size])
            chunks.append(chunk)
            # slide forward, keeping the overlap tail
            current_words = current_words[chunk_size - overlap:]

    # Flush remaining words as the last chunk
    if current_words:
        last_chunk = " ".join(current_words)
        # avoid a tiny duplicate of the previous chunk's tail
        if not chunks or last_chunk != chunks[-1][-len(last_chunk):]:
            chunks.append(last_chunk)

    return [c for c in chunks if c.strip()]


def _normalise(text: str) -> str:
    """Collapse excessive whitespace and blank lines."""
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def _split_sentences(text: str) -> list[str]:
    """
    Split text into sentence-ish segments.
    Splits on:  .  !  ?  followed by whitespace + capital letter,
    and on paragraph breaks (\n\n).
    """
    # paragraph breaks → definite splits
    paragraphs = text.split("\n\n")
    sentences: list[str] = []
    sentence_end = re.compile(r"(?<=[.!?])\s+(?=[A-Z\"\'\(])")
    for para in paragraphs:
        parts = sentence_end.split(para.strip())
        sentences.extend(p.strip() for p in parts if p.strip())
    return sentences
