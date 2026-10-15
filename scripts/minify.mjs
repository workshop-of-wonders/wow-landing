// Minifica los assets de src/ hacia las rutas públicas (styles.css y js/*.js).
// Uso: npm run minify (requiere esbuild, devDependency).
import { build } from 'esbuild';
import { readdirSync } from 'node:fs';

const js = readdirSync('src/js').filter((f) => f.endsWith('.js')).map((f) => `src/js/${f}`);
await build({ entryPoints: js, outdir: 'js', minify: true, legalComments: 'none', logLevel: 'info' });
await build({ entryPoints: ['src/styles.css'], outfile: 'styles.css', minify: true, logLevel: 'info' });
