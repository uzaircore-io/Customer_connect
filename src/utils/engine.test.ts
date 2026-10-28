import test from 'node:test';
import assert from 'node:assert/strict';
import { haversineDistance, evaluateOpeningHours, checkHardFilters, scoreAndRankVendors } from './engine';
import { Business } from '../types';

test('haversineDistance calculates 0 for identical coordinates', () => {
  const d = haversineDistance(34.0725, 74.8105, 34.0725, 74.8105);
  assert.equal(d, 0);
});

test('haversineDistance computes accurate Srinagar distance (Lal Chowk to Rajbagh ~1.8km)', () => {
  const d = haversineDistance(34.0725, 74.8105, 34.062, 74.825);
  assert.ok(d > 1.0 && d < 2.5, `Expected distance ~1.8km, got ${d}`);
});

test('checkHardFilters enforces strict budget constraint', () => {
  const b = {
    id: 1,
    name: 'Luxury Watches',
    category: 'Watches',
    startingPrice: 15000,
    avgRating: 4.8,
    distanceKm: 2.0,
  } as Business;

  const passes = checkHardFilters(b, { maxBudget: 10000 });
  assert.equal(passes.passes, false);
  assert.ok(passes.failedReasons[0].includes('Starting price'));

  const passesHigh = checkHardFilters(b, { maxBudget: 20000 });
  assert.equal(passesHigh.passes, true);
});

test('scoreAndRankVendors scores higher for top-rated when rating weight is high', () => {
  const vendors: Business[] = [
    {
      id: 1,
      name: 'High Rating',
      avgRating: 4.9,
      distanceKm: 4.0,
      startingPrice: 10000,
      reviewCount: 90,
      verified: true,
      category: 'Watches',
    } as Business,
    {
      id: 2,
      name: 'Low Price Nearby',
      avgRating: 4.0,
      distanceKm: 1.0,
      startingPrice: 2000,
      reviewCount: 20,
      verified: false,
      category: 'Watches',
    } as Business,
  ];

  const ranked = scoreAndRankVendors(vendors, { rating: 0.8, distance: 0.1, price: 0.05, trust: 0.05 });
  assert.equal(ranked[0].id, 1);
  assert.ok(ranked[0].matchScore > ranked[1].matchScore);
});
