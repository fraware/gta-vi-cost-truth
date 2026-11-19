# Public release playbook

## Position

**The $80 question.** The game's sticker price does not determine a player's actual cost of entry. A dynamic receipt compares already-owned consoles, purchased hardware, and supported Xbox cloud streaming, with first-party pricing and explicit uncertainty.

The open-source differentiator is a country-aware data catalog, pure calculation engine, exact prepaid-pack optimization, JSON dataset, CLI, and per-line provenance. The product differentiator is a strong comparison-led design and personal shareable receipt, with no account or runtime tracking.

## Responsible release checklist

- [x] Independent, dated first-party price observations across nine regional game storefronts.
- [x] Five regionally published Microsoft cloud-playtime catalogs and exact optimization.
- [x] Ten sourced hardware reference quotes from first-party vendors.
- [x] Local-first share URLs and 1200×630 PNG receipt export.
- [x] JS engine, portable JSON export, CLI and tests.
- [x] Mark unresolved tax, eligibility, unverified device support and game prices.
- [x] Descriptive site title, crawlable cost summary, canonical URL, Open Graph and X/Twitter share metadata.
- [x] Static HTML price table generated from the nine-market first-party catalog.
- [x] Sitemap and JSON-LD describing the free WebApplication, without inventing review metrics.
- [x] Documented public ES module entry, reusable JSON format, contribution and price-correction templates.
- [x] Automated schema, indexability, data-drift, and API tests.
- [ ] Submit `https://fraware.github.io/gta-vi-cost-truth/sitemap.xml` through Google Search Console, using an authorized owner of `fraware.github.io` or the matching URL-prefix property.
- [ ] Set the GitHub repository About description, website URL and topical keywords; validate how they appear in GitHub search.
- [ ] Verify the repository's GitHub social preview image through Settings (this is separate from the website's Open Graph tags).
- [ ] Confirm successful GitHub Actions test and static publishing workflows for the exact release SHA.
- [ ] Confirm GitHub Pages is enabled and the public URL loads without errors.
- [ ] Verify mobile, tablet and desktop interaction in a real browser against the live URL.
- [ ] Verify link sharing from a clean browser, quote provenance, source links and PNG export.
- [ ] Inspect social-platform open graph previews and accessibility with automated and manual audit.
- [ ] Check current storefront prices on release day and update sources if they changed.
- [ ] Get independent player feedback and correct the interface before promoting it widely.

## Suggested public headline

GTA VI is $79.99 in the US. What will it actually cost you to play? Compare your console, cloud access and country, then share a receipt backed by official listings.

## GitHub-native distribution

Source-linked per-line receipts, a deliberately minimal zero-dependency engine, and portable machine-readable official-price observations give developers reasons to reproduce, extend and contribute. The website presents the GitHub repository as a primary place to audit and improve the data, not a decorative footer. Invite market additions backed by first-party URLs and dated observations. Track genuine stars, visitors completing receipts, sourced corrections, contributors, and issues; do not claim traction before measuring it.

## Indexing constraints

This site uses a subdirectory on GitHub Pages. Host-level `robots.txt` lives at `https://fraware.github.io/robots.txt`, outside the control of this project repository. Do not treat `gta-vi-cost-truth/robots.txt` as authoritative crawler policy. The site's canonical URL and project-local sitemap are under this repository's control. Search Console ownership verification and indexing are separate from a successful Pages deployment, and search position is never guaranteed.

## Integrity

Multiple competing calculators already exist. This project does not claim to be the first, guarantee access to cloud streaming, offer live store prices, or guarantee a #1 GitHub Trending ranking. Avoid paid/automated fake stars, misleading countdowns, fake scarcity, and mass unsolicited outreach. Only report verified deployment, tests and product results.
