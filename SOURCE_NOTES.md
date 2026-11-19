# Source register

**Snapshot date: 2026-11-19.** The website and dataset are independently curated; prices are not streamed in real time. Every first-party listing is subject to later change, local availability, and checkout conditions. Game prices below refer to **Xbox regional storefront editions**; PlayStation receipts only use independently checked PlayStation listings and otherwise request a personal quote.

## Launch, platforms, conditions

- [Take-Two / Rockstar pre-order announcement](https://www.take2games.com/ir/news/rockstar-games-announces-pre-orders-grand-theft-auto-vi) — November 19, 2026, PlayStation 5 and Xbox Series X|S, Standard and Ultimate Editions.
- [Rockstar platform and version information](https://support.rockstargames.com/articles/4QfG4FmZCf5W1gS8jy4UVT/grand-theft-auto-vi-platform-editions-and-versions) — native platforms, digital code for physical editions, online requirements and edition details.
- [Xbox Wire launch cloud announcement](https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/) — Xbox One and Xbox Series X|S cloud paths; GTA VI purchase separately necessary; market and account eligibility differ.
- [Xbox Cloud Gaming service](https://www.xbox.com/en-US/cloud-gaming) — prepaid packs, ad-supported access and other subscription plans are distinct products and have entitlement restrictions.

## Game prices — official Xbox Store

The actual regional product-page links are stored alongside all prices in [`src/catalog.mjs`](src/catalog.mjs), and published in [`data/prices.json`](data/prices.json).

| Market | Standard | Ultimate | Xbox regional storefront |
| --- | ---: | ---: | --- |
| United States | $79.99 | $99.99 | [Xbox US](https://www.xbox.com/en-US/games/store/grand-theft-auto-vi/9P3H4968GRSM) |
| France | €79.99 | €99.99 | [Xbox FR](https://www.xbox.com/fr-FR/games/store/grand-theft-auto-vi/9P3H4968GRSM) |
| United Kingdom | £69.99 | £89.99 | [Xbox GB](https://www.xbox.com/en-GB/games/store/grand-theft-auto-vi/9P3H4968GRSM) |
| Canada | CAD $109.99 | CAD $139.99 | [Xbox CA](https://www.xbox.com/en-CA/games/store/grand-theft-auto-vi/9P3H4968GRSM) |
| Australia | AU$129.95 | AU$159.95 | [Xbox AU](https://www.xbox.com/en-AU/games/store/grand-theft-auto-vi/9P3H4968GRSM) |
| Germany | €79.99 | €99.99 | [Xbox DE](https://www.xbox.com/de-DE/games/store/grand-theft-auto-vi/9P3H4968GRSM) |
| Spain | €79.99 | €99.99 | [Xbox ES](https://www.xbox.com/es-ES/games/store/grand-theft-auto-vi/9P3H4968GRSM) |
| Italy | €79.99 | €99.99 | [Xbox IT](https://www.xbox.com/it-IT/games/store/grand-theft-auto-vi/9P3H4968GRSM) |
| Japan | ¥9,800 | ¥12,280 | [Xbox JP](https://www.xbox.com/ja-JP/games/store/grand-theft-auto-vi/9P3H4968GRSM) |

PlayStation regionally verified game prices are recorded for US, FR, GB, CA and DE only, with first-party source URLs in the structured dataset. The others intentionally have no PlayStation quote; Xbox and PlayStation prices are not automatically equated.

## Xbox prepaid cloud playtime — first-party Microsoft Store

| Market | 10 hours | 25 hours | 50 hours | Representative source |
| --- | ---: | ---: | ---: | --- |
| United States | $3.99 | $7.99 | $11.99 | [Xbox US](https://www.xbox.com/en-US/games/store/cloud-playtime-50-hours/9mtv0kn0j3c0) |
| France | €3.49 | €6.99 | €10.99 | [Xbox FR](https://www.xbox.com/fr-FR/games/store/temps-de-jeu-sur-le-cloud-50-heures/9mtv0kn0j3c0) |
| United Kingdom | £2.99 | £5.99 | £8.99 | [Xbox GB](https://www.xbox.com/en-GB/games/store/cloud-playtime-50-hours/9mtv0kn0j3c0) |
| Canada | CAD $4.99 | CAD $10.99 | CAD $16.99 | [Xbox CA](https://www.xbox.com/en-CA/games/store/cloud-playtime-50-hours/9mtv0kn0j3c0) |
| Australia | AU$5.95 | AU$11.95 | AU$17.95 | [Xbox AU](https://www.xbox.com/en-AU/games/store/cloud-playtime-50-hours/9mtv0kn0j3c0) |

Each quantity is an entire prepaid purchase. The algorithm finds the least expensive combination whose total purchased hours cover the user-selected horizon. It does not presume packs are available in all regions, or that prepaid hours expire or carry over under particular contractual terms. Remaining hours describe purchased time beyond the *planned* usage, not verified account balance.

## First-party console starting prices

| Market | Hardware reference | Listed price | Official source |
| --- | --- | ---: | --- |
| United States | Xbox Series S · 512 GB | $499.99 | [Microsoft Store](https://www.microsoft.com/en-us/p/xbox-series-s/942J774TP9JN/2JBX) |
| United States | PS5 Digital · 825 GB | $599.00 | [PlayStation Direct](https://direct.playstation.com/en-us/hardware/ps5) |
| United States | PS5 Disc · 1 TB | $649.00 | [PlayStation Direct](https://direct.playstation.com/en-us/hardware/ps5) |
| United States | PS5 Pro | $899.00 | [PlayStation Direct](https://direct.playstation.com/en-us/hardware/ps5) |
| France | Xbox Series S · 512 Go | €499.99 | [Microsoft Store](https://www.microsoft.com/fr-fr/p/xbox-series-s/942j774tp9jn) |
| France | PS5 Digital · 825 Go | €599.99 | [PlayStation](https://www.playstation.com/fr-fr/ps5/digital-edition-825-gb/) |
| United Kingdom | Xbox Series S · 512 GB | £429.99 | [Microsoft Store](https://www.microsoft.com/en-gb/d/Xbox-Series-S/942J774TP9JN/24K9) |
| United Kingdom | PS5 Digital · 825 GB | £519.99 | [PlayStation Direct](https://direct.playstation.com/en-gb/hardware/ps5) |
| Canada | Xbox Series S · 512 GB | CAD $649.99 | [Microsoft Store](https://www.microsoft.com/en-ca/d/xbox-series-s/942j774tp9jn) |
| Australia | Xbox Series S · 512 GB | AU$699.00 | [Microsoft Store](https://www.microsoft.com/en-au/p/xbox-series-s/942j774tp9jn) |

The website does not prefill the device price automatically because a starting price might refer to a different storage configuration, discount, or supply state. The visitor explicitly opts into each official reference. A typed quote remains user-supplied even if numerically identical to an official published reference.

## Methodology and uncertainty

- **Verified** is a dated first-party listing with a specific market, product, and URL. It does not represent live checkout verification.
- **Entered** is a visitor's estimate, including discounted or second-hand quotes, optional accessories and local sales tax. The computation never mislabels a typed quote as verified.
- **Unknown** means the model cannot establish that line from included data. For any such input, `checkout` is `null`; the interface labels known amounts as a subtotal.
- **Conditional** means an entitlement, platform, or restriction needs independent account-level verification. The free/ad-supported cloud route is not priced as unrestricted coverage.
- **Taxes** are treated as included for FR, GB, AU, DE, ES, IT and JP, based on displayed local storefront prices. US and CA need a locally entered illustrative rate, applied uniformly to known expenditures. Actual taxation by product and jurisdiction differs. Entered prices should already reflect applicable VAT in VAT-inclusive markets.
- **Currency** amounts use integer minor units; Japanese yen have no fractional unit. No foreign-exchange conversion, international purchase arbitrage, duties, finance costs, or exchange-rate forecasts.
- **Streaming** is projected for total planned playtime. The combined game + cloud pack amount might be paid over several dates, not all at checkout. Device compatibility and availability must be checked directly with the platform.
- **Resale** is hypothetical, displayed outside the checkout expenditure; no guaranteed resale return is implied.

## Prior art

[GTA6Cost](https://gta6cost.com/calculator/) · [GTA Corner](https://www.gtacorner.com/cost-to-play) · [Kalkio](https://kalkio.vercel.app/tools/gta-6-total-cost/) · [LeonidaLab GTA VI Price Index](https://github.com/LeonidaLab/gta6-price-index). This repository does not claim to be the first GTA VI total-cost calculator.
