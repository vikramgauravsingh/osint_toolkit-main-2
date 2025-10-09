# Stub for SDR transport using SoapySDR or GNU Radio
# Provides the same interface as UdpTransport: send(data), recv() -> iterator of bytes
from typing import Iterable


class SdrTransport:
    def __init__(self, **kwargs):
        self.cfg = kwargs
        # TODO: Implement with SoapySDR streaming or GNU Radio flowgraph hooks

    def send(self, data: bytes) -> None:
        raise NotImplementedError("SDR send not implemented yet")

    def recv(self) -> Iterable[bytes]:
        if False:
            yield b""
        return
