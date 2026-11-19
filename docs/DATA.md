# Price dataset and provenance

[`data/prices.json`](../data/prices.json) is a portable, versioned export of [`src/catalog.mjs`](../src/catalog.mjs). It is a first-party **observation snapshot**, not a live quote, inventory feed, or pricing service.

```bash
npm run build:data    # Recreate the JSON file from source
npm run check:data    # Fail if the committed JSON differs from source
```

## Dataset structure

- `schemaVersion` is currently `1`. Consumers must reject unknown major schema versions.
- `snapshotDate` records the date of the curated storefront observations.
- `markets` maps market codes to `name`, ISO 4217 `currency`, `locale`, integer `decimals`, `taxIncluded`, and platform-specific game prices with evidence URLs.
- `hardwareReferences` maps a `market:device` pair to an `amount`, `source`, `verifiedOn`, and store description. The reference applies only to the exact product configuration and region.
- `cloudPacks` maps supported markets to purchasable time packs, with `hours`, integer `amount`, and a first-party listing URL. Markets absent from `cloudPacks` have **no verified local prepaid tariff** in this snapshot.

All amounts are integers in the **smallest currency unit**. For example, `7999` USD cents means `$79.99`, while `9800` JPY means `¥9,800`. The program does not exchange currencies and does not extrapolate one retailer's price to another.

For source-verified markets, game edition prices are stored separately per ecosystem (`xbox` and `playstation`). Missing PlayStation prices are `null`, never inferred from Xbox. A missing hardware quotation is not equivalent to zero additional cash required.

## Updating a market

1. Inspect the official store page in the country and for the exact edition or device.
2. Record the amount, currency, tax interpretation, product configuration, listing URL, and actual observation date in [`SOURCE_NOTES.md`](../SOURCE_NOTES.md).
3. Edit [`src/catalog.mjs`](../src/catalog.mjs), retaining a missing value if the listing cannot be verified.
4. Regenerate `data/prices.json` and the static site price table with `npm run build:data && npm run build:seo`.
5. Run `npm run verify`. Attach the source URL and explain material changes in the pull request.

Do not convert another market's amount using foreign-exchange rates, treat a subscription trial as a standard entitlement, or classify a personally entered quote as a verified store listing. First-party product and service restrictions are independent of arithmetic accuracy.

## Downstream reuse

Consumers may fetch or vendor the committed JSON from a pinned Git commit. Validate `schemaVersion`, currency precision, dates, and source URLs before relying on any observation. The MIT license applies to original repository code and documentation; vendor trademarks, associated images, and external storefront text are not relicensed by this project.
