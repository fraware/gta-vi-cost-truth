import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/index.mjs';

const expected = ['calculate','defaultScenario','encodeScenario','decodeScenario','parseMoney','printMoney','cheapestCloudPacks','MARKETS','CLOUD_PACKS','HARDWARE_REFERENCES','HARDWARE','SOURCES','VERIFIED_ON'];

test('public module surface exports every documented API symbol', () => {
  for(const name of expected) assert.ok(Object.hasOwn(api,name), `Missing exported function or catalog ${name}`);
});

test('French live-documentation sample yields the verified dated snapshot', () => {
  const result = api.calculate({ ...api.defaultScenario(), market:'FR', route:'cloud', platform:'xbox-one', plannedHours:40 });
  assert.equal(result.checkout,9098);
  assert.equal(result.cloudPlan?.coveredHours,50);
  assert.equal(result.unknown.length,0);
  assert.equal(result.lines.find(x=>x.id==='game').evidence,'verified');
});

test('unknown sales tax blocks checkout even with source-backed game and hardware', () => {
  const result=api.calculate({...api.defaultScenario(),market:'US',route:'buy',platform:'xbox-series-s',hardwareCents:49999});
  assert.equal(result.checkout,null);
  assert.ok(result.unknown.includes('Local sales tax'));
});
