/**
 * Small dependency-free CLI for consumers of the cost model.
 * Usage: node scripts/cost.mjs --market FR --route cloud --device xbox-one --hours 40
 * Outputs JSON, including unresolved amounts and the provenance of each line.
 */
import { calculate, defaultScenario, parseMoney } from '../src/engine.mjs';
import { HARDWARE_REFERENCES } from '../src/catalog.mjs';

const names = new Map([
  ['market', 'market'], ['edition', 'edition'], ['route', 'route'],
  ['device', 'platform'], ['hours', 'plannedHours'],
  ['cloud-mode', 'cloudPricingMode'], ['cloud-pack-hours', 'cloudHoursPerPack'],
]);
const monetaryNames = new Map([
  ['game-quote', 'gameCents'], ['hardware-quote', 'hardwareCents'],
  ['cloud-pack-price', 'cloudPackCents'], ['extras', 'extraCents'],
  ['resale', 'resaleCents'],
]);
function usage() {
  return [
    'Usage: node scripts/cost.mjs [options]',
    '  --market US|FR|GB|CA|AU|DE|ES|IT|JP',
    '  --edition standard|ultimate',
    '  --route own|buy|cloud',
    '  --device ps5-digital|ps5-disc|ps5-pro|xbox-series-s|xbox-series-x|xbox-one|pc-cloud|tv-cloud|phone-cloud',
    '  --hours INTEGER --cloud-mode official|custom|ad',
    '  --game-quote AMOUNT --hardware-quote AMOUNT --extras AMOUNT --resale AMOUNT',
    '  --cloud-pack-price AMOUNT --cloud-pack-hours INTEGER --tax-rate PERCENT',
    '  --use-official-hardware --help',
  ].join('\n');
}
function main(argv) {
  const args = defaultScenario();
  if (argv.includes('--help')) { console.log(usage()); return; }
  const values = new Map();
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (!flag.startsWith('--')) throw new Error(`Unexpected positional argument: ${flag}`);
    const name = flag.slice(2);
    if (name === 'use-official-hardware') { values.set(name, true); continue; }
    if (!names.has(name) && !monetaryNames.has(name) && name !== 'tax-rate') throw new Error(`Unknown flag: ${flag}`);
    const value = argv[++i];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (values.has(name)) throw new Error(`Duplicate flag: ${flag}`);
    values.set(name, value);
  }
  for (const [name, key] of names) {
    if (!values.has(name)) continue;
    const value = values.get(name);
    if (key === 'plannedHours' || key === 'cloudHoursPerPack') {
      if (!/^\d+$/.test(value)) throw new RangeError(`${name} must be a positive integer`);
      args[key] = Number(value);
    } else args[key] = value;
  }
  for (const [name,key] of monetaryNames) {
    if (!values.has(name)) continue;
    const parsed = parseMoney(values.get(name),args.market);
    if (parsed === null) throw new RangeError(`Invalid ${name} amount`);
    args[key] = parsed;
  }
  if (values.has('tax-rate')) {
    const rate = values.get('tax-rate');
    if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(rate) || Number(rate) > 100)
      throw new RangeError('tax-rate must be between 0 and 100 with at most two decimals');
    args.taxBasisPoints = Math.round(Number(rate) * 100);
  }
  if (values.has('use-official-hardware')) {
    const ref = HARDWARE_REFERENCES[`${args.market}:${args.platform}`];
    if (!ref) throw new RangeError('No first-party console quote for this market and device');
    args.hardwareCents = ref.amount;
    args.hardwareQuote = ref.id;
  }
  console.log(JSON.stringify({ scenario: args, result: calculate(args) }, null, 2));
}
try { main(process.argv.slice(2)); }
catch (error) { console.error(error.message); console.error(usage()); process.exitCode=1; }
