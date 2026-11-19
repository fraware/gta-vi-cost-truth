# Contributing

GTA VI Cost Truth prioritizes correct calculations, reviewable price evidence, accessibility, and a fast static website. Small, focused pull requests with a test or reproducible example are welcome.

## Local setup

```bash
git clone https://github.com/fraware/gta-vi-cost-truth.git
cd gta-vi-cost-truth
npm run verify
python3 -m http.server 8080
```

Node.js 20+ is sufficient for the core engine and tests; the browser-test workflow installs its own Playwright runner. No accounts, API tokens, or proprietary assets are needed to work on the site.

## Price corrections

Use the [price correction issue](.github/ISSUE_TEMPLATE/price-correction.yml) or a pull request. Supply an **official storefront URL**, country, platform, edition or hardware configuration, price in local currency, observation date, and whether the displayed amount includes applicable taxes. Record limitations and contradictory evidence. A screenshot alone is insufficient to prove the current public store price.

Update `src/catalog.mjs` and `SOURCE_NOTES.md`, then run:

```bash
npm run build:data
npm run build:seo
npm run verify
```

Include a regression test for changed prices or calculations. Never fill a missing price from a converted amount or change the price date without new evidence.

## Code changes

Keep the cost engine pure and free of external calls. Represent unresolved amounts with `null` and explain price source classifications. Include tests for currency precision, tax handling, route eligibility, and invalid shared inputs where relevant. The browser should function without accounts, advertising, tracking, or paid APIs. Maintain semantic HTML, keyboard support, and reduced-motion handling.

Do not upload copyrighted game artwork, personal payment information, or marketing assets owned by third parties. Keep documentation precise about modelled assumptions and unsupported scenarios.

## Review and attribution

By submitting a contribution, you agree that your original contribution is made available under the [MIT license](LICENSE). Preserve third-party attributions and disclose reused material. Use descriptive commit messages relating to the change. Repository maintainers evaluate work based on evidence, correctness, clarity, and maintainability.
