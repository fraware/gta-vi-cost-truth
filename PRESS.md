# GTA VI Cost Truth — Press and community reference

**Free independent calculator:** https://fraware.github.io/gta-vi-cost-truth/  
**Open-source code:** https://github.com/fraware/gta-vi-cost-truth  
**Original social artwork:** [GitHub preview](assets/github-social-preview.png) · [Website preview](assets/og.png)  
**License:** [MIT](LICENSE) for original code and graphics. Game and platform trademarks belong to their owners.

## What the project does

GTA VI Cost Truth calculates an itemized, source-linked cost of playing Grand Theft Auto VI. The default $79.99 US Standard Edition game price is only part of the expenditure if someone needs hardware or a documented cloud-playtime arrangement. Visitors compare an existing console, a new console, and the eligible Xbox cloud route. Unknown tax, missing quotations, and conditional access are identified explicitly.

The first release covers nine official regional game-price catalogs, five documented regional prepaid Xbox cloud-pack catalogs, and a selection of dated first-party hardware quotations. Calculation code and JSON snapshots are public. No signup, tracking script, backend, or affiliated storefront is used.

## Illustrative US scenarios — catalog snapshot November 19, 2026

| Situation | Game | Additional published cost | Known subtotal | Unresolved |
| --- | ---: | ---: | ---: | --- |
| Supported console already owned | $79.99 | $0 new hardware | **$79.99** | Local sales tax |
| Buy an Xbox Series S (512 GB, US first-party quote) | $79.99 | $499.99 | **$579.98** | Local sales tax, discounts or other personal expenses |
| Stream on an Xbox One for 40 planned hours, using prepaid packs | $79.99 | $11.99 for one 50-hour pack | **$91.98** | Local sales tax, individual account and service eligibility |

These are **dated, illustrative known subtotals**, not guaranteed checkout totals. The cloud example applies to Xbox One where game-specific streaming was announced; general cloud platform support is not confirmation that GTA VI streams to PC, phones, or TVs. The modeled 50-hour pack has 10 hours of unused capacity. No native PC release is asserted.

## Method and evidence

- Game list price: [Take-Two's original press release](https://ir.take2games.com/node/32311) and [US Xbox Store Standard Edition](https://www.xbox.com/en-US/games/store/grand-theft-auto-vi/9P3H4968GRSM)
- Hardware: [Microsoft Store US Xbox Series S](https://www.microsoft.com/en-us/p/xbox-series-s/942J774TP9JN/2JBX)
- Xbox game-specific cloud launch and restrictions: [Xbox Wire announcement](https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/)
- Cloud pack: [50 hours on the US Xbox Store](https://www.xbox.com/en-US/games/store/cloud-playtime-50-hours/9mtv0kn0j3c0)
- Full provenance, currency treatment and known limitations: [SOURCE_NOTES.md](SOURCE_NOTES.md), [data format](docs/DATA.md)
- Reproducible JavaScript calculations, scenarios and integration documentation: [API guide](docs/API.md), [test suite](tests)

Prices are updated manually from dated first-party snapshots, not continuously refreshed by a live store API. Regional variations and promotions can change the result.

## Reproduction

```sh
git clone https://github.com/fraware/gta-vi-cost-truth.git
cd gta-vi-cost-truth
npm run verify
node scripts/cost.mjs --market US --route cloud --device xbox-one --hours 40
```

## Publication and corrections

You are welcome to test, cite, critique, or independently reuse the tool and original graphics. This repository is unaffiliated with Rockstar Games, Take-Two Interactive, Microsoft, or Sony. Please link to the source if reporting a calculation. For verifiable price changes, use the [price correction issue template](.github/ISSUE_TEMPLATE/price-correction.yml) or [open a general issue](https://github.com/fraware/gta-vi-cost-truth/issues/new).
