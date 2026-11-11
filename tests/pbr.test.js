import test from 'node:test';
import assert from 'node:assert/strict';
import {
  distributionGGX,
  geometrySmith,
  fresnelSchlick,
  cookTorrance,
  tonemapACES,
  saturate,
} from '../src/math/pbr.js';

test('GGX peaks near 1 when roughness tiny and nDotH=1', () => {
  const d = distributionGGX(1, 0.05);
  assert.ok(d > 10, `expected sharp GGX peak, got ${d}`);
});

test('GGX falls off as nDotH decreases', () => {
  const a = distributionGGX(1.0, 0.2);
  const b = distributionGGX(0.5, 0.2);
  assert.ok(a > b);
});

test('geometrySmith in (0,1] for sane inputs', () => {
  const g = geometrySmith(0.8, 0.7, 0.3);
  assert.ok(g > 0 && g <= 1, `got ${g}`);
});

test('fresnel increases toward edge', () => {
  const f0 = 0.04;
  const face = fresnelSchlick(1.0, f0);
  const edge = fresnelSchlick(0.05, f0);
  assert.ok(edge > face);
});

test('cookTorrance finite and positive', () => {
  const s = cookTorrance(0.9, 0.8, 0.95, 0.25, 0.04);
  assert.ok(Number.isFinite(s) && s > 0);
});

test('ACES tonemap compresses highlights', () => {
  const a = tonemapACES(1.0);
  const b = tonemapACES(8.0);
  assert.ok(a < 1.0 && b < 1.05);
  assert.ok(b > a);
  assert.ok(saturate(b) === b || b <= 1.0);
});
