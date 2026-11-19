/** Verify committed JSON is an exact, reviewable mirror of the source catalog. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { deepStrictEqual } from 'node:assert/strict';
import { CLOUD_PACKS, HARDWARE_REFERENCES, MARKETS, VERIFIED_ON } from '../src/catalog.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const actual = JSON.parse(readFileSync(resolve(root, 'data/prices.json'), 'utf8'));
const expected = {
  schemaVersion: 1,
  snapshotDate: VERIFIED_ON,
  note: 'Dated manually checked first-party storefront prices; not a live feed or guaranteed checkout total.',
  markets: MARKETS,
  hardwareReferences: HARDWARE_REFERENCES,
  cloudPacks: CLOUD_PACKS,
};
deepStrictEqual(actual, JSON.parse(JSON.stringify(expected)),
  'Price snapshot diverged from catalog: run npm run build:data');
console.log(`Price data current for ${Object.keys(MARKETS).length} markets.`);
