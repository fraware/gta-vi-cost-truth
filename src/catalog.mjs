/**
 * GTA VI Cost Truth — independently inspected first-party price snapshots.
 * The data is intentionally maintained in version control rather than fetched
 * from unofficial scraping endpoints at runtime.
 * Monetary values are integers in the currency's smallest unit (JPY = yen).
 */
export const VERIFIED_ON = '2026-11-19';

const xboxGameUrl = (region, edition) => `https://www.xbox.com/${region}/games/store/grand-theft-auto-vi/${edition === 'standard' ? '9P3H4968GRSM' : '9NNZSNHLR63L'}`;
const psGameUrl = (region, edition) => `https://store.playstation.com/${region}/product/EP1004-PPSA01547_00-${edition === 'standard' ? 'GTAVISTANDARD001' : 'GTAVIULTIMATE001'}`;
const market = ({ name, currency, locale, decimals = 2, taxIncluded, xboxLocale, psLocale = null, xbox, ps = null }) => Object.freeze({
  name, currency, locale, decimals, taxIncluded,
  game: Object.freeze({
    xbox: Object.freeze({ prices: Object.freeze({ standard: xbox[0], ultimate: xbox[1] }), source: Object.freeze({ standard: xboxGameUrl(xboxLocale,'standard'), ultimate: xboxGameUrl(xboxLocale,'ultimate') }) }),
    playstation: ps ? Object.freeze({ prices: Object.freeze({ standard: ps[0], ultimate: ps[1] }), source: Object.freeze({ standard: psGameUrl(psLocale,'standard'), ultimate: psGameUrl(psLocale,'ultimate') }) }) : null,
  }),
});

export const MARKETS = Object.freeze({
  US: market({ name:'United States', currency:'USD', locale:'en-US', taxIncluded:false, xboxLocale:'en-US', psLocale:'en-us', xbox:[7999,9999], ps:[7999,9999] }),
  FR: market({ name:'France', currency:'EUR', locale:'fr-FR', taxIncluded:true, xboxLocale:'fr-FR', psLocale:'fr-fr', xbox:[7999,9999], ps:[7999,9999] }),
  GB: market({ name:'United Kingdom', currency:'GBP', locale:'en-GB', taxIncluded:true, xboxLocale:'en-GB', psLocale:'en-gb', xbox:[6999,8999], ps:[6999,8999] }),
  CA: market({ name:'Canada', currency:'CAD', locale:'en-CA', taxIncluded:false, xboxLocale:'en-CA', psLocale:'en-ca', xbox:[10999,13999], ps:[10999,13999] }),
  AU: market({ name:'Australia', currency:'AUD', locale:'en-AU', taxIncluded:true, xboxLocale:'en-AU', xbox:[12995,15995] }),
  DE: market({ name:'Germany', currency:'EUR', locale:'de-DE', taxIncluded:true, xboxLocale:'de-DE', psLocale:'de-de', xbox:[7999,9999], ps:[7999,9999] }),
  ES: market({ name:'Spain', currency:'EUR', locale:'es-ES', taxIncluded:true, xboxLocale:'es-ES', xbox:[7999,9999] }),
  IT: market({ name:'Italy', currency:'EUR', locale:'it-IT', taxIncluded:true, xboxLocale:'it-IT', xbox:[7999,9999] }),
  JP: market({ name:'Japan', currency:'JPY', locale:'ja-JP', decimals:0, taxIncluded:true, xboxLocale:'ja-JP', xbox:[9800,12280] }),
});

export const SOURCES = Object.freeze({
  release: 'https://www.take2games.com/ir/news/rockstar-games-announces-pre-orders-grand-theft-auto-vi',
  platforms: 'https://support.rockstargames.com/articles/4QfG4FmZCf5W1gS8jy4UVT/grand-theft-auto-vi-platform-editions-and-versions',
  cloud: 'https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/',
  xboxHardwareUS: 'https://www.microsoft.com/en-us/p/xbox-series-s/942J774TP9JN/2JBX',
  xboxHardwareFR: 'https://www.microsoft.com/fr-fr/p/xbox-series-s/942j774tp9jn',
  xboxHardwareGB: 'https://www.microsoft.com/en-gb/d/Xbox-Series-S/942J774TP9JN/24K9',
  xboxHardwareCA: 'https://www.microsoft.com/en-ca/d/xbox-series-s/942j774tp9jn',
  xboxHardwareAU: 'https://www.microsoft.com/en-au/p/xbox-series-s/942j774tp9jn',
  psHardwareGB: 'https://direct.playstation.com/en-gb/hardware/ps5',
  psHardwareUS: 'https://direct.playstation.com/en-us/hardware/ps5',
  psHardwareFR: 'https://www.playstation.com/fr-fr/ps5/digital-edition-825-gb/',
  xboxCloudTerms: 'https://www.xbox.com/en-US/cloud-gaming',
});

