import test from 'node:test';
import assert from 'node:assert/strict';
import { setupMap, updateMap, panMapTo, destroyMap } from '../src/ui/map.js';

test('map preserves the viewport during filtering and keeps pins when tiles fail', () => {
  const views = [];
  const handlers = {};
  const layer = { innerHTML: '', pins: [], appendChild(pin) { this.pins.push(pin); } };
  const element = { classList: { add() {} }, innerHTML: '' };
  let removed = false;
  let tileURL;
  let attribution;
  const map = { setView(point, zoom) { views.push([point, zoom]); return this; },
    on() {}, remove() { removed = true; }, flyTo() {}, getZoom() { return 11; } };
  const tiles = { addTo() { return this; }, on(name, handler) { handlers[name] = handler; } };
  const markerLayer = { addTo() { return this; }, clearLayers() {} };
  const marker = { addTo() { return this; }, on() { return this; } };
  globalThis.window = { L: {
    map: () => map, control: { zoom: () => ({ addTo() {} }) },
    tileLayer(url, options) { tileURL = url; attribution = options.attribution; return tiles; },
    layerGroup: () => markerLayer, marker: () => marker, divIcon: options => options,
  } };
  globalThis.document = {
    getElementById: () => layer,
    createElement: () => ({ style: {}, setAttribute() {}, addEventListener(name, handler) { this[name] = handler; } }),
  };
  try {
    const center = { lat: 47.49, lon: 19.04 };
    const station = { id: 'demo-1', brand: 'mol', name: 'Demo station', ...center, price: { hufPerLitre: 600 } };
    let selected;
    const onSelect = id => { selected = id; };
    setupMap(element, onSelect, 'online');
    updateMap([station], null, center, onSelect);
    assert.equal(views.length, 2);
    assert.equal(views[1][1], 11);
    panMapTo(station);
    updateMap([station], station.id, { ...center }, onSelect);
    assert.equal(views.length, 2, 'filtering/favourites must not snap the map back');
    assert.equal(tileURL, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    assert.match(attribution, /openstreetmap.org\/copyright/);
    handlers.tileerror(); handlers.tileerror(); handlers.tileerror();
    assert.ok(removed);
    assert.match(element.innerHTML, /Map tiles unavailable/);
    assert.equal(layer.pins.length, 1);
    assert.match(layer.pins[0].title, /demo/);
    layer.pins[0].click();
    assert.equal(selected, station.id);
  } finally {
    destroyMap();
    delete globalThis.window;
    delete globalThis.document;
  }
});
