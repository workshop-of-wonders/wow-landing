// Panel de simuladores del Playground. Una sola función (límite de funciones de Vercel):
//   GET /playground?view=sims                 -> lista de simuladores con conteos de leads y usos
//   GET /playground?view=leads&sim=SLUG       -> leads de ese simulador ('otros' = los que vienen de páginas de servicio)
//   GET /playground?view=runs&sim=SLUG        -> usos registrados (link usado + resultado)
//   GET /playground?view=template&sim=SLUG    -> correo que se envía (asunto, texto y HTML de ejemplo)
const { requireAuth } = require('./_auth');

// slug = nombre del archivo en /playground/. tracksRuns/hasEmail: hoy solo el simulador de encabezados guarda usos y envía correo.
const SIMS = [
  { slug: 'encabezados', name: 'Encabezados H1–H6', tracksRuns: true, hasEmail: true },
  { slug: 'colores', name: 'Colores según tu sector' },
  { slug: 'keywords', name: 'Generador de keywords' },
  { slug: 'visibilidad-google', name: 'Visibilidad en Google' },
  { slug: 'ranking-mes-a-mes', name: 'Ranking mes a mes' },
  { slug: 'te-encuentran-cerca', name: 'Te encuentran cerca' },
  { slug: 'ias-te-citan', name: 'IAs te citan' },
  { slug: 'web-lista', name: 'Web lista para trabajar' },
  { slug: 'carritos-abandonados', name: 'Carritos abandonados' },
  { slug: 'pauta-retorno', name: 'Retorno de pauta' },
  { slug: 'medicion-instalada', name: 'Medición instalada' },
  { slug: 'datos-que-deciden', name: 'Datos que deciden' },
  { slug: 'madurez-de-datos', name: 'Madurez de datos' },
  { slug: 'marca-consistente', name: 'Marca consistente' },
  { slug: 'otros', name: 'Desde páginas de servicio' }
];

function localNoDb() { return !process.env.VERCEL && !process.env.POSTGRES_URL && !process.env.DATABASE_URL; }

// Leads de un simulador: página /playground/<slug>…; 'otros' = need "Playground: …" que no vienen de /playground/.
async function leadsFor(slug) {
  if (localNoDb()) return [];
  const { sql } = require('./_db');
  if (slug === 'otros') {
    return (await sql`SELECT * FROM leads WHERE need ILIKE 'Playground:%' AND COALESCE(page, '') NOT LIKE '/playground/%' ORDER BY created_at DESC LIMIT 500`).rows;
  }
  const like = '/playground/' + slug + '%';
  return (await sql`SELECT * FROM leads WHERE page LIKE ${like} ORDER BY created_at DESC LIMIT 500`).rows;
}

async function leadCounts() {
  const out = {};
  if (localNoDb()) return out;
  const { sql } = require('./_db');
  const r = await sql`SELECT CASE WHEN page LIKE '/playground/%' THEN split_part(split_part(split_part(page, '/', 3), '.', 1), '#', 1) ELSE 'otros' END AS sim, COUNT(*)::int AS n
    FROM leads WHERE need ILIKE 'Playground:%' OR page LIKE '/playground/%' GROUP BY 1`;
  r.rows.forEach((x) => { out[x.sim] = x.n; });
  return out;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  const view = typeof req.query.view === 'string' ? req.query.view : 'sims';
  const sim = SIMS.find((s) => s.slug === req.query.sim);
  try {
    if (view === 'sims') {
      const [leads, runs] = await Promise.all([leadCounts(), require('../_runs').countRuns().catch(() => ({}))]);
      return res.status(200).json({ success: true, sims: SIMS.map((s) => ({ ...s, leads: leads[s.slug] || 0, runs: runs[s.slug] || 0 })) });
    }
    if (!sim) return res.status(404).json({ success: false, error: 'unknown_sim' });
    if (view === 'leads') return res.status(200).json({ success: true, sim, leads: await leadsFor(sim.slug) });
    if (view === 'runs') {
      const runs = sim.tracksRuns ? await require('../_runs').listRuns(sim.slug, req.query.limit) : [];
      return res.status(200).json({ success: true, sim, runs });
    }
    if (view === 'template') {
      const mail = sim.hasEmail ? require('../_diagnostico').sampleEmail(sim.slug) : null;
      return res.status(200).json({ success: true, sim, template: mail ? { subject: mail.subject, text: mail.text, html: mail.html, sample: true } : null });
    }
    return res.status(400).json({ success: false, error: 'bad_view' });
  } catch (e) {
    console.error('admin/playground:', e);
    return res.status(500).json({ success: false, error: 'server_error' });
  }
};