const hardwareQuote = (market, model, amount, url, label) => Object.freeze({ id:`${market}-${model}-${VERIFIED_ON}`, market, model, amount, source:url, label, verifiedOn:VERIFIED_ON });
export const HARDWARE_REFERENCES = Object.freeze({
  'US:xbox-series-s': hardwareQuote('US','xbox-series-s',49999,SOURCES.xboxHardwareUS,'Microsoft Store · 512 GB'),
  'US:ps5-digital': hardwareQuote('US','ps5-digital',59900,SOURCES.psHardwareUS,'PlayStation Direct · 825 GB'),
  'US:ps5-disc': hardwareQuote('US','ps5-disc',64900,SOURCES.psHardwareUS,'PlayStation Direct · 1 TB'),
  'US:ps5-pro': hardwareQuote('US','ps5-pro',89900,SOURCES.psHardwareUS,'PlayStation Direct · PS5 Pro'),
  'FR:xbox-series-s': hardwareQuote('FR','xbox-series-s',49999,SOURCES.xboxHardwareFR,'Microsoft Store · 512 Go'),
  'FR:ps5-digital': hardwareQuote('FR','ps5-digital',59999,SOURCES.psHardwareFR,'PlayStation · 825 Go'),
  'GB:xbox-series-s': hardwareQuote('GB','xbox-series-s',42999,SOURCES.xboxHardwareGB,'Microsoft Store · 512 GB'),
  'GB:ps5-digital': hardwareQuote('GB','ps5-digital',51999,SOURCES.psHardwareGB,'PlayStation Direct · 825 GB'),
  'CA:xbox-series-s': hardwareQuote('CA','xbox-series-s',64999,SOURCES.xboxHardwareCA,'Microsoft Store · 512 GB'),
  'AU:xbox-series-s': hardwareQuote('AU','xbox-series-s',69900,SOURCES.xboxHardwareAU,'Microsoft Store · 512 GB'),
});

export const HARDWARE = Object.freeze({
  'ps5-digital': { label:'PlayStation 5 Digital', short:'PS5 Digital', ecosystem:'playstation' },
  'ps5-disc': { label:'PlayStation 5 (disc model)', short:'PS5 Disc', ecosystem:'playstation' },
  'ps5-pro': { label:'PlayStation 5 Pro', short:'PS5 Pro', ecosystem:'playstation' },
  'xbox-series-s': { label:'Xbox Series S', short:'Series S', ecosystem:'xbox' },
  'xbox-series-x': { label:'Xbox Series X', short:'Series X', ecosystem:'xbox' },
  'xbox-one': { label:'Xbox One · cloud only', short:'Xbox One', ecosystem:'xbox', cloudOnly:true },
  'pc-cloud': { label:'Windows PC · cloud availability varies', short:'Windows PC', ecosystem:'xbox', cloudOnly:true, unconfirmedDevice:true },
  'tv-cloud': { label:'Supported smart TV · verify GTA VI', short:'Smart TV', ecosystem:'xbox', cloudOnly:true, unconfirmedDevice:true },
  'phone-cloud': { label:'Mobile device · verify GTA VI', short:'Phone / tablet', ecosystem:'xbox', cloudOnly:true, unconfirmedDevice:true },
});

const cloudPacks = (region, amounts) => Object.freeze([10,25,50].map((hours,i) => Object.freeze({
  hours, amount:amounts[i], verifiedOn:VERIFIED_ON,
  source:`https://www.xbox.com/${region}/games/store/${region === 'fr-FR' ? `temps-de-jeu-sur-le-cloud-${hours}-heures` : `cloud-playtime-${hours}-hours`}/${hours === 10 ? '9pl4njhpdn7l' : hours === 25 ? '9pg1fs0brh5h' : '9mtv0kn0j3c0'}`,
})));
export const CLOUD_PACKS = Object.freeze({
  US: cloudPacks('en-US',[399,799,1199]),
  FR: cloudPacks('fr-FR',[349,699,1099]),
  GB: cloudPacks('en-GB',[299,599,899]),
  CA: cloudPacks('en-CA',[499,1099,1699]),
  AU: cloudPacks('en-AU',[595,1195,1795]),
});
