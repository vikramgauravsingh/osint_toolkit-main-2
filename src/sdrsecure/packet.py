from dataclasses import dataclass

MAGIC = b"SDRC"  # identifies our protocol
VERSION = 1


@dataclass
class Packet:
    src: bytes  # 4 bytes
    dst: bytes  # 4 bytes (b'BRTC' for broadcast)
    counter: int  # 0..2**64-1
    payload: bytes  # ciphertext
    nonce: bytes  # 12-byte AES-GCM nonce

    def encode(self) -> bytes:
        if len(self.src) != 4 or len(self.dst) != 4 or len(self.nonce) != 12:
            raise ValueError("invalid field lengths")
        header = (
            MAGIC
            + bytes([VERSION])
            + self.src
            + self.dst
            + self.counter.to_bytes(8, "big")
            + self.nonce
        )
        return header + self.payload

    @staticmethod
    def decode(data: bytes) -> "Packet":
        if len(data) < 4 + 1 + 4 + 4 + 8 + 12:
            raise ValueError("packet too short")
        if data[:4] != MAGIC:
            raise ValueError("bad magic")
        version = data[4]
        if version != VERSION:
            raise ValueError("unsupported version")
        src = data[5:9]
        dst = data[9:13]
        counter = int.from_bytes(data[13:21], "big")
        nonce = data[21:33]
        payload = data[33:]
        return Packet(src=src, dst=dst, counter=counter, payload=payload, nonce=nonce)
