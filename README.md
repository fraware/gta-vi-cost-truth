# GTA VI Cost Truth

### The $80 question.

GTA VI's US Standard Edition is listed at $79.99. The hardware you own, the device you might buy, your country, and the way you play change the bill. **GTA VI Cost Truth** turns those choices into an independently auditable cost receipt.

**[Open the website](https://fraware.github.io/gta-vi-cost-truth/)** · [Explore the price snapshot](data/prices.json) · [Check the sources](SOURCE_NOTES.md) · [Run the tests](tests/engine.test.mjs)

![The $80 question — GTA VI Cost Truth](assets/og.png)

## What you get

- **Three purchasing routes.** Use an existing console, buy new hardware, or use a documented Xbox console cloud path. These routes are deliberately not presented as interchangeable; cloud access and device eligibility need separate checks.
- **Nine markets.** United States, France, United Kingdom, Canada, Australia, Germany, Spain, Italy, and Japan. Game prices come from regional Xbox storefronts; independently verified PlayStation prices are used only in markets where sources were checked. We never derive local list prices from exchange rates.
- **Five verified cloud-playtime catalogs.** Prepaid Xbox Store 10-, 25-, and 50-hour packs for US, FR, GB, CA, and AU. An exact optimizer selects the least expensive whole-pack combination for the requested time horizon. Other markets remain unpriced unless a personal quote is provided.
- **First-party hardware reference prices.** Dated quotations for selected PlayStation and Xbox hardware in supported markets. A user-entered price stays clearly identified as a personal estimate, even if it matches an official amount.
- **Receipts with evidence.** Every line is a verified listing, personal quotation, unknown, or conditional item. The headline shows a known subtotal, not a complete total, if important costs are absent.
- **Private sharing.** Shareable URLs contain only scenario settings. PNG receipt export is produced locally in the browser. No user accounts, analytics scripts, cookies, backend, affiliate links, or runtime scraping.
- **Auditable tooling.** A dependency-free JavaScript engine, Node CLI, machine-readable JSON price dataset, and automated tests.

## Run the website

The production site is static HTML, CSS, and ES modules. It needs no server-side runtime, framework, package installation, or API key.

```bash
python3 -m http.server 8080
# Visit http://localhost:8080/
```

Node.js 20+ is used for tests, machine-readable snapshots, and the standalone build.

```bash
npm test
npm run build:data
npm run build:demo
# Open dist/standalone.html as a self-contained offline preview.
```

### Use the calculation engine

```js
import { calculate, defaultScenario } from './src/engine.mjs';

const result = calculate({
  ...defaultScenario(),
  market: 'FR',
  route: 'cloud',
  platform: 'xbox-one',
  plannedHours: 40,
});

console.log(result.checkout);     // 9098 euro cents: game + 50-hour pack
console.log(result.cloudPlan);    // Exact pack selection and unused hours
console.log(result.lines);        // Sources, prices, and evidence statuses
```

```bash
# JSON receipts for scripts, reports, and independent checks
node scripts/cost.mjs --market FR --route cloud --device xbox-one --hours 40
node scripts/cost.mjs --market US --route buy --device xbox-series-s --use-official-hardware --tax-rate 8.25
node scripts/cost.mjs --market JP --route own --device xbox-series-x --edition ultimate
```

The desktop and mobile browser interaction suite runs in GitHub Actions. To run it locally, install `@playwright/test@1.56.1` and Chromium, then execute `npx playwright test --config=playwright.config.mjs`. The production site itself has zero dependencies.

The export at [`data/prices.json`](data/prices.json) is generated from [`src/catalog.mjs`](src/catalog.mjs). It contains the observation date, currency metadata, prices, and first-party links. **It is a curated dated snapshot, not a live price-feed API.** The arithmetic operates on integer minor units (including zero-decimal JPY) and never performs foreign-exchange conversion.

## Evidence and limitations

The source ledger documents observations made November 19, 2026. Actual checkout amounts, taxes, availability, promotional discounts, cloud service restrictions, game editions, and regional entitlement rules can differ. Changes to market or currency clear stored personal quotes to avoid accidental conversion. US and Canadian sales taxes are deliberately unresolved until a local rate is entered; the illustrative rate applies uniformly to the known subtotal and is not a merchant-specific tax computation. For cloud play, game purchase and prepaid time expenditure are combined into a **playtime-horizon projection**, not a claim that both charges occur at checkout simultaneously.

The official GTA VI native launch platform list contains PlayStation 5 and Xbox Series X|S. Xbox One is documented as a cloud streaming path. PC, phone, and television options are individually marked conditional: **a generic Xbox Cloud Gaming device list does not establish GTA VI launch availability for every device.** Neither free ad-supported access nor unlimited entitlement is presumed. The price and provenance of each included product are linked in the receipt.

See [SOURCE_NOTES.md](SOURCE_NOTES.md) for the exact references and [LAUNCH.md](LAUNCH.md) for publication checks.

## Prior art and positioning

GTA VI total-cost calculators and market-price indexes already exist, including GTA6Cost, GTA Corner, Kalkio, and LeonidaLab's GTA VI Price Index. This is **not** a claim of being the first calculator in the category. Its design emphasis is a comparison-first editorial interface, local-first receipt sharing, exact cloud-pack optimization, and price/evidence provenance in an independently testable open-source engine.

## Contributing

Corrections, first-party market sources, localization, accessibility repairs, and reproducible test cases are welcome through GitHub issues and pull requests. An additional verified quote needs an official product-page URL, specific market, currency, edition or device, date of observation, tax treatment, and regression test. Never replace an absent price with an inferred exchange-rate conversion. If uncertain about a listing, prefer an explicit unknown.

## License and independence

[MIT](LICENSE). Independently developed and unaffiliated with Rockstar Games, Take-Two Interactive, Sony, Microsoft, or their affiliates. All product and company names are trademarks of their respective owners. Original graphics contain no copied game or console artwork.
