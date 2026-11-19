/**
 * Produce a fully portable preview of the site as one HTML file.
 * Source modules remain intact; the preview inlines the same source bytes.
 * Suitable for opening directly from disk without an HTTP server.
 *
 * No network, third-party dependencies, minification, or code generation APIs.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(resolve(root, name), 'utf8');
let html = read('index.html');
const css = read('src/style.css');
const favicon = readFileSync(resolve(root, 'assets/favicon.svg')).toString('base64');
const sourceFiles = ['src/catalog.mjs','src/cloud.mjs','src/engine.mjs','src/app.mjs'];
const bundle = sourceFiles.map(name => read(name)
  .replace(/^import .*?;\s*$/gm, '')
  .replace(/^export (?=(?:const|function|class)\b)/gm, '')).join('\n\n');
html = html.replace('<link rel="stylesheet" href="./src/style.css">',
  `<style>\n${css.replace(/<\/style/gi, '<\\/style')}\n</style>`);
html = html.replace('<script type="module" src="./src/app.mjs"></script>', '');
html = html.replace('</body>', () =>
  `<script>\n(()=>{\n${bundle.replace(/<\/script/gi, '<\\/script')}\n})();\n</script>\n</body>`);
html = html.replace('href="./assets/favicon.svg"', `href="data:image/svg+xml;base64,${favicon}"`);
html = html.replace('<a href="./SOURCE_NOTES.md" class="small-link">Read the full evidence log ↗</a>',
  '<span class="small-link">Evidence log is included in the project source package</span>');
const output = resolve(root, 'dist', 'standalone.html');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, html);
console.log(`Created ${output}`);
