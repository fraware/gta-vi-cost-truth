import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MARKETS } from '../src/catalog.mjs';
import { renderDocument, renderPriceRows } from '../scripts/render-seo.mjs';

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const html = read('../index.html');
const base = 'https://fraware.github.io/gta-vi-cost-truth/';

test('canonical, Open Graph, Twitter and sitemap use the real project Pages URL', () => {
  assert.match(html, /<title>GTA VI Cost Calculator \(2026\) \| PS5, Xbox &amp; Cloud Costs<\/title>|<title>GTA VI Cost Calculator \(2026\) \| PS5, Xbox & Cloud Costs<\/title>/);
  assert.match(html, /<h1 id="hero-title">[\s\S]*?GTA VI COST CALCULATOR/);
  assert.match(html, /<meta name="description" content="[^"]+">/);
  assert.ok(html.includes(`<link rel="canonical" href="${base}">`));
  assert.ok(html.includes(`content="${base}assets/og.png"`));
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /property="og:image:alt"/);
  assert.match(html, /meta name="robots" content="index, follow, max-image-preview:large"/);
  const sitemap = read('../sitemap.xml');
  assert.ok(sitemap.includes(`<loc>${base}</loc>`));
  assert.equal((sitemap.match(/<loc>/g)||[]).length, 1, 'Shareable query URLs must not be indexed as separate pages');
});

test('the app structured data describes the free calculator, not the paid game', () => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'Missing static JSON-LD');
  const schema = JSON.parse(match[1]);
  assert.equal(schema['@type'], 'WebApplication');
  assert.equal(schema.url, base);
  assert.equal(schema.name, 'GTA VI Cost Truth');
  assert.equal(schema.offers.price, '0');
  assert.equal(schema.isAccessibleForFree, true);
  assert.doesNotMatch(JSON.stringify(schema), /aggregateRating|reviewCount/i);
});

test('static market rows are generated from source and do not depend on JavaScript', () => {
  assert.equal(renderDocument(html), html, 'Run npm run build:seo');
  const rows = renderPriceRows();
  assert.equal((rows.match(/<tr>/g) || []).length, Object.keys(MARKETS).length);
  for(const [key,m] of Object.entries(MARKETS)){
    assert.ok(rows.includes(`class="market-code">${key}</span>`));
    assert.ok(rows.includes(m.name));
  }
});

test('static FAQ addresses user questions with semantic HTML and truthful platform scope', () => {
  assert.match(html, /id="faq-title"/);
  assert.ok((html.match(/<details>/g)||[]).length >= 4);
  assert.match(html, /confirmed native launch platforms are PlayStation 5 and Xbox Series X\|S/);
  assert.match(html, /Native Windows PC pricing is excluded/);
});
