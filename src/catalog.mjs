/**
 * Point-in-time, independently verifiable storefront observations.
 * These records are a curated snapshot, not a live pricing API.
 * ISO dates refer to verification during preparation of this release.
 */
const VERIFIED_ON = '2026-11-18';

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
  xboxHardware: 'https://www.microsoft.com/en-us/p/-xbox-series-s--/942J774TP9JN/5NCQ',
  gameOffline: 'https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-GTAVISTANDARD001/',
});

// A single US manufacturer's public starting price is included as an illustration.
// All other hardware quotations are explicitly entered by the visitor.
export const HARDWARE_REFERENCE = Object.freeze({
  id: 'series-s-us-2026-11-18',
  market: 'US',
  model: 'xbox-series-s',
  cents: 49999,
  source: SOURCES.xboxHardware,
  verifiedOn: VERIFIED_ON,
  description: 'Microsoft Store starting price; configuration, promotions and tax may vary',
});

export const HARDWARE = Object.freeze({
  'ps5-digital': { label: 'PlayStation 5 Digital', ecosystem: 'playstation' },
  'ps5-disc': { label: 'PlayStation 5 with disc drive', ecosystem: 'playstation' },
  'ps5-pro': { label: 'PlayStation 5 Pro', ecosystem: 'playstation' },
  'xbox-series-s': { label: 'Xbox Series S', ecosystem: 'xbox' },
  'xbox-one': { label: 'Xbox One (cloud streaming only)', ecosystem: 'xbox' },
  'xbox-series-x': { label: 'Xbox Series X', ecosystem: 'xbox' },
});
