/**
 * Keep the crawlable, zero-JavaScript price board synchronized with the actual
 * source catalog. The browser still replaces these rows on app startup.
 *
 * Usage:
 *   node scripts/render-seo.mjs
 *   node scripts/render-seo.mjs --check
 */
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { MARKETS, CLOUD_PACKS } from '../src/catalog.mjs';
import { printMoney } from '../src/engine.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const filename = resolve(root, 'index.html');
const start = '<!-- SEO_PRICE_ROWS_START -->';
const end = '<!-- SEO_PRICE_ROWS_END -->';

/** Escape untrusted strings destined for an HTML text node or quoted attribute. */
const escapeHTML = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

/** Create the canonical, first-party Xbox price board in meaningful HTML. */
export function renderPriceRows() {
  return Object.entries(MARKETS).map(([code, market]) => {
    const catalog = market.game.xbox;
    const pack = CLOUD_PACKS[code]?.find(item => item.hours === 50);
    if (!catalog?.source?.standard || !catalog?.prices) throw new Error(`Missing Xbox listing for ${code}`);
    if (!/^https:\/\/www\.xbox\.com\//.test(catalog.source.standard)) throw new Error(`Non-Xbox source for ${code}`);
    const columns = [
      `<td><span class="market-code">${escapeHTML(code)}</span>${escapeHTML(market.name)}</td>`,
      `<td>${escapeHTML(printMoney(catalog.prices.standard, code))}</td>`,
      `<td>${escapeHTML(printMoney(catalog.prices.ultimate, code))}</td>`,
      `<td>${pack ? escapeHTML(printMoney(pack.amount, code)) : 'Not verified'}</td>`,
      `<td><a href="${escapeHTML(catalog.source.standard)}" target="_blank" rel="noopener noreferrer">Xbox Store ↗</a></td>`,
    ];
    return `                <tr>${columns.join('')}</tr>`;
  }).join('\n');
}

export function renderDocument(source) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);
  if (startIndex < 0 || endIndex < 0 || startIndex >= endIndex ||
      source.indexOf(start, startIndex + 1) >= 0 || source.indexOf(end, endIndex + 1) >= 0) {
    throw new Error('Expected exactly one well-ordered static price board region');
  }
  return source.slice(0, startIndex + start.length) + '\n' + renderPriceRows() + '\n' + source.slice(endIndex);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const original = readFileSync(filename, 'utf8');
  const rendered = renderDocument(original);
  const check = process.argv.includes('--check');
  if (check) {
    assert.equal(original, rendered, 'Static price board is outdated: run npm run build:seo');
    console.log(`Static price board current for ${Object.keys(MARKETS).length} markets.`);
  } else {
    writeFileSync(filename, rendered);
    console.log(`Updated static price board for ${Object.keys(MARKETS).length} markets.`);
  }
}
