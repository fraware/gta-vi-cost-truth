import test from 'node:test';
import assert from 'node:assert/strict';
import { MARKETS, HARDWARE_REFERENCE, HARDWARE_REFERENCES, CLOUD_PACKS } from '../src/catalog.mjs';
import { cheapestCloudPacks } from '../src/cloud.mjs';
import { calculate, defaultScenario, encodeScenario, decodeScenario, parseMoney, printMoney } from '../src/engine.mjs';

const scenario = (overrides = {}) => ({ ...defaultScenario(), ...overrides });

test('US base price is correct; missing tax remains unknown', () => {
  const r = calculate(scenario());
  assert.equal(r.subtotal, 7999);
  assert.equal(r.checkout, null);
  assert.ok(r.unknown.includes('Applicable sales tax'));
});

test('existing French owner has a tax-inclusive receipt', () => {
  const r = calculate(scenario({ market: 'FR' }));
  assert.equal(r.checkout, 7999);
  assert.equal(r.fullyPriced, true);
});

test('UK prices match the market snapshot', () => {
  assert.equal(calculate(scenario({ market: 'GB' })).checkout, 6999);
  assert.equal(calculate(scenario({ market: 'GB', edition: 'ultimate' })).checkout, 8999);
});

test('explicit zero US tax is distinct from unknown tax', () => {
  assert.equal(calculate(scenario({ taxBasisPoints: 0 })).checkout, 7999);
});

test('hardware purchase applies tax and excludes resale from checkout', () => {
  const r = calculate(scenario({ route: 'buy', platform: 'xbox-series-s', hardwareCents: 49999, taxBasisPoints: 750, resaleCents: 25000 }));
  assert.equal(r.checkout, 62348);
  assert.equal(r.futureNetIfResold, 37348);
});

test('missing hardware quote blocks complete total', () => {
  const r = calculate(scenario({ market: 'FR', route: 'buy', platform: 'ps5-digital' }));
  assert.equal(r.checkout, null);
  assert.ok(r.unknown.includes('Console quotation'));
});

test('cloud cost is unknown until pack tariff and size are provided', () => {
  const r = calculate(scenario({ route: 'cloud', platform: 'xbox-one', taxBasisPoints: 0 }));
  assert.equal(r.subtotal, 9198);
  assert.ok(!r.unknown.includes('Cloud-play tariff'));
});

test('cloud rounds the number of packs up', () => {
  const r = calculate(scenario({ market: 'FR', route: 'cloud', platform: 'xbox-one', cloudPricingMode: 'custom', cloudPackCents: 200, cloudHoursPerPack: 10, plannedHours: 21 }));
  assert.equal(r.checkout, 8599);
  assert.equal(r.lines.find(x => x.id === 'cloud').cents, 600);
});

test('explicit free pack is not mistaken for missing price', () => {
  const r = calculate(scenario({ market: 'FR', route: 'cloud', platform: 'xbox-one', cloudPricingMode: 'custom', cloudPackCents: 0, cloudHoursPerPack: 5, plannedHours: 6 }));
  assert.equal(r.checkout, 7999);
});

test('official hardware badge only applies to matching reference', () => {
  const common = { route: 'buy', platform: 'xbox-series-s', market: 'US', hardwareCents: HARDWARE_REFERENCE.cents, taxBasisPoints: 0 };
  assert.equal(calculate(scenario({ ...common, hardwareQuote: HARDWARE_REFERENCE.id })).lines.find(x=>x.id==='hardware').evidence, 'verified');
  assert.equal(calculate(scenario({ ...common, hardwareQuote: 'personal' })).lines.find(x=>x.id==='hardware').evidence, 'entered');
});

test('money parsing uses integer minor units', () => {
  assert.equal(parseMoney('1.23'), 123);
  assert.equal(parseMoney('1,23'), 123);
  assert.equal(parseMoney(''), null);
  assert.equal(parseMoney('-1'), null);
  assert.equal(printMoney(7999, 'US'), '$79.99');
});

test('share URLs round-trip and reject invalid payload', () => {
  const x=scenario({ market:'GB', edition:'ultimate', extraCents:1234 });
  assert.deepEqual(decodeScenario(encodeScenario(x)),x);
  assert.equal(decodeScenario('%7Bnot-json'),null);
  assert.equal(decodeScenario('x'.repeat(5000)),null);
});

