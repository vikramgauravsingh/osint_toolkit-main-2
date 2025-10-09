import socket
from typing import Tuple, Iterable


class UdpTransport:
    def __init__(self, bind: Tuple[str, int], peer: Tuple[str, int]):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind(bind)
        self.peer = peer
        self.sock.settimeout(0.2)

    def send(self, data: bytes) -> None:
        self.sock.sendto(data, self.peer)

    def recv(self) -> Iterable[bytes]:
        try:
            data, _ = self.sock.recvfrom(4096)
            yield data
        except socket.timeout:
            return
