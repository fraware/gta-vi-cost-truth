import test from 'node:test';
import assert from 'node:assert/strict';
import { MARKETS, HARDWARE, HARDWARE_REFERENCES, CLOUD_PACKS } from '../src/catalog.mjs';
import { calculate, defaultScenario, parseMoney, printMoney, encodeScenario, decodeScenario } from '../src/engine.mjs';
import { cheapestCloudPacks } from '../src/cloud.mjs';
const setup = (properties={})=>({...defaultScenario(),...properties});

test('market registry has nine independently priced Xbox storefront entries',()=>{
  assert.deepEqual(Object.keys(MARKETS),['US','FR','GB','CA','AU','DE','ES','IT','JP']);
  for(const m of Object.values(MARKETS)){
    assert.ok(m.game.xbox.prices.standard>0);
    assert.ok(m.game.xbox.prices.ultimate>m.game.xbox.prices.standard);
    assert.match(m.game.xbox.source.standard,/^https:\/\/www\.xbox\.com\//);
  }
});
test('five regionally verified cloud pack catalogs',()=>{
  assert.deepEqual(Object.keys(CLOUD_PACKS),['US','FR','GB','CA','AU']);
  assert.deepEqual(CLOUD_PACKS.US.map(p=>p.amount),[399,799,1199]);
  assert.deepEqual(CLOUD_PACKS.FR.map(p=>p.amount),[349,699,1099]);
  assert.deepEqual(CLOUD_PACKS.GB.map(p=>p.amount),[299,599,899]);
  assert.deepEqual(CLOUD_PACKS.CA.map(p=>p.amount),[499,1099,1699]);
  assert.deepEqual(CLOUD_PACKS.AU.map(p=>p.amount),[595,1195,1795]);
  for(const packs of Object.values(CLOUD_PACKS))assert.deepEqual(packs.map(p=>p.hours),[10,25,50]);
});
test('currency formatting retains correct scale including zero-decimal JPY',()=>{
  assert.equal(printMoney(7999,'US'),'$79.99');
  assert.equal(printMoney(7999,'FR'),'79,99 €');
  assert.equal(printMoney(9800,'JP'),'￥9,800');
  assert.equal(parseMoney('7,45','FR'),745);
  assert.equal(parseMoney('123','JP'),123);
  assert.equal(parseMoney('123.9','JP'),null);
  assert.equal(parseMoney('-1.00','US'),null);
  assert.equal(parseMoney('','US'),null);
  assert.equal(parseMoney('0','US'),0);
});
test('US standard game remains a known minimum until sales tax entered',()=>{
  const r=calculate(setup());
  assert.equal(r.subtotal,7999);
  assert.equal(r.checkout,null);
  assert.deepEqual(r.unknown,['Local sales tax']);
});
test('explicit zero US tax creates a valid complete total',()=>{
  const r=calculate(setup({taxBasisPoints:0}));
  assert.equal(r.checkout,7999);assert.equal(r.fullyPriced,true);
});
test('France, UK and Germany game totals match first-party snapshots',()=>{
  assert.equal(calculate(setup({market:'FR'})).checkout,7999);
  assert.equal(calculate(setup({market:'GB',edition:'ultimate'})).checkout,8999);
  assert.equal(calculate(setup({market:'DE',edition:'ultimate'})).checkout,9999);
});
test('Canadian tax unknown is not silently treated as free',()=>{
  const r=calculate(setup({market:'CA'}));
  assert.equal(r.subtotal,10999);assert.equal(r.checkout,null);
  assert.ok(r.unknown.includes('Local sales tax'));
});
test('Japanese Xbox edition prices use whole yen without accidental ×100',()=>{
  assert.equal(calculate(setup({market:'JP',platform:'xbox-series-s'})).checkout,9800);
  assert.equal(calculate(setup({market:'JP',platform:'xbox-series-x',edition:'ultimate'})).checkout,12280);
});
test('unverified local PS store quote stays unresolved until personally entered',()=>{
  const initial=calculate(setup({market:'AU',platform:'ps5-digital'}));
  assert.equal(initial.checkout,null);
  assert.ok(initial.unknown.some(x=>/PlayStation price/.test(x)));
  const entered=calculate(setup({market:'AU',platform:'ps5-digital',gameCents:12995}));
  assert.equal(entered.checkout,12995);assert.equal(entered.lines[0].evidence,'entered');
});
test('personal hardware quote, official hardware quote and tax are distinguished',()=>{
  const ref=HARDWARE_REFERENCES['US:xbox-series-s'];
  const s=setup({route:'buy',platform:'xbox-series-s',hardwareCents:ref.amount,hardwareQuote:ref.id,taxBasisPoints:750,extraCents:3000,resaleCents:12500});
  const r=calculate(s);
  assert.equal(r.lines.find(x=>x.id==='hardware').evidence,'verified');
  assert.equal(r.checkout,Math.round((7999+49999+3000)*1.075));
  assert.equal(r.futureNetIfResold,r.checkout-12500);
  const custom=calculate({...s,hardwareQuote:'personal'});
  assert.equal(custom.lines.find(x=>x.id==='hardware').evidence,'entered');
});
test('missing hardware quote never implies a zero-cost console',()=>{
  const r=calculate(setup({market:'FR',route:'buy',platform:'ps5-disc'}));
  assert.equal(r.checkout,null);assert.ok(r.unknown.some(x=>/console price/.test(x)));
});
test('cloud pack optimizer is globally optimal for every small hours target',()=>{
  const packs=CLOUD_PACKS.US;
  for(let hours=1;hours<=175;hours++){
    const result=cheapestCloudPacks(hours,packs);
    let brute=Infinity;
    for(let a=0;a<=20;a++)for(let b=0;b<=10;b++)for(let c=0;c<=5;c++){
      if(a*10+b*25+c*50>=hours)brute=Math.min(brute,a*399+b*799+c*1199);
    }
    assert.equal(result.totalAmount,brute,`${hours}h failed`);
    assert.ok(result.coveredHours>=hours);
    assert.equal(result.totalAmount,result.selection.reduce((n,p)=>n+p.quantity*p.amount,0));
  }
});
test('cloud 40h uses one 50h pack, even if shorter bundles exist',()=>{
  for(const [code,price] of [['US',1199],['FR',1099],['GB',899],['CA',1699],['AU',1795]]){
    const r=calculate(setup({market:code,route:'cloud',platform:'xbox-one',taxBasisPoints:0}));
    assert.equal(r.cloudPlan.totalAmount,price);
    assert.equal(r.cloudPlan.coveredHours,50);
    assert.equal(r.cloudPlan.unusedHours,10);
    assert.equal(r.checkout,MARKETS[code].game.xbox.prices.standard+price);
  }
});
test('custom cloud plan carries user-entered provenance',()=>{
  const r=calculate(setup({market:'FR',route:'cloud',platform:'xbox-one',cloudPricingMode:'custom',cloudPackCents:200,cloudHoursPerPack:10,plannedHours:21}));
  assert.equal(r.checkout,8599);assert.equal(r.cloudPlan.totalAmount,600);
  assert.equal(r.lines.find(x=>x.id==='cloud').evidence,'entered');
});
test('zero-cost user-quoted cloud packs are mathematically distinguishable from unknown',()=>{
  const r=calculate(setup({market:'GB',route:'cloud',platform:'xbox-one',cloudPricingMode:'custom',cloudPackCents:0,cloudHoursPerPack:5,plannedHours:15}));
  assert.equal(r.checkout,6999);assert.equal(r.cloudPlan.totalAmount,0);
});
test('ad-supported streaming is conditional, not presented as unlimited free access',()=>{
  const r=calculate(setup({market:'FR',route:'cloud',platform:'xbox-one',cloudPricingMode:'ad'}));
  assert.equal(r.checkout,null);
  assert.ok(r.unknown.some(x=>/Ad-supported/.test(x)));
  assert.equal(r.lines.find(x=>x.id==='cloud-ad').evidence,'conditional');
});
test('unverified game availability on PC/TV requires separate check',()=>{
  const r=calculate(setup({market:'GB',route:'cloud',platform:'pc-cloud'}));
  assert.ok(r.unknown.some(x=>/availability/.test(x)));
  assert.equal(r.checkout,null);
  assert.throws(()=>calculate(setup({platform:'pc-cloud',route:'own'})));
});
test('unpriced country cloud access stays unpriced',()=>{
  const r=calculate(setup({market:'JP',route:'cloud',platform:'xbox-one'}));
  assert.equal(r.checkout,null);assert.ok(r.unknown.some(x=>/cloud pack/.test(x)));
});
test('unsupported routes, incompatible devices, invalid fields raise',()=>{
  assert.throws(()=>calculate(setup({route:'cloud',platform:'ps5-digital'})));
  assert.throws(()=>calculate(setup({route:'own',platform:'xbox-one'})));
  assert.throws(()=>calculate(setup({market:'XX'})));
  assert.throws(()=>calculate(setup({plannedHours:0})));
  assert.throws(()=>calculate(setup({taxBasisPoints:25000})));
  assert.throws(()=>calculate(setup({extraCents:-1})));
  assert.throws(()=>calculate(setup({route:'cloud',platform:'xbox-one',cloudPricingMode:'unlimited'})));
});
test('shareable scenario roundtrip ignores unknown fields and rejects corrupt payloads',()=>{
  const s=setup({market:'CA',route:'cloud',platform:'xbox-one',plannedHours:200,edition:'ultimate'});
  assert.deepEqual(decodeScenario(encodeScenario(s)),s);
  assert.equal(decodeScenario('not a url'),null);
  assert.equal(decodeScenario('v1.'+'x'.repeat(3000)),null);
  assert.equal(decodeScenario('v1.'+encodeURIComponent('{"market":"bad"}')),null);
  assert.equal(decodeScenario('v1.'+encodeURIComponent('{"route":"own","platform":"pc-cloud"}')),null);
});

test('published first-party console reference prices are market and model scoped',()=>{
  assert.equal(HARDWARE_REFERENCES['GB:xbox-series-s'].amount,42999);
  assert.equal(HARDWARE_REFERENCES['GB:ps5-digital'].amount,51999);
  assert.equal(HARDWARE_REFERENCES['CA:xbox-series-s'].amount,64999);
  assert.equal(HARDWARE_REFERENCES['AU:xbox-series-s'].amount,69900);
  for(const quote of Object.values(HARDWARE_REFERENCES)){
    const r=calculate(setup({market:quote.market,route:'buy',platform:quote.model,
      hardwareCents:quote.amount,hardwareQuote:quote.id,taxBasisPoints:0}));
    assert.equal(r.lines.find(line=>line.id==='hardware').evidence,'verified');
    assert.match(r.lines.find(line=>line.id==='hardware').source,/^https:\/\//);
  }
});
test('conditional access does not count as a zero-priced verified entitlement',()=>{
  const r=calculate(setup({market:'FR',route:'cloud',platform:'xbox-one',cloudPricingMode:'ad'}));
  assert.equal(r.checkout,null);
  assert.equal(r.lines.find(line=>line.id==='cloud-ad').amount,null);
  assert.equal(r.lines.find(line=>line.id==='cloud-ad').evidence,'conditional');
});

test('CLI reports a sourced French 40-hour cloud receipt as JSON',async()=>{
  const { spawnSync }=await import('node:child_process');
  const run=spawnSync(process.execPath,['scripts/cost.mjs','--market','FR','--route','cloud','--device','xbox-one','--hours','40'],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const {result}=JSON.parse(run.stdout);
  assert.equal(result.checkout,9098);
  assert.equal(result.cloudPlan.totalAmount,1099);
  assert.equal(result.unknown.length,0);
});
test('CLI rejects invented market IDs and malformed tax rates',async()=>{
  const { spawnSync }=await import('node:child_process');
  for(const flags of [['--market','EU'],['--market','US','--tax-rate','200'],['--market','JP','--extras','123.2']]){
    const run=spawnSync(process.execPath,['scripts/cost.mjs',...flags],{encoding:'utf8'});
    assert.equal(run.status,1,`Rejected options ${flags.join(' ')}`);
  }
});
test('JSON data export matches the versioned first-party catalog',async()=>{
  const {readFileSync}=await import('node:fs');
  const json=JSON.parse(readFileSync(new URL('../data/prices.json',import.meta.url),'utf8'));
  assert.equal(json.schemaVersion,1);
  assert.deepEqual(json.markets,JSON.parse(JSON.stringify(MARKETS)));
  assert.deepEqual(json.hardwareReferences,JSON.parse(JSON.stringify(HARDWARE_REFERENCES)));
  assert.deepEqual(json.cloudPacks,JSON.parse(JSON.stringify(CLOUD_PACKS)));
});
