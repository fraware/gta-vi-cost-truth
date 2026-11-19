/**
 * Point-in-time, independently verifiable storefront observations.
 * These records are a curated snapshot, not a live pricing API.
 * ISO dates refer to verification during preparation of this release.
 */
export const VERIFIED_ON = '2026-11-19';

export const MARKETS = Object.freeze({
  US: Object.freeze({
    label: 'United States', currency: 'USD', locale: 'en-US', taxesIncluded: false,
    prices: Object.freeze({ standard: 7999, ultimate: 9999 }),
    source: Object.freeze({
      standard: 'https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-GTAVISTANDARD001/',
      ultimate: 'https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-GTAVIULTIMATE001',
    }),
    xboxSource: Object.freeze({
      standard: 'https://www.xbox.com/en-US/games/store/grand-theft-auto-vi/9P3H4968GRSM',
      ultimate: 'https://www.xbox.com/en-US/games/store/grand-theft-auto-vi/9NNZSNHLR63L',
    }),
  }),
  FR: Object.freeze({
    label: 'France', currency: 'EUR', locale: 'fr-FR', taxesIncluded: true,
    prices: Object.freeze({ standard: 7999, ultimate: 9999 }),
    source: Object.freeze({
      standard: 'https://store.playstation.com/fr-fr/product/EP1004-PPSA01547_00-GTAVISTANDARD001',
      ultimate: 'https://store.playstation.com/fr-fr/product/EP1004-PPSA01547_00-GTAVIULTIMATE001',
    }),
    xboxSource: Object.freeze({
      standard: 'https://www.xbox.com/fr-FR/games/store/grand-theft-auto-vi/9P3H4968GRSM',
      ultimate: 'https://www.xbox.com/fr-FR/games/store/grand-theft-auto-vi/9NNZSNHLR63L',
    }),
  }),
  GB: Object.freeze({
    label: 'United Kingdom', currency: 'GBP', locale: 'en-GB', taxesIncluded: true,
    prices: Object.freeze({ standard: 6999, ultimate: 8999 }),
    source: Object.freeze({
      standard: 'https://store.playstation.com/en-gb/product/EP1004-PPSA01547_00-GTAVISTANDARD001/',
      ultimate: 'https://store.playstation.com/en-gb/product/EP1004-PPSA01547_00-GTAVIULTIMATE001',
    }),
    xboxSource: Object.freeze({
      standard: 'https://www.xbox.com/en-GB/games/store/grand-theft-auto-vi/9NL3WWNZLZZN',
      ultimate: 'https://www.xbox.com/en-GB/games/store/grand-theft-auto-vi/9NNZSNHLR63L',
    }),
  }),
});

export const SOURCES = Object.freeze({
  release: 'https://ir.take2games.com/node/32311',
  cloud: 'https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/',
  xboxHardware: 'https://www.microsoft.com/en-us/p/xbox-series-s/942J774TP9JN/2JBX',
  ps5Hardware: 'https://direct.playstation.com/en-us/hardware/ps5',
  gameOffline: 'https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-GTAVISTANDARD001/',
});

// Two first-party US console quotations. Other hardware values remain visitor-supplied.
// A verified quote is market- and device-specific, not a universal checkout price.
export const HARDWARE_REFERENCE = Object.freeze({
  id: 'series-s-us-2026-11-18',
  market: 'US',
  model: 'xbox-series-s',
  cents: 49999,
  source: SOURCES.xboxHardware,
  verifiedOn: VERIFIED_ON,
  description: 'Microsoft Store starting price; configuration, promotions and tax may vary',
});

export const HARDWARE_REFERENCES = Object.freeze({
  'US:xbox-series-s': HARDWARE_REFERENCE,
  'US:ps5-digital': Object.freeze({
    id: 'ps5-digital-us-2026-11-19', market: 'US', model: 'ps5-digital',
    cents: 59999, source: SOURCES.ps5Hardware, verifiedOn: VERIFIED_ON,
    description: 'PlayStation Direct US PS5 Digital 825GB starting price, before local tax',
  }),
});

/**
 * These are regional first-party Xbox Store *purchase* prices, not recurring
 * subscriptions or per-hour unit prices. No price conversion is performed.
 * A user can override them if their account presents a different offer.
 */
export const CLOUD_PACKS = Object.freeze({
  US: Object.freeze([
    { hours: 10, cents: 399, source: 'https://www.xbox.com/en-US/games/store/cloud-playtime-10-hours/9pl4njhpdn7l' },
    { hours: 25, cents: 799, source: 'https://www.xbox.com/en-US/games/store/cloud-playtime-25-hours/9pg1fs0brh5h' },
    { hours: 50, cents: 1199, source: 'https://www.xbox.com/en-US/games/store/cloud-playtime-50-hours/9mtv0kn0j3c0' },
  ]),
  FR: Object.freeze([
    { hours: 10, cents: 349, source: 'https://www.xbox.com/fr-FR/games/store/temps-de-jeu-sur-le-cloud-10-heures/9pl4njhpdn7l' },
    { hours: 25, cents: 699, source: 'https://www.xbox.com/fr-FR/games/store/temps-de-jeu-sur-le-cloud-25-heures/9pg1fs0brh5h' },
    { hours: 50, cents: 1099, source: 'https://www.xbox.com/fr-FR/games/store/temps-de-jeu-sur-le-cloud-50-heures/9mtv0kn0j3c0' },
  ]),
  GB: Object.freeze([
    { hours: 10, cents: 299, source: 'https://www.xbox.com/en-GB/games/store/cloud-playtime-10-hours/9pl4njhpdn7l' },
    { hours: 25, cents: 599, source: 'https://www.xbox.com/en-GB/games/store/cloud-playtime-25-hours/9pg1fs0brh5h' },
    { hours: 50, cents: 899, source: 'https://www.xbox.com/en-GB/games/store/cloud-playtime-50-hours/9mtv0kn0j3c0' },
  ]),
});

export const HARDWARE = Object.freeze({
  'ps5-digital': { label: 'PlayStation 5 Digital', ecosystem: 'playstation' },
  'ps5-disc': { label: 'PlayStation 5 with disc drive', ecosystem: 'playstation' },
  'ps5-pro': { label: 'PlayStation 5 Pro', ecosystem: 'playstation' },
  'xbox-series-s': { label: 'Xbox Series S', ecosystem: 'xbox' },
  'xbox-one': { label: 'Xbox One (cloud streaming only)', ecosystem: 'xbox' },
  'xbox-series-x': { label: 'Xbox Series X', ecosystem: 'xbox' },
});