test('invalid routes and devices are rejected', () => {
  assert.throws(()=>calculate(scenario({ route:'own', platform:'xbox-one' })));
  assert.throws(()=>calculate(scenario({ route:'cloud', platform:'ps5-digital' })));
  assert.throws(()=>calculate(scenario({ edition:'special' })));
});

test('three-market, first-party cloud pack catalogs are complete', () => {
  assert.deepEqual(Object.keys(CLOUD_PACKS), ['US','FR','GB']);
  assert.deepEqual(CLOUD_PACKS.US.map(x=>x.cents),[399,799,1199]);
  assert.deepEqual(CLOUD_PACKS.FR.map(x=>x.cents),[349,699,1099]);
  assert.deepEqual(CLOUD_PACKS.GB.map(x=>x.cents),[299,599,899]);
  for (const market of Object.keys(CLOUD_PACKS)) {
    assert.deepEqual(CLOUD_PACKS[market].map(x=>x.hours),[10,25,50]);
    for (const pack of CLOUD_PACKS[market]) assert.match(pack.source,/^https:\/\/www\.xbox\.com\//);
  }
});

test('optimal pack planner never overcharges against exhaustive small search', () => {
  const packs = CLOUD_PACKS.US;
  for (let hours = 1; hours <= 125; hours++) {
    const got = cheapestCloudPacks(hours,packs);
    let best = Infinity;
    for (let a = 0; a <= 13; a++) for (let b = 0; b <= 6; b++) for (let c = 0; c <= 3; c++) {
      if (a*10+b*25+c*50 >= hours) best = Math.min(best,a*399+b*799+c*1199);
    }
    assert.equal(got.totalCents,best,`Incorrect min-cost for ${hours} hours`);
    assert.ok(got.coveredHours >= hours);
    assert.equal(got.selection.reduce((sum,p)=>sum+p.cents*p.quantity,0),got.totalCents);
  }
});

test('40h cloud route buys one 50h pack, not four 10h packs', () => {
  for (const [market,expected] of [['US',1199],['FR',1099],['GB',899]]) {
    const r = calculate(scenario({market,route:'cloud',platform:'xbox-one',taxBasisPoints:0}));
    assert.equal(r.cloudPlan.totalCents,expected);
    assert.equal(r.cloudPlan.coveredHours,50);
    assert.equal(r.lines.find(x=>x.id==='cloud-50').evidence,'verified');
  }
});

test('GTA VI cloud support is restricted to officially announced Xbox consoles', () => {
  for (const platform of ['xbox-one','xbox-series-s','xbox-series-x']) {
    assert.equal(calculate(scenario({ market:'FR',route:'cloud',platform })).checkout,9098);
  }
  for (const platform of ['pc-cloud','tv-cloud','phone-cloud','ps5-disc']) {
    assert.throws(()=>calculate(scenario({ market:'FR',route:'cloud',platform })));
  }
  assert.throws(()=>calculate(scenario({ market:'FR',route:'own',platform:'xbox-one' })));
});

test('official PS5 Digital quote is source-backed only at the exact quoted price', () => {
  const q=HARDWARE_REFERENCES['US:ps5-digital'];
  const data=scenario({route:'buy',platform:'ps5-digital',market:'US',hardwareCents:q.cents,hardwareQuote:q.id,taxBasisPoints:0});
  assert.equal(calculate(data).lines[1].evidence,'verified');
  assert.equal(calculate({...data,hardwareCents:q.cents+1}).lines[1].evidence,'entered');
});

test('custom cloud offers remain explicitly unknown without a quote', () => {
  const r=calculate(scenario({route:'cloud',platform:'xbox-one',cloudPricingMode:'custom',taxBasisPoints:0}));
  assert.equal(r.checkout,null);
  assert.ok(r.unknown.includes('Cloud-play tariff'));
  assert.throws(()=>calculate(scenario({route:'cloud',platform:'xbox-one',cloudPricingMode:'free'})));
});

test('game provenance follows platform ecosystem', () => {
  for (const market of ['US','FR','GB']) {
    for (const platform of ['ps5-digital','xbox-series-x']) {
      const r=calculate(scenario({market,platform}));
      const expected=platform.startsWith('xbox')?MARKETS[market].xboxSource.standard:MARKETS[market].source.standard;
      assert.equal(r.lines[0].source, expected);
      assert.equal(r.lines[0].evidence, 'verified');
    }
  }
});
