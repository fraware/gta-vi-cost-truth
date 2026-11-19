import { HARDWARE, MARKETS, VERIFIED_ON, HARDWARE_REFERENCES, CLOUD_PACKS } from './catalog.mjs';
import { cheapestCloudPacks } from './cloud.mjs';

/**
 * Monetary values are integer minor units (cents/pence). For this catalog all
 * currencies have two decimal places; introduce currency metadata for others.
 * This engine does no currency conversion and never represents unknown as zero.
 */
export function parseMoney(value) {
  if (value === '' || value === null || value === undefined) return null;
  const s = String(value).trim().replace(',', '.');
  if (!/^(?:\d{1,7})(?:\.\d{1,2})?$/.test(s)) return null;
  const [whole, fractional = ''] = s.split('.');
  const cents = Number(whole) * 100 + Number(fractional.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents <= 999999999 ? cents : null;
}

export function printMoney(cents, market) {
  if (!Number.isSafeInteger(cents)) return 'Unknown';
  const m = MARKETS[market];
  if (!m) throw new RangeError(`Unknown market: ${market}`);
  return new Intl.NumberFormat(m.locale, {
    style: 'currency', currency: m.currency, minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function defaultScenario() {
  return {
    market: 'US', edition: 'standard', route: 'own', platform: 'ps5-digital',
    hardwareCents: null, hardwareQuote: 'personal', extraCents: 0,
    taxBasisPoints: null, resaleCents: null, cloudPackCents: null,
    cloudHoursPerPack: null, plannedHours: 40, cloudPricingMode: 'official',
  };
}

function money(value, field, { nullable = true } = {}) {
  if (value === null && nullable) return null;
  if (!Number.isSafeInteger(value) || value < 0 || value > 999999999)
    throw new RangeError(`${field} must be a nonnegative integer of minor currency units`);
  return value;
}

/**
 * Return a receipt with typed evidence and explicit unresolved obligations.
 * Cash now is never offset by hypothetical future resale. Unknown local taxes
 * and unknown cloud tariffs block an all-in checkout figure.
 */
export function calculate(input) {
  if (!input || !MARKETS[input.market]) throw new RangeError('Unsupported market');
  if (!['standard', 'ultimate'].includes(input.edition)) throw new RangeError('Unsupported edition');
  if (!['own', 'buy', 'cloud'].includes(input.route)) throw new RangeError('Unsupported route');
  if (!HARDWARE[input.platform]) throw new RangeError('Unsupported hardware');
  // The GTA VI announcement specifically confirms Xbox-console cloud access.
  // General Xbox Cloud Gaming device compatibility is not GTA VI support evidence.
  if (input.route === 'cloud' && !['xbox-one','xbox-series-s','xbox-series-x'].includes(input.platform))
    throw new RangeError('GTA VI cloud streaming is documented for Xbox consoles');
  if (input.route !== 'cloud' && (input.platform === 'xbox-one' || HARDWARE[input.platform].cloudOnly))
    throw new RangeError('Selected device has no confirmed native GTA VI release');

  const market = MARKETS[input.market];
  const game = market.prices[input.edition];
  const extra = money(input.extraCents, 'Extra expenditure', { nullable: false });
  const lines = [{
    id: 'game', label: `GTA VI · ${input.edition === 'standard' ? 'Standard' : 'Ultimate'}`,
    cents: game, evidence: 'verified', source: HARDWARE[input.platform].ecosystem === 'xbox' ? market.xboxSource[input.edition] : market.source[input.edition],
    checked: VERIFIED_ON,
  }];
  let subtotal = game + extra;
  const unknown = [];
  if (input.route === 'buy') {
    const hardware = money(input.hardwareCents, 'Hardware price');
    if (hardware === null) {
      unknown.push('Console quotation');
      lines.push({ id: 'hardware', label: HARDWARE[input.platform].label, cents: null, evidence: 'unknown' });
    } else {
      subtotal += hardware;
      const reference = HARDWARE_REFERENCES[`${input.market}:${input.platform}`];
      const verified = !!reference && input.hardwareQuote === reference.id &&
        hardware === reference.cents;
      lines.push({
        id: 'hardware', label: HARDWARE[input.platform].label, cents: hardware,
        evidence: verified ? 'verified' : 'entered',
        source: verified ? reference.source : null,
        checked: verified ? reference.verifiedOn : null,
      });
    }
  }
  if (extra > 0) lines.push({ id: 'extras', label: 'Other one-time costs', cents: extra, evidence: 'entered' });

  let cloudPlan = null;
  if (input.route === 'cloud') {
    const hours = input.plannedHours;
    if (!Number.isInteger(hours) || hours < 1 || hours > 10000)
      throw new RangeError('Planned hours must be between 1 and 10,000');
    const mode = input.cloudPricingMode ?? 'official';
    if (!['official', 'custom'].includes(mode))
      throw new RangeError('Unsupported cloud pricing mode');
    if (mode === 'official') {
      cloudPlan = cheapestCloudPacks(hours, CLOUD_PACKS[input.market]);
      for (const pack of cloudPlan.selection) {
        const cents = pack.cents * pack.quantity;
        subtotal += cents;
        lines.push({
          id: `cloud-${pack.hours}`, label: `Cloud access · ${pack.quantity} × ${pack.hours}h pack`,
          cents, evidence: 'verified', source: pack.source, checked: VERIFIED_ON,
        });
      }
    } else {
      const pack = money(input.cloudPackCents, 'Cloud pack price');
      const perPack = input.cloudHoursPerPack;
      if (pack === null || !Number.isInteger(perPack) || perPack < 1 || perPack > 10000) {
        unknown.push('Cloud-play tariff');
        lines.push({ id: 'cloud', label: `Cloud access · ${hours} planned hours`, cents: null, evidence: 'unknown' });
      } else {
        const count = Math.ceil(hours / perPack);
        const cloudCost = count * pack;
        subtotal += cloudCost;
        cloudPlan = { totalCents: cloudCost, coveredHours: count * perPack, unusedHours: count * perPack - hours,
          selection: [{ hours: perPack, cents: pack, quantity: count }] };
        lines.push({ id: 'cloud', label: `Cloud access · ${count} × ${perPack}h pack`, cents: cloudCost, evidence: 'entered' });
      }
    }
  }
  let tax = 0;
  if (!market.taxesIncluded) {
    const bps = input.taxBasisPoints;
    if (bps === null || bps === undefined) {
      unknown.push('Applicable sales tax');
      tax = null;
      lines.push({ id: 'tax', label: 'Sales tax · rate not entered', cents: null, evidence: 'unknown' });
    } else {
      if (!Number.isInteger(bps) || bps < 0 || bps > 10000)
        throw new RangeError('Illustrative tax percentage outside 0–100%');
      tax = Math.round((subtotal * bps) / 10000);
      lines.push({ id: 'tax', label: `Estimated sales tax · ${(bps / 100).toFixed(2)}%`, cents: tax, evidence: 'entered' });
    }
  }
  const resale = input.route === 'buy' ? money(input.resaleCents, 'Projected resale') : null;
  const checkout = unknown.length === 0 && tax !== null ? subtotal + tax : null;
  const net = checkout !== null && resale !== null ? checkout - resale : null;
  return {
    currency: market.currency, market: input.market, edition: input.edition,
    route: input.route, lines, subtotal, checkout, cloudPlan, futureNetIfResold: net,
    estimatedFutureResale: resale, unknown, fullyPriced: unknown.length === 0,
    assumptions: [
      'Published game prices are dated snapshots; verify again before purchase.',
      ...(market.taxesIncluded ? ['Storefront game price includes local indirect tax.'] :
        ['US tax model applies one illustrative rate to all selected items; actual tax can differ.']),
      ...(input.route === 'cloud' ? ['Official cloud prices are dated first-party store snapshots; eligibility, streaming availability and ad-supported alternatives differ by account and region.', 'Unused prepaid hours are not a refund or a guaranteed resale value.'] : []),
      ...(resale !== null ? ['Future resale is a personal estimate, not guaranteed money or a checkout discount.'] : []),
    ],
  };
}

/** URL payload encodes scenario values only; no user identity or location is read. */
export function encodeScenario(scenario) {
  const keys = Object.keys(defaultScenario());
  const payload = Object.fromEntries(keys.map(k => [k, scenario[k] ?? null]));
  const json = JSON.stringify(payload);
  // encodeURIComponent ensures an ASCII, URL-safe and Unicode-safe payload.
  return encodeURIComponent(json);
}

/** Strict bounded decode avoids oversized or malformed shared links. */
export function decodeScenario(payload) {
  if (!payload || typeof payload !== 'string' || payload.length > 4096) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(payload));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const defaults = defaultScenario();
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      if (Object.hasOwn(parsed, key)) result[key] = parsed[key];
    }
    // Shared URLs are untrusted input. Validate *inactive* fields as well:
    // an invalid hidden cloud quote must not crash the UI if the user toggles routes.
    for (const field of ['hardwareCents','resaleCents','cloudPackCents']) {
      const value = result[field];
      if (value !== null && (!Number.isSafeInteger(value) || value < 0 || value > 999999999))
        return null;
    }
    if (!Number.isSafeInteger(result.extraCents) || result.extraCents < 0 || result.extraCents > 999999999)
      return null;
    if (result.taxBasisPoints !== null &&
        (!Number.isInteger(result.taxBasisPoints) || result.taxBasisPoints < 0 || result.taxBasisPoints > 10000))
      return null;
    if (!Number.isInteger(result.plannedHours) || result.plannedHours < 1 || result.plannedHours > 10000)
      return null;
    if (result.cloudHoursPerPack !== null &&
        (!Number.isInteger(result.cloudHoursPerPack) || result.cloudHoursPerPack < 1 || result.cloudHoursPerPack > 10000))
      return null;
    if (!['official','custom'].includes(result.cloudPricingMode))
      return null;
    if (typeof result.hardwareQuote !== 'string' || result.hardwareQuote.length > 100)
      return null;
    calculate(result);
    return result;
  } catch { return null; }
}
