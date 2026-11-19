import { MARKETS, HARDWARE, HARDWARE_REFERENCES, CLOUD_PACKS, VERIFIED_ON } from './catalog.mjs';
import { cheapestCloudPacks } from './cloud.mjs';

const MAX_AMOUNT = 999999999;
const monetary = (value, field, nullable = true) => {
  if (value === null && nullable) return null;
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_AMOUNT) throw new RangeError(`Invalid ${field}`);
  return value;
};

/** Parse a nonnegative amount into the market currency's smallest unit. */
export function parseMoney(value, market='US') {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const d=MARKETS[market]?.decimals;
  if (d === undefined) throw new RangeError('Unknown market');
  const s=String(value).trim().replace(/\s/g,'').replace(',','.');
  if (!(d === 0 ? /^\d{1,9}$/.test(s) : new RegExp(`^\\d{1,9}(?:\\.\\d{1,${d}})?$`).test(s))) return null;
  const [whole,part='']=s.split('.');
  const unit=10**d;
  const valueMinor=Number(whole)*unit+Number(part.padEnd(d,'0'));
  return Number.isSafeInteger(valueMinor) && valueMinor <= MAX_AMOUNT ? valueMinor : null;
}
export function printMoney(amount, market) {
  if (amount === null || !Number.isSafeInteger(amount)) return 'Not priced';
  const m=MARKETS[market]; if(!m)throw new RangeError('Unknown market');
  return new Intl.NumberFormat(m.locale,{style:'currency',currency:m.currency,minimumFractionDigits:m.decimals,maximumFractionDigits:m.decimals}).format(amount / (10**m.decimals));
}
export function defaultScenario() {
  return {
    market:'US', edition:'standard', route:'own', platform:'ps5-digital',
    hardwareCents:null, hardwareQuote:'personal', gameCents:null,
    extraCents:0, taxBasisPoints:null, resaleCents:null,
    plannedHours:40, cloudPricingMode:'official', cloudPackCents:null, cloudHoursPerPack:null,
  };
}
const rule = (bool,message) => { if(!bool)throw new RangeError(message); };

/**
 * Compute a source-linked cost receipt. Unknown values are kept distinct from
 * zero and block the claim that a receipt is a complete cost projection.
 * Currency conversion is never performed.
 */
