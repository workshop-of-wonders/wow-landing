# wow-landing

Sitio de Workshop of Wonders (WoW). Estático (HTML/CSS/JS vanilla, sin build) + `api/` serverless (Node ≥20) para el panel `/admin` y el formulario de contacto. Hosting Vercel, auto-deploy desde `main`.

## Cómo correrlo
- `python -m http.server 8843` (config en `.claude/launch.json`). `/api` solo funciona en Vercel.

## Reglas clave
- **CHANGELOG.md**: lee solo las secciones de arriba (Project links, Pending, Key decisions) y el Log reciente. **Nunca leas `CHANGELOG-archive.md` entero** — si necesitás historia vieja, hacé grep puntual.
- Portafolio (texto/fotos de proyectos) se edita vía `/admin` → Publicar, no a mano en `index.html`/`portafolio.html` (se sobreescribe).
- Naming vigente: Wonder · Optimize · Win + Brand & Experience Lab + Insight Lab. CREA/CRECE/DEFINE/Core Lab están retirados — no reintroducir.
- `index-alt.html` es un home alternativo huérfano (noindex, sin enlazar) — no confundir con `index.html`.

## Marca
- Colores, tipografías y tono: ver `CHANGELOG.md` (Key decisions) — no repetir aquí, puede cambiar.

## Detalles y estructura
No explores el repo de cero: la estructura completa (páginas, estilos, stack del panel admin, pendientes) está en la memoria del proyecto (`wow-landing-repo-map`). Solo abrí los archivos que la tarea puntual necesite.
