import argparse
import os
import sys
import secrets
import base64
import time

from .crypto import derive_session, encrypt, decrypt
from .packet import Packet
from .transport.udp import UdpTransport
from .transport.sdr import SdrTransport


def parse_args():
    p = argparse.ArgumentParser(
        description="Encrypted SDR chat over UDP or SDR (stub)"
    )
    p.add_argument("--id", default="NODE", help="4-char node id (default NODE)")
    p.add_argument("--peer-id", default="PEER", help="4-char peer id")
    p.add_argument(
        "--psk",
        help=(
            "Base64 PSK (16/24/32 bytes). If absent, read SDRSECURE_PSK env or generate ephemeral"
        ),
    )
    p.add_argument("--transport", choices=["udp", "sdr"], default="udp")
    p.add_argument("--bind", default="127.0.0.1:9001")
    p.add_argument("--peer", default="127.0.0.1:9002")
    # SDR options are placeholders for future implementation
    p.add_argument("--sdr-args", default="", help="Driver/device args for SoapySDR/GNU Radio")
    p.add_argument("--sdr-freq", type=float, default=915e6, help="Center frequency (Hz)")
    p.add_argument("--sdr-rate", type=float, default=250e3, help="Sample rate (sps)")
    p.add_argument("--sdr-gain", type=float, default=30.0, help="TX/RX gain (dB)")
    p.add_argument("--mode", choices=["send", "recv", "chat"], default="chat")
    return p.parse_args()


def load_psk(b64: str | None) -> bytes:
    val = b64 or os.environ.get("SDRSECURE_PSK")
    if val:
        return base64.b64decode(val)
    # default dev mode: random 32-byte key announced to user
    key = secrets.token_bytes(32)
    print(
        "Generated random PSK (base64):",
        base64.b64encode(key).decode(),
        file=sys.stderr,
    )
    return key


def main():
    args = parse_args()
    node_id = args.id.encode()[:4].ljust(4, b" ")
    peer_id = args.peer_id.encode()[:4].ljust(4, b" ")
    psk = load_psk(args.psk)
    key, nonce_prefix = derive_session(psk)

    bind_host, bind_port = args.bind.split(":")
    peer_host, peer_port = args.peer.split(":")
    if args.transport == "udp":
        transport = UdpTransport((bind_host, int(bind_port)), (peer_host, int(peer_port)))
    else:
        transport = SdrTransport(
            device_args=args.sdr_args,
            center_freq=args.sdr_freq,
            sample_rate=args.sdr_rate,
            gain=args.sdr_gain,
        )

    counter = 0

    if args.mode == "recv":
        print("Listening...")
        while True:
            for raw in transport.recv():
                try:
                    pkt = Packet.decode(raw)
                    if pkt.dst not in (node_id, b"BRTC"):
                        continue
                    pt = decrypt(
                        key,
                        pkt.nonce,
                        pkt.payload,
                        aad=pkt.src + pkt.dst + pkt.counter.to_bytes(8, "big"),
                    )
                    print(
                        f"{pkt.src.decode(errors='ignore').strip()}: {pt.decode(errors='ignore')}"
                    )
                except Exception as e:  # noqa: BLE001
                    print("Drop packet:", e, file=sys.stderr)
            time.sleep(0.05)
        return

    def send_text(text: str):
        nonlocal counter
        nonce, ct = encrypt(
            key,
            nonce_prefix,
            counter,
            text.encode(),
            aad=node_id + peer_id + counter.to_bytes(8, "big"),
        )
        pkt = Packet(src=node_id, dst=peer_id, counter=counter, payload=ct, nonce=nonce)
        transport.send(pkt.encode())
        counter += 1

    if args.mode == "send":
        for line in sys.stdin:
            line = line.rstrip("\n")
            if not line:
                continue
            send_text(line)
        return

    # chat mode
    print("Type messages, Ctrl+C to exit")
    try:
        while True:
            for raw in transport.recv():
                try:
                    pkt = Packet.decode(raw)
                    if pkt.dst not in (node_id, b"BRTC"):
                        continue
                    pt = decrypt(
                        key,
                        pkt.nonce,
                        pkt.payload,
                        aad=pkt.src + pkt.dst + pkt.counter.to_bytes(8, "big"),
                    )
                    print(
                        f"\n{pkt.src.decode(errors='ignore').strip()}: {pt.decode(errors='ignore')}\n> ",
                        end="",
                        flush=True,
                    )
                except Exception as e:  # noqa: BLE001
                    print("\nDrop packet:", e, file=sys.stderr)
            line = input("> ")
            if line:
                send_text(line)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
