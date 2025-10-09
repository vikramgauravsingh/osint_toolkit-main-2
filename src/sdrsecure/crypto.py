from dataclasses import dataclass
from typing import Tuple
import secrets

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

NONCE_LEN = 12


@dataclass
class KeyMaterial:
    psk: bytes  # 16/24/32 bytes


def derive_session(psk: bytes) -> Tuple[bytes, bytes]:
    """Return (key, nonce_prefix) where nonce_prefix is 4 random bytes.

    A full PFS handshake (e.g., X25519) can be added later. For now we
    rely on a pre-shared key and randomized nonce prefixes to avoid
    nonce reuse across program executions.
    """
    if len(psk) not in (16, 24, 32):
        raise ValueError("PSK must be 16, 24, or 32 bytes")
    nonce_prefix = secrets.token_bytes(4)
    return psk, nonce_prefix


def encrypt(
    psk: bytes,
    nonce_prefix: bytes,
    counter: int,
    plaintext: bytes,
    aad: bytes = b"",
) -> Tuple[bytes, bytes]:
    """Encrypt with AES-GCM using a 12-byte nonce: prefix + counter.

    - nonce_prefix: 4 random bytes unique per session
    - counter: 8-byte monotonically increasing integer
    - aad: associated data (authenticated but not encrypted)
    """
    if len(nonce_prefix) != 4:
        raise ValueError("nonce_prefix must be 4 bytes")
    aesgcm = AESGCM(psk)
    nonce = nonce_prefix + counter.to_bytes(8, "big")
    ciphertext = aesgcm.encrypt(nonce, plaintext, aad)
    return nonce, ciphertext


def decrypt(psk: bytes, nonce: bytes, ciphertext: bytes, aad: bytes = b"") -> bytes:
    if len(nonce) != NONCE_LEN:
        raise ValueError("nonce must be 12 bytes for AES-GCM")
    aesgcm = AESGCM(psk)
    return aesgcm.decrypt(nonce, ciphertext, aad)
