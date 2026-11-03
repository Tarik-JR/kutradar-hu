import test from 'node:test';
import assert from 'node:assert/strict';
import { CITIES } from '../src/data/cities.js';
import { BRANDS } from '../src/data/brands.js';
import { FUELS } from '../src/data/fuels.js';
import { STATIONS, createDemoStations } from '../src/data/stations.js';
import { MOCK_PRICES, createDemoPrices } from '../src/data/mock-prices.js';
import { attachPrices, mockProvider } from '../src/data/provider.js';
import { filterStations } from '../src/lib/filter.js';
import { distanceKm, locationInHungary } from '../src/lib/geo.js';
import { fillCost, estimatedTripCost } from '../src/lib/cost.js';
import { escapeHtml, formatMoney } from '../src/lib/format.js';
import { t } from '../src/lib/i18n.js';

const attached = attachPrices(STATIONS, MOCK_PRICES);
const budapest = CITIES.find(c => c.id === 'budapest');
const baseOptions = { center: budapest, fuel:'petrol95', radiusKm:25, brand:'all',sort:'price',litres:40,consumption:7 };

test('station dataset covers 20 Hungarian cities and familiar brands', () => {
  assert.equal(CITIES.length, 20);
  assert.ok(STATIONS.length >= 90);
  assert.equal(new Set(STATIONS.map(s => s.id)).size, STATIONS.length);
  assert.deepEqual(new Set(STATIONS.map(s => s.brand)), new Set(BRANDS.map(b => b.id)));
  assert.ok(STATIONS.every(s => s.demo === true && locationInHungary(s)));
});
test('generated stations and prices stay the same between runs', () => {
  assert.deepEqual(createDemoStations(), STATIONS);
  assert.deepEqual(createDemoPrices(), MOCK_PRICES);
  assert.ok(MOCK_PRICES.every(p => p.source === 'mock' && p.hufPerLitre > 0));
});
test('each source price refers to a known station and fuel', () => {
  const stationIds = new Set(STATIONS.map(s => s.id));
  const fuelIds = new Set(FUELS.map(f => f.id));
  assert.ok(MOCK_PRICES.every(p => stationIds.has(p.stationId) && fuelIds.has(p.fuelId)));
});
test('nearest distance to a city center is zero', () => {
  assert.equal(distanceKm(budapest, budapest), 0);
  assert.ok(distanceKm(budapest, CITIES.find(c => c.id === 'gyor')) > 90);
});
test('price search only includes stations in range and sorts ascending', () => {
  const results = filterStations(attached, baseOptions);
  assert.ok(results.length > 0);
  assert.ok(results.every(s => s.distance <= 25 && s.price?.hufPerLitre));
  assert.ok(results.every((s, i) => i === 0 || results[i-1].price.hufPerLitre <= s.price.hufPerLitre));
});
test('brand filters are strict and freshness option excludes stale mock records', () => {
  const branded = filterStations(attached, { ...baseOptions, brand:'mol' });
  assert.ok(branded.length > 0 && branded.every(s => s.brand === 'mol'));
  const fresh = filterStations(attached, { ...baseOptions, onlyFresh: true });
  assert.ok(fresh.length > 0 && fresh.every(s => s.price.ageHours < 24));
});
test('favourites-only mode returns only selected IDs', () => {
  const station = filterStations(attached, baseOptions)[0];
  const rows = filterStations(attached, { ...baseOptions, favouritesOnly: true, favourites: new Set([station.id]) });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, station.id);
});
test('cost model counts refuelling plus estimated detour', () => {
  assert.equal(fillCost(600, 40), 24000);
  assert.equal(estimatedTripCost(600, 0, 40, 7), 24000);
  assert.ok(estimatedTripCost(600, 10, 40, 7) > 24000);
  assert.equal(estimatedTripCost(600, -10, 40, 7), Infinity);
});
test('labels translate and dynamic text escapes HTML', () => {
  assert.equal(t('fuel', 'hu'), 'Üzemanyag');
  assert.equal(t('fuel', 'en'), 'Fuel type');
  assert.equal(escapeHtml('<script>"'), '&lt;script&gt;&quot;');
  assert.ok(formatMoney(600, 'hu').includes('Ft'));
});
test('mock provider can be swapped without changing the interface', async () => {
  assert.equal((await mockProvider.listStations()).length, STATIONS.length);
  assert.equal((await mockProvider.listPrices()).length, MOCK_PRICES.length);
  assert.equal((await mockProvider.getStation(STATIONS[0].id)).id, STATIONS[0].id);
});
