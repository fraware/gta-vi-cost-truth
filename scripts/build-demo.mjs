/**
 * Generate a local single-file preview from the same modular sources.
 * No external packages, network calls, or build service.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(resolve(root,name),'utf8');
let html = read('index.html');
const css = read('src/style.css');
const favicon = readFileSync(resolve(root,'assets/favicon.svg')).toString('base64');
const js = ['src/catalog.mjs','src/engine.mjs','src/app.mjs']
  .map(name => read(name).replace(/^import .*?;\s*$/gm,'').replace(/^export (?=(?:const|function|class)\b)/gm,''))
  .join('\n\n');
html = html.replace('<link rel="stylesheet" href="./src/style.css">','<style>\n' + css.replace(/<\/style/gi,'<\\/style') + '\n</style>');
html = html.replace('<script type="module" src="./src/app.mjs"></script>','');
html = html.replace('</body>',() => '<script>\n(()=>{\n' + js.replace(/<\/script/gi,'<\\/script') + '\n})();\n</script>\n</body>');
html = html.replace('href="./assets/favicon.svg"','href="data:image/svg+xml;base64,' + favicon + '"');
const dest=resolve(root,'dist/standalone.html');
mkdirSync(dirname(dest),{recursive:true});
writeFileSync(dest,html);
console.log('Created ' + dest);