export function calculate(scenario) {
  rule(scenario && MARKETS[scenario.market], 'Unsupported country');
  const m=MARKETS[scenario.market];
  rule(['standard','ultimate'].includes(scenario.edition),'Unsupported edition');
  rule(['own','buy','cloud'].includes(scenario.route),'Unsupported play route');
  const hardware=HARDWARE[scenario.platform];
  rule(hardware,'Unsupported device');
  rule(scenario.route === 'cloud' ? hardware.ecosystem === 'xbox' : !hardware.cloudOnly, 'Device not supported for this play route');
  rule(Number.isSafeInteger(scenario.plannedHours) && scenario.plannedHours>=1 && scenario.plannedHours<=10000,'Hours must be between 1 and 10,000');
  const extra = monetary(scenario.extraCents,'extras',false);
  const resale = scenario.route==='buy' ? monetary(scenario.resaleCents,'resale') : null;
  const quote = scenario.route==='buy' ? monetary(scenario.hardwareCents,'hardware quotation') : null;
  const userGame = monetary(scenario.gameCents,'personal game price');
  const lines=[]; const unknown=[]; const caveats=[];
  let subtotal=0; let cloudPlan=null;
  const push=(id,label,amount,evidence,source=null,category='other')=>{
    lines.push({id,label,amount,evidence,source,category,checked:source?VERIFIED_ON:null});
    if(amount!==null)subtotal+=amount;
  };
  const currentGame=m.game[hardware.ecosystem];
  if(currentGame) {
    push('game',`GTA VI · ${scenario.edition==='standard'?'Standard':'Ultimate'} edition`,currentGame.prices[scenario.edition],'verified',currentGame.source[scenario.edition],'game');
  } else if(userGame!==null) {
    push('game',`GTA VI · ${scenario.edition==='standard'?'Standard':'Ultimate'} (your quote)`,userGame,'entered',null,'game');
    caveats.push('The game price for this platform and region was entered by you; first-party verification is pending.');
  } else {
    unknown.push('First-party PlayStation price for this country');
    push('game','GTA VI · price not verified for this platform',null,'unknown',null,'game');
  }
  if(scenario.route==='buy') {
    const ref=HARDWARE_REFERENCES[`${scenario.market}:${scenario.platform}`];
    if(quote===null) {
      unknown.push('New or refurbished console price');
      push('hardware',hardware.label,null,'unknown',null,'hardware');
    } else {
      const verified=Boolean(ref && ref.amount===quote && ref.id===scenario.hardwareQuote);
      push('hardware',hardware.label,quote,verified?'verified':'entered',verified?ref.source:null,'hardware');
    }
  }
  if(extra) push('extras','Accessories and other one-time costs',extra,'entered',null,'extras');
  if(scenario.route==='cloud') {
    const mode=scenario.cloudPricingMode ?? 'official';
    rule(['official','custom','ad'].includes(mode),'Unsupported cloud payment type');
    if(hardware.unconfirmedDevice) {
      unknown.push('GTA VI availability on the selected cloud device');
      caveats.push('Xbox documents cloud gaming for several device types, but GTA VI launch support is explicitly announced for Xbox One and Xbox Series X|S. Verify this device in the Xbox app.');
    }
    if(mode==='ad') {
      push('cloud-ad','Ad-supported access · coverage not established',null,'conditional',null,'cloud');
      unknown.push('Ad-supported session and monthly limits for planned hours');
      caveats.push('Microsoft lists a zero-subscription-cost ad-supported route, with session and monthly caps. This receipt does not establish sufficient access for your planned hours. Game purchase remains necessary.');
    } else if(mode==='official') {
      const packs=CLOUD_PACKS[scenario.market];
      if(!packs) {
        unknown.push('Local prepaid cloud pack prices');
        push('cloud','Cloud access · official local tariff unavailable',null,'unknown',null,'cloud');
      } else {
        cloudPlan=cheapestCloudPacks(scenario.plannedHours,packs);
        for(const p of cloudPlan.selection)push(`cloud-${p.hours}`,`${p.quantity} × ${p.hours}-hour Xbox cloud pack`,p.quantity*p.amount,'verified',p.source,'cloud');
        caveats.push(`Prepaid pack estimate covers ${cloudPlan.coveredHours} hours; ${cloudPlan.unusedHours} hours exceed your requested playtime. Eligibility and playable titles vary.`);
      }
    } else {
      const pack=monetary(scenario.cloudPackCents,'custom cloud price');
      const packHours=scenario.cloudHoursPerPack;
      if(pack===null || !Number.isSafeInteger(packHours) || packHours<1 || packHours>10000) {
        unknown.push('Custom cloud access tariff');
        push('cloud','Cloud access · personal rate missing',null,'unknown',null,'cloud');
      } else {
        const quantity=Math.ceil(scenario.plannedHours/packHours);
        cloudPlan={ totalAmount:quantity*pack, coveredHours:quantity*packHours, unusedHours:quantity*packHours-scenario.plannedHours,
          selection:[{hours:packHours,amount:pack,quantity}]};
        push('cloud',`${quantity} × ${packHours}-hour custom cloud pack`,cloudPlan.totalAmount,'entered',null,'cloud');
      }
    }
  }
  let tax=null;
  if(!m.taxIncluded) {
    const bps=scenario.taxBasisPoints;
    if(bps===null || bps===undefined) {
      unknown.push('Local sales tax');
      push('tax','Estimated checkout taxes',null,'unknown',null,'tax');
    } else {
      rule(Number.isSafeInteger(bps) && bps>=0 && bps<=10000,'Invalid sales tax rate');
      tax=Math.round(subtotal*bps/10000);
      push('tax',`Illustrative tax · ${(bps/100).toFixed(2)}%`,tax,'entered',null,'tax');
    }
    caveats.push('One entered rate is applied to all modelled items. Actual game, hardware, and cloud tax treatment differs by jurisdiction and merchant.');
  } else {
    caveats.push('Storefront game and cloud prices are displayed inclusive of applicable indirect taxes; personal hardware quotes should include tax.');
  }
  const complete=unknown.length===0;
  const total=complete?subtotal:null;
  const net=total!==null&&resale!==null?total-resale:null;
  return {
    market:scenario.market,currency:m.currency,edition:scenario.edition,route:scenario.route,platform:scenario.platform,
    lines,subtotal,checkout:total,unknown,fullyPriced:complete,cloudPlan,estimatedFutureResale:resale,futureNetIfResold:net,
    caveats,checked:VERIFIED_ON,
  };
}

/** URL encoding preserves only allowlisted scenario keys and strictly validates decoded state. */
export function encodeScenario(scenario) {
  const fields=Object.keys(defaultScenario());
  return 'v1.'+encodeURIComponent(JSON.stringify(Object.fromEntries(fields.map(k=>[k,scenario[k]]))));
}
export function decodeScenario(value) {
  if(typeof value!=='string' || value.length>2500 || !value.startsWith('v1.'))return null;
  try {
    const raw=JSON.parse(decodeURIComponent(value.slice(3)));
    if(!raw || typeof raw!=='object' || Array.isArray(raw))return null;
    const defaults=defaultScenario();
    const result={...defaults};
    for(const k of Object.keys(defaults))if(Object.hasOwn(raw,k))result[k]=raw[k];
    calculate(result);
    return result;
  } catch {return null;}
}
