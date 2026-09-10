#!/usr/bin/env python3
"""Flat kneeboard icons — no photo textures."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

SHELL = (20, 24, 16, 255)
CARD = (244, 239, 220, 255)
INK = (12, 12, 8, 255)
CAUTION = (230, 194, 0, 255)
STITCH = (61, 74, 50, 255)
HOLD = (180, 20, 20, 255)
CREAM_EDGE = (184, 174, 144, 255)


def write_png(path: Path, w: int, h: int, pixels: bytearray) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    stride = w * 4
    for y in range(h):
        raw.append(0)
        raw.extend(pixels[y * stride : (y + 1) * stride])
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def fill_rect(
    px: bytearray, w: int, x0: int, y0: int, x1: int, y1: int, color: tuple[int, int, int, int]
) -> None:
    x0, x1 = max(0, x0), min(w, x1)
    y0, y1 = max(0, y0), min(w, y1)
    r, g, b, a = color
    for y in range(y0, y1):
        i = (y * w + x0) * 4
        for x in range(x0, x1):
            px[i : i + 4] = bytes((r, g, b, a))
            i += 4


def stroke_rect(
    px: bytearray,
    w: int,
    x0: int,
    y0: int,
    x1: int,
    y1: int,
    color: tuple[int, int, int, int],
    t: int = 2,
) -> None:
    fill_rect(px, w, x0, y0, x1, y0 + t, color)
    fill_rect(px, w, x0, y1 - t, x1, y1, color)
    fill_rect(px, w, x0, y0, x0 + t, y1, color)
    fill_rect(px, w, x1 - t, y0, x1, y1, color)


def dashed_rect(
    px: bytearray,
    w: int,
    x0: int,
    y0: int,
    x1: int,
    y1: int,
    color: tuple[int, int, int, int],
    dash: int = 6,
    gap: int = 4,
) -> None:
    def dash_h(y: int, xa: int, xb: int) -> None:
        x = xa
        on = True
        while x < xb:
            nxt = min(xb, x + (dash if on else gap))
            if on:
                fill_rect(px, w, x, y, nxt, y + 2, color)
            on = not on
            x = nxt

    def dash_v(x: int, ya: int, yb: int) -> None:
        y = ya
        on = True
        while y < yb:
            nxt = min(yb, y + (dash if on else gap))
            if on:
                fill_rect(px, w, x, y, x + 2, nxt, color)
            on = not on
            y = nxt

    dash_h(y0, x0, x1)
    dash_h(y1 - 2, x0, x1)
    dash_v(x0, y0, y1)
    dash_v(x1 - 2, y0, y1)


def box(px: bytearray, w: int, x: int, y: int, s: int, filled: bool) -> None:
    stroke_rect(px, w, x, y, x + s, y + s, INK, 3)
    if filled:
        fill_rect(px, w, x + 8, y + 8, x + s - 8, y + s - 8, INK)


def draw_icon(size: int, pad: int) -> bytearray:
    px = bytearray(size * size * 4)
    fill_rect(px, size, 0, 0, size, size, SHELL)
    dashed_rect(px, size, pad // 2, pad // 2, size - pad // 2, size - pad // 2, STITCH, 8, 5)

    cx0, cy0 = pad, pad + size // 18
    cx1, cy1 = size - pad, size - pad
    fill_rect(px, size, cx0, cy0, cx1, cy1, CARD)
    stroke_rect(px, size, cx0, cy0, cx1, cy1, CREAM_EDGE, 3)

    stripe_h = max(10, size // 22)
    fill_rect(px, size, cx0, cy0, cx1, cy0 + stripe_h, CAUTION)
    # caution hash on stripe
    step = max(8, size // 28)
    for i, x in enumerate(range(cx0, cx1, step)):
        if i % 2 == 0:
            fill_rect(px, size, x, cy0, min(cx1, x + step // 2), cy0 + stripe_h, INK)

    # checklist rows
    inner = cx0 + size // 10
    s = max(22, size // 9)
    gap = s + size // 16
    y = cy0 + stripe_h + size // 12
    box(px, size, inner, y, s, True)
    fill_rect(px, size, inner + s + size // 18, y + s // 3, cx1 - size // 10, y + s // 3 + 4, INK)
    y += gap
    box(px, size, inner, y, s, True)
    fill_rect(px, size, inner + s + size // 18, y + s // 3, cx1 - size // 8, y + s // 3 + 4, INK)
    y += gap
    box(px, size, inner, y, s, False)
    fill_rect(px, size, inner + s + size // 18, y + s // 3, cx1 - size // 7, y + s // 3 + 4, INK)

    # red memory bar
    fill_rect(px, size, cx0, cy1 - size // 9, cx1, cy1, HOLD)
    return px


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out = root / "public" / "icons"
    out.mkdir(parents=True, exist_ok=True)

    for size, name, pad in (
        (192, "icon-192.png", 22),
        (512, "icon-512.png", 56),
        (192, "icon-192-maskable.png", 36),
        (512, "icon-512-maskable.png", 96),
        (180, "apple-touch-icon.png", 20),
    ):
        target = out / name if "apple" not in name else root / "public" / name
        write_png(target, size, size, draw_icon(size, pad))
        print("wrote", target)


if __name__ == "__main__":
    main()
