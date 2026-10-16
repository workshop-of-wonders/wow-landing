"""Genera api/_sims.json con la configuración de los simuladores de cuestionario del Playground
(preguntas con su peso y primer paso, niveles de resultado, servicio relacionado).

api/simulador.js la usa para calcular el puntaje en el servidor a partir de las respuestas (nunca del texto que mande el navegador):
así el correo del diagnóstico solo contiene contenido nuestro. Ejecutar de nuevo cada vez que cambie el JSON data-sim de una página:

    python -X utf8 scripts/build-sim-configs.py
"""
import glob
import json
import os
import re

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
hub = open(os.path.join(root, 'playground.html'), encoding='utf-8').read()
svc_of = {m.group(2): m.group(1) for m in re.finditer(r'data-svc="([^"]+)".*?href="playground/([^"]+)\.html"', hub, re.S)}

out = {}
for path in sorted(glob.glob(os.path.join(root, 'playground', '*.html'))):
    slug = os.path.basename(path)[:-5]
    html = open(path, encoding='utf-8').read()
    m = re.search(r'<script type="application/json"[^>]*>(.*?)</script>', html, re.S)
    if not m:
        continue
    try:
        c = json.loads(m.group(1))
    except ValueError:
        continue
    if c.get('type') == 'calc' or not c.get('qs') or not c.get('tiers'):
        continue
    out[slug] = {
        'title': c.get('title', slug),
        'qs': [{'q': q['q'], 'w': q['w'], 's': q['s']} for q in c['qs']],
        'tiers': c['tiers'],
        'none': c.get('none', ''),
        'service': svc_of.get(slug, ''),
    }

dest = os.path.join(root, 'api', '_sims.json')
with open(dest, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(len(out), 'simuladores:', ', '.join(out))
