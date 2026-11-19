# GTA VI Cost Truth

**The game costs $79.99 in the US. What will it actually cost you to play?**

An independent, evidence-backed calculator for the full cost of starting *Grand Theft Auto VI*. No login, backend, analytics, third-party fonts, or invented prices. All calculations run in the browser.

[Open the website](https://fraware.github.io/gta-vi-cost-truth/) (GitHub Pages must first be activated) · [See the price evidence](SOURCE_NOTES.md) · [Read the methodology](#method) · [Contribute](#contributing)

![Social preview showing GTA VI Cost Truth](assets/og.png)

## What it calculates

Choose a country, game edition, and way to play. The receipt separates **published prices**, **your own estimates**, and **unknown costs**. Every published item links to its storefront, with a verification date.

- **Already own a console:** game edition and optional extras. Compatible native platforms are PlayStation 5 / PS5 Pro and Xbox Series X|S.
- **Buy a console:** game + entered device quote + extras, with first-party US shortcuts for Xbox Series S ($499.99) and PlayStation 5 Digital 825 GB ($599.99). Resale projections are separated from upfront expenditure.
- **Use Xbox Cloud Gaming:** game + the least-expensive combination of official **10-, 25-, and 50-hour prepaid packs** in the US, France, or UK. GTA VI-specific launch-day cloud playback is represented for Xbox One and Xbox Series X|S. Microsoft lists additional devices for its cloud service generally; that broader eligibility has not been established for this game. A different personal cloud tariff can also be entered. Device, account, game, and regional eligibility must be verified with Xbox.

**Sample:** Playing 40 hours of the US Standard Edition through Xbox Cloud Gaming uses one 50-hour pack, $11.99, plus the $79.99 game. The modelled *known subtotal* is **$91.98**, before applicable US sales tax and personal extras. Buying four 10-hour packs would cost $15.96; the optimiser avoids that excess. The 10 unused prepaid hours are disclosed.

## Price ledger

All figures below are manually recorded **first-party storefront snapshots, checked November 19, 2026**, and might differ from a subsequent checkout. They are not a continuously refreshed data feed.

| Market | Standard | Ultimate | Cloud 10h | Cloud 25h | Cloud 50h |
| --- | ---: | ---: | ---: | ---: | ---: |
| United States | $79.99 | $99.99 | $3.99 | $7.99 | $11.99 |
| France | €79.99 | €99.99 | €3.49 | €6.99 | €10.99 |
| United Kingdom | £69.99 | £89.99 | £2.99 | £5.99 | £8.99 |

Direct retailer URLs, device references, and inclusion criteria are in [SOURCE_NOTES.md](SOURCE_NOTES.md). No FX conversion or guessed regional taxes are used. For the US, entering a sales-tax percentage produces an **illustrative** estimate. The actual tax base, jurisdiction, and final checkout treatment can vary.

Xbox also advertises ad-supported cloud access and monthly Game Pass hours in eligible circumstances. This product prices the separate prepaid-pack route, not every available entitlement. **Cloud gaming availability for a given game and account must be confirmed before a purchase.** The game purchase itself is separate.

## Method

The calculator uses integer minor currency units (cents or pence). A null quotation means **unknown**, not zero. A complete scenario receipt indicates that all *selected* inputs have values; it is never a guaranteed checkout quote.

For native console play:

```text
known subtotal = game + chosen extras + console price (if buying)
US illustrative sales tax = round(known subtotal × rate in basis points / 10,000)
scenario expenditure = known subtotal + tax, only if inputs are complete
contingent net after resale = scenario expenditure − entered resale estimate
```

For Xbox cloud packs, a bounded unbounded-knapsack algorithm finds the minimum price of whole packs that **cover at least the planned hours**. It also reports unused purchased hours, and does not assume prorated refunds, game inclusion in Game Pass, or unrestricted cloud access. For the cloud route, scenario expenditure encompasses hours used over time, not necessarily a single immediate charge.

## Run and test

Only a local static HTTP server is needed to use the website.

```sh
python3 -m http.server 8080
# visit http://localhost:8080
```

Use Node.js 20+ to reproduce the deterministic tests and build the offline demonstration.

```sh
npm test
npm run build:demo
```

The engine is in [src/engine.mjs](src/engine.mjs), the catalog in [src/catalog.mjs](src/catalog.mjs), and the pack optimisation in [src/cloud.mjs](src/cloud.mjs).

```js
import { calculate, defaultScenario } from './src/engine.mjs';

const receipt = calculate({
  ...defaultScenario(),
  market: 'FR',
  route: 'cloud',
  platform: 'xbox-one',
  plannedHours: 40,
});

console.log(receipt.checkout);                 // 9098 (€90.98)
console.log(receipt.cloudPlan.selection);       // one 50-hour pack
console.log(receipt.lines.map(x => x.source));  // first-party URLs
```

## Existing projects and differentiation

Other GTA VI cost calculators already exist, including [GTA6Cost](https://gta6cost.com/calculator/), [GTA Corner](https://www.gtacorner.com/cost-to-play), and [Kalkio](https://kalkio.vercel.app/tools/gta-6-total-cost/). [LeonidaLab's open-source GTA VI price index](https://github.com/LeonidaLab/gta6-price-index) covers a much broader range of countries.

This project concentrates on **item-level first-party provenance, exact multi-pack optimisation, typed unknowns, and a portable receipt** rather than duplicating a global retail price index. The application does not claim to be the first calculator in its category.

## Contributing

Corrections need a first-party URL, country, product, displayed currency, verification date, and tax interpretation, plus an automated regression test for pricing or calculation changes. Open an issue for inaccurate quotations, missing prior art, device constraints, or accessibility problems.

The repository is independent of Rockstar Games, Take-Two Interactive, PlayStation, and Xbox. No proprietary game art is included. Original source code and graphics are [MIT licensed](LICENSE).
