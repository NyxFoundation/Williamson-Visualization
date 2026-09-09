import assert from 'node:assert/strict';
import test from 'node:test';
import { calculate, initial, scoreKeys } from './model';
import type { Params } from './model';
const neutral: Params = { uncertainty: 0, smallNumbers: 0, assetSpecificity: 0, frequency: 0, boundedRationality: 0, opportunism: 0 };
test('scores remain bounded and deterministic across the parameter space', () => {
  let seed = 7;
  for (let n = 0; n < 1500; n++) {
    const p = Object.fromEntries(Object.keys(initial).map(key => { seed = (seed * 1664525 + 1013904223) >>> 0; return [key, seed % 101]; })) as Params;
    const r = calculate(p);
    assert.deepEqual(r, calculate(p));
    for (const key of scoreKeys) assert.ok(r.scores[key] >= 0 && r.scores[key] <= 100);
    assert.ok(r.position >= 0 && r.position <= 100);
    assert.equal(r.candidates.length, 3);
    scoreKeys.forEach((key, i) => assert.equal(r.scores[key], Math.min(100, Math.max(0, r.base[i] + r.rules.reduce((sum, rule) => sum + rule.effect[i], 0)))));
  }
});
test('small numbers and opportunism lower market suitability and raise hierarchy', () => {
  const low = calculate({ ...neutral, opportunism: 90 }).scores;
  const high = calculate({ ...neutral, opportunism: 90, smallNumbers: 90 }).scores;
  assert.ok(high.marketScore < low.marketScore);
  assert.ok(high.hierarchyScore > low.hierarchyScore);
});
test('uncertainty and bounded rationality support hybrid adaptation', () => {
  const low = calculate({ ...neutral, boundedRationality: 90 }).scores;
  const high = calculate({ ...neutral, boundedRationality: 90, uncertainty: 90 }).scores;
  assert.ok(high.marketScore < low.marketScore);
  assert.ok(high.hybridScore > low.hybridScore);
});
test('specificity alone does not force integration; opportunism changes the result', () => {
  const p = { ...initial, assetSpecificity: 95, opportunism: 10 };
  assert.equal(calculate(p).ranked[0], 'hybridScore');
  assert.equal(calculate({ ...p, opportunism: 95 }).ranked[0], 'hierarchyScore');
  const low = calculate({ ...p, assetSpecificity: 10 }).scores;
  assert.ok(calculate(p).scores.hybridScore > low.hybridScore + 20);
});
test('uncertainty with few counterparties lowers market score', () => {
  assert.ok(calculate({ ...neutral, uncertainty: 90, smallNumbers: 90 }).scores.marketScore < calculate({ ...neutral, uncertainty: 90 }).scores.marketScore);
});
test('frequency benefits both continuing governance structures', () => {
  const low = calculate({ ...initial, frequency: 0 }).scores;
  const high = calculate({ ...initial, frequency: 100 }).scores;
  assert.ok(high.hybridScore > low.hybridScore);
  assert.ok(high.hierarchyScore > low.hierarchyScore);
});
test('required interaction terms multiply normalized inputs', () => {
  const r = calculate(initial);
  assert.equal(r.rules.find(r => r.name === '資産特殊性 × 機会主義')!.strength, .65 * .4);
  assert.equal(r.rules.find(r => r.name === '不確実性 × 限定合理性')!.strength, .55 * .65);
  assert.equal(r.rules.find(r => r.name === '不確実性 × 資産特殊性')!.strength, .55 * .65);
  assert.equal(r.rules.find(r => r.name === '少数性 × 機会主義')!.strength, .5 * .4);
});
