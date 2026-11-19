/**
 * Export the first-party data snapshot in a portable, machine-readable format.
 * The catalog is maintained in source control and is never scraped at runtime.
 * Usage: node scripts/export-data.mjs [output-path]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLOUD_PACKS, HARDWARE_REFERENCES, MARKETS, VERIFIED_ON } from '../src/catalog.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, process.argv[2] ?? 'data/prices.json');
if (!out.startsWith(root + '/')) throw new Error('Output must be inside the project directory.');
const payload = {
  schemaVersion: 1,
  snapshotDate: VERIFIED_ON,
  note: 'Dated manually checked first-party storefront prices; not a live feed or guaranteed checkout total.',
  markets: MARKETS,
  hardwareReferences: HARDWARE_REFERENCES,
  cloudPacks: CLOUD_PACKS,
};
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload, null, 2) + '\n');
console.log(`Price snapshot written to ${out}`);
