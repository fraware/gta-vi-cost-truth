# Calculation API

The calculator is a plain ECMAScript module with no runtime dependencies. [src/index.mjs](../src/index.mjs) is the supported public entry point. This repository is **not** published as an npm registry package; import the module from a local checkout or a vendored source tree.

## Get started

```bash
git clone https://github.com/fraware/gta-vi-cost-truth.git
cd gta-vi-cost-truth
node --input-type=module <<'JS'
import { calculate, defaultScenario, printMoney } from './src/index.mjs';
const result = calculate({ ...defaultScenario(), market: 'FR', route: 'own', platform: 'ps5-digital' });
console.log(printMoney(result.checkout, result.market)); // 79,99 €
JS
```

For an existing consumer application, copy or vendor `src/index.mjs`, `src/engine.mjs`, `src/cloud.mjs`, and `src/catalog.mjs` together. Keep first-party source observations and dates attached to the catalog. This code executes in Node.js 20+ and modern browsers with ES module support.

## Exported functionality

| Export | Purpose |
| --- | --- |
| `calculate(scenario)` | Compute an evidence-labelled receipt without network access. |
| `defaultScenario()` | Produce a complete starting scenario with explicitly unresolved inputs. |
| `printMoney(minorUnits, market)` | Format a non-null integer amount using the market currency and its native precision. |
| `parseMoney(text, market)` | Parse a user-entered nonnegative monetary amount into integer minor units; invalid input returns `null`. |
| `cheapestCloudPacks(hours, packs)` | Find the minimum-cost set of whole prepaid packs, allowing unused hours. |
| `encodeScenario(scenario)` / `decodeScenario(string)` | Share an allowlisted, versioned scenario value. The decoder returns `null` on invalid input. |
| `MARKETS`, `CLOUD_PACKS`, `HARDWARE_REFERENCES`, `HARDWARE`, `SOURCES`, `VERIFIED_ON` | Dated source catalog and modelled routes. |

### Input contract

Start with `defaultScenario()` and override only the relevant fields.

| Field | Example | Interpretation |
| --- | --- | --- |
| `market` | `'US'` | Two-letter market key from `MARKETS`. The `GB` key represents the United Kingdom. |
| `edition` | `'standard'` | `'standard'` or `'ultimate'`. |
| `route` | `'own'` | `'own'`, `'buy'`, or `'cloud'`. |
| `platform` | `'xbox-series-s'` | Device key from `HARDWARE`; cloud-only devices have their own restrictions. |
| `gameCents` | `null` | Personal game quote in **minor units**, used exclusively if an official platform/market game price is absent. |
| `hardwareCents` | `null` | New or used console quote in minor units. `null` means unknown. |
| `hardwareQuote` | `'personal'` | Source identifier from a matching `HARDWARE_REFERENCES` entry for a first-party hardware quotation. |
| `extraCents` | `0` | Nonnegative optional expenses. A zero is an explicit zero; it is not an unresolved amount. |
| `taxBasisPoints` | `825` | Local estimated tax: `825` = 8.25%. `null` leaves the result incomplete in sales-tax markets. |
| `resaleCents` | `null` | Speculative future proceeds, **separate** from initial expenditure. |
| `plannedHours` | `40` | Positive integer hours, up to 10,000. |
| `cloudPricingMode` | `'official'` | `'official'` for regional prepaid packs, `'custom'` for a personal rate, `'ad'` for conditional ad access. |
| `cloudPackCents`, `cloudHoursPerPack` | `null`, `null` | Personal cloud quote used with `'custom'` mode. Values use the selected currency's minor units. |

All amounts are integers. `JPY` is a zero-decimal currency, while `USD`, `EUR`, `GBP`, `CAD` and `AUD` have two decimals. Cross-currency conversion is never performed. The function throws `RangeError` for invalid states or monetary amounts.

### Receipt contract

```js
import { calculate, defaultScenario } from './src/index.mjs';

const result = calculate({
  ...defaultScenario(),
  market: 'US',
  route: 'buy',
  platform: 'xbox-series-s',
  hardwareCents: 49999,
  taxBasisPoints: null,
});

console.log(result.subtotal);     // Known subtotal, in US cents
console.log(result.checkout);     // null, since local sales tax is unknown
console.log(result.unknown);      // ['Local sales tax']
console.log(result.fullyPriced);  // false
console.log(result.lines);        // Each row has its own evidence and source
```

`checkout` is the complete projected expenditure only if `unknown` is empty. Otherwise `checkout === null`, even though `subtotal` contains the sum of known line items. `fullyPriced` means all modelled inputs are resolved; it does **not** certify the source catalog as a current checkout price or establish streaming eligibility. The `lines` array carries `id`, `label`, `amount`, `evidence`, `source`, `category`, and `checked` (date).

Line-item evidence values are `verified` (dated first-party listing), `entered` (visitor-provided quote), `unknown` (no reliable amount), and `conditional` (access model cannot be fully priced or verified). `verified` refers to **recorded first-party evidence**, never a live price feed.

With the `buy` route, `estimatedFutureResale` and `futureNetIfResold` are supplementary figures; potential proceeds are not subtracted from `checkout`. For cloud packs, `cloudPlan` includes `totalAmount`, `coveredHours`, `unusedHours`, and a `selection` of whole purchased packs.

### CLI

```bash
node scripts/cost.mjs --market FR --route cloud --device xbox-one --hours 40
node scripts/cost.mjs --market US --route buy --device xbox-series-s --use-official-hardware --tax-rate 8.25
node scripts/cost.mjs --help
```

The CLI prints JSON for independent tooling. See [`data/prices.json`](../data/prices.json) and [the data guide](DATA.md) for reuse of the price snapshot without running JavaScript.

## Compatibility and trust boundary

The code reads a local source catalog and does not call external services at runtime. The repository does not provide an availability guarantee, tax advice, or a subscription entitlement check. Upstream vendor pages are independent of this project and might change. Pin a Git commit for reproducible downstream use; treat snapshot revisions as data changes that need review. Shared scenario strings are untrusted input and must pass `decodeScenario` before use.
