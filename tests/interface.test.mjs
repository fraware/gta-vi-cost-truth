import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = filename => readFileSync(new URL(filename, import.meta.url), 'utf8');
const html = read('../index.html');
const app = read('../src/app.mjs');
const demoBuilder = read('../scripts/build-demo.mjs');

test('every statically referenced calculator ID exists in the published HTML', () => {
  const ids = [...new Set([...app.matchAll(/\$\(['"]([a-z][\w-]+)['"]\)/g)].map(m => m[1]))];
  assert.ok(ids.length >= 20, 'Selector audit unexpectedly short');
  for (const id of ids) assert.ok(html.includes(`id="${id}"`), `Missing DOM control #${id}`);
});

test('cloud controls are labelled and the rate selector has a manual fallback', () => {
  for (const id of ['cloud-pricing','planned-hours','cloud-pack','cloud-hours','platform']) {
    assert.ok(html.includes(`for="${id}"`), `Missing label for ${id}`);
  }
  assert.match(html, /option value="official"/);
  assert.match(html, /option value="custom"/);
  assert.match(html, /id="cloud-breakdown"/);
});

test('portable demo includes the pack optimiser and the published social graphic is a PNG', () => {
  assert.match(demoBuilder, /src\/cloud\.mjs/);
  assert.match(html, /og:image" content="https:\/\/fraware\.github\.io\/gta-vi-cost-truth\/assets\/og\.png"/);
  assert.match(html, /twitter:image/);
});

test('project does not inject tracking scripts, remote fonts, or inline external assets', () => {
  assert.doesNotMatch(html, /<script[^>]+src="https?:\/\//i);
  assert.doesNotMatch(html, /fonts\.googleapis|google-analytics|googletagmanager|plausible\.io/i);
});
