import hashlib

import bcrypt

# bcrypt has a 72-byte input limit. We SHA-256 prehash so any length input
# (including long JWT strings) hashes safely.
def _prehash(value: str) -> bytes:
    return hashlib.sha256(value.encode()).hexdigest().encode()


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(_prehash(plain), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(_prehash(plain), hashed.encode())
