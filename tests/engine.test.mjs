import test from 'node:test';
import assert from 'node:assert/strict';
import { MARKETS, HARDWARE_REFERENCE } from '../src/catalog.mjs';
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
  assert.equal(r.checkout, null);
  assert.ok(r.unknown.includes('Cloud-play tariff'));
});

test('cloud rounds the number of packs up', () => {
  const r = calculate(scenario({ market: 'FR', route: 'cloud', platform: 'xbox-one', cloudPackCents: 200, cloudHoursPerPack: 10, plannedHours: 21 }));
  assert.equal(r.checkout, 8599);
  assert.equal(r.lines.find(x => x.id === 'cloud').cents, 600);
});

test('explicit free pack is not mistaken for missing price', () => {
  const r = calculate(scenario({ market: 'FR', route: 'cloud', platform: 'xbox-one', cloudPackCents: 0, cloudHoursPerPack: 5, plannedHours: 6 }));
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
