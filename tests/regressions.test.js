import test from 'node:test';
import assert from 'node:assert/strict';
import { CITIES } from '../src/data/cities.js';
import { attachPrices } from '../src/data/provider.js';
import { STATIONS } from '../src/data/stations.js';
import { MOCK_PRICES } from '../src/data/mock-prices.js';
import { distanceKm } from '../src/lib/geo.js';
import { finiteInRange } from '../src/lib/format.js';
import { filterStations } from '../src/lib/filter.js';
import { renderLayout, syncControls } from '../src/ui/layout.js';
import { stationCard } from '../src/ui/cards.js';
import { stationDetail } from '../src/ui/detail.js';

const center = CITIES[0];
const state = { lang: 'en', theme: 'light', city: center.id, center, fuel: 'petrol95',
  radiusKm: 25, brand: 'all', sort: 'price', litres: 40, consumption: 7,
  favourites: new Set(), search: '', mobileTab: 'list' };
const stations = attachPrices(STATIONS, MOCK_PRICES);

test('invalid coordinates cannot enter distance comparisons', () => {
  for (const point of [null, {}, { lat: NaN, lon: 19 }, { lat: 91, lon: 19 }, { lat: 47, lon: 181 }, { lat: '47', lon: 19 }]) {
    assert.equal(distanceKm(center, point), Infinity);
    assert.equal(distanceKm(point, center), Infinity);
  }
  assert.ok(Number.isFinite(distanceKm({ lat: 0, lon: 0 }, { lat: 0, lon: 180 })));
  const broken = { ...stations[0], lat: NaN };
  assert.deepEqual(filterStations([broken], state), []);
});

test('invalid prices and unknown or negative freshness are never presented as fresh', () => {
  const station = stations[0];
  for (const hufPerLitre of [NaN, Infinity, -1, 0, '600']) {
    const broken = { ...station, prices: { petrol95: { hufPerLitre, ageHours: 1 } } };
    assert.deepEqual(filterStations([broken], state), []);
  }
  for (const ageHours of [undefined, NaN, -1, Infinity, 24]) {
    const broken = { ...station, prices: { petrol95: { hufPerLitre: 600, ageHours } } };
    assert.deepEqual(filterStations([broken], { ...state, onlyFresh: true }), []);
  }
});

test('empty numeric preferences use defaults and out-of-range values are clamped', () => {
  for (const value of ['', '  ', null, undefined, true, 'bad']) {
    assert.equal(finiteInRange(value, 0, 30, 7), 7);
  }
  assert.equal(finiteInRange('0', 0, 30, 7), 0);
  assert.equal(finiteInRange('-10', 5, 120, 40), 5);
  assert.equal(finiteInRange('999', 5, 120, 40), 120);
});

test('controls show normalized preferences, GPS origin and pressed fuel', () => {
  const inputs = { litres: { value: '999' }, consumption: { value: '' }, city: {} };
  const buttons = ['petrol95', 'diesel'].map(fuel => ({ dataset: { fuel },
    classList: { toggle(name, active) { this[name] = active; } },
    setAttribute(name, value) { this[name] = value; } }));
  const root = { getElementById: id => inputs[id], querySelectorAll: () => buttons };
  syncControls(root, { ...state, litres: 120, center: { lat: 47, lon: 19 } });
  assert.equal(inputs.litres.value, '120');
  assert.equal(inputs.consumption.value, '7');
  assert.equal(inputs.city.value, '');
  assert.equal(buttons[0]['aria-pressed'], 'true');
  assert.equal(buttons[1]['aria-pressed'], 'false');
  syncControls(root, state);
  assert.equal(inputs.city.value, 'budapest');
});

test('both languages keep mock disclosure and Plein credit throughout the interface', () => {
  const station = filterStations(stations, state)[0];
  for (const lang of ['hu', 'en']) {
    const view = { ...state, lang };
    const layout = renderLayout(view);
    assert.match(layout, /https:\/\/github.com\/aslafy-z\/plein/);
    assert.match(layout, lang === 'hu' ? /nincs élő adat/ : /no live data/);
    assert.match(layout, /value="" disabled/);
    assert.match(stationCard(station, view, 0), /station-demo">DEMO/);
    assert.match(stationDetail(station, view), lang === 'hu' ? /Szintetikus adatok/ : /Simulated test data/);
  }
});
