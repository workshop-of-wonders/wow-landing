#!/usr/bin/env python3
"""Revisa y corrige las métricas de las letras con tilde de EfectoWow-Regular.ttf.

Problema que resuelve: en la fuente original, glifos compuestos como É, Ñ, Ŕ, Ĺ o Ğ
(letra base + acento) traían en la tabla `hmtx` un ancho de avance y un margen izquierdo
que no coinciden con su dibujo (p. ej. É: avance 513 y lsb 77, cuando la E mide 563 y 48).
Los navegadores posicionan el glifo con esas cifras, así que la letra con tilde queda
corrida a la derecha y casi pegada a la siguiente (la É contra la T, por ejemplo).

Regla aplicada a cada glifo compuesto latino (letra base en 0,0 + acento) cuyo lsb no
coincide con su xMin:
  - lsb     = xMin real del dibujo
  - avance  = el de la letra base, o más si el acento sobresale (xMax + margen derecho de la base)

Uso (requiere `pip install fonttools`):
  python3 scripts/fix-font-metrics.py --check   # solo informa; sale con código 1 si hay glifos por corregir
  python3 scripts/fix-font-metrics.py --fix     # corrige design-system/fonts/EfectoWow-Regular.ttf en sitio

Si alguien exporta una nueva versión de la fuente, correr --fix antes de subirla y cambiar el
`?v=` de la URL en los @font-face (styles.css, admin/index.html, pronto/pronto.css, index-alt.html).
"""
import re
import sys
from fontTools.ttLib import TTFont

FONT = "design-system/fonts/EfectoWow-Regular.ttf"


def broken_glyphs(font):
    glyf, hmtx = font["glyf"], font["hmtx"]
    rev = {}
    for cp, name in font.getBestCmap().items():
        rev.setdefault(name, chr(cp))
    for name in font.getGlyphOrder():
        gl = glyf[name]
        if gl.numberOfContours == 0 or not gl.isComposite():
            continue
        gl.recalcBounds(glyf)
        adv, lsb = hmtx[name]
        if lsb == gl.xMin:
            continue  # métricas coherentes con el dibujo
        base = gl.components[0]
        if not re.fullmatch(r"[A-Za-z]", base.glyphName) or (base.x, base.y) != (0, 0):
            continue  # solo letra latina base + acento (no dígitos devanagari, ℓ, etc.)
        base_adv = hmtx[base.glyphName][0]
        base_gl = glyf[base.glyphName]
        base_gl.recalcBounds(glyf)
        base_rsb = base_adv - base_gl.xMax
        new_adv = max(base_adv, gl.xMax + base_rsb)
        yield name, rev.get(name, "?"), (adv, lsb), (new_adv, gl.xMin)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "--check"
    font = TTFont(FONT)
    todo = list(broken_glyphs(font))
    for name, ch, old, new in todo:
        print(f"{ch} ({name}): avance {old[0]} -> {new[0]}, lsb {old[1]} -> {new[1]}")
    print(f"{len(todo)} glifos con métricas incoherentes")
    if mode == "--fix" and todo:
        for name, _, _, new in todo:
            font["hmtx"][name] = new
        font.save(FONT)
        print(f"Fuente corregida: {FONT}")
    elif mode == "--check" and todo:
        sys.exit(1)


if __name__ == "__main__":
    main()
