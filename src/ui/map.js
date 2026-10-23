import { getBrand } from '../data/brands.js';
import { escapeHtml } from '../lib/format.js';

const OSM_ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
let mapInstance = null;
let markerLayer = null;
let currentMode = null;
let previousCenter = null;
let lastUpdate = null;

function setupFallback(element, unavailable = false) {
  currentMode = 'fallback';
  element.classList.add('map-fallback');
  element.innerHTML = `<div class="fake-map-grid"></div><div class="fake-map-hu">MAGYARORSZÁG</div><div class="fallback-pins" id="fallback-pins"></div><div class="fallback-credit">${unavailable ? 'Demo map · Map tiles unavailable' : 'Illustrative demo map · No live tiles'}</div>`;
}

/** Leaflet is optional: a static geography overview is shown if the CDN is unavailable. */
export function setupMap(element, onStationClick, mode = 'demo') {
  if (mode !== 'online' || typeof window.L === 'undefined') {
    setupFallback(element, mode === 'online');
    return;
  }
  currentMode = 'leaflet';
  mapInstance = window.L.map(element, { zoomControl: false, preferCanvas: true, scrollWheelZoom: false }).setView([47.15, 19.4], 7);
  window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
  const tiles = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: OSM_ATTRIBUTION, maxZoom: 19,
  }).addTo(mapInstance);
  let failures = 0;
  tiles.on('tileerror', () => {
    if (currentMode !== 'leaflet' || ++failures < 3) return;
    const update = lastUpdate;
    destroyMap();
    setupFallback(element, true);
    if (update) updateMap(...update);
  });
  markerLayer = window.L.layerGroup().addTo(mapInstance);
  mapInstance.on('click', () => onStationClick(null));
}

export function updateMap(stations, selectedId, center, onStationClick) {
  lastUpdate = [stations, selectedId, center, onStationClick];
  if (currentMode === 'fallback') {
    const layer = document.getElementById('fallback-pins');
    if (!layer) return;
    layer.innerHTML = '';
    // Spread nearby fictional stations across the illustrative view, keeping north up.
    const origin = center || { lat: 47.2, lon: 19.5 };
    const latSpan = Math.max(0.07, ...stations.map(s => Math.abs(s.lat - origin.lat) * 2.5));
    const lonSpan = Math.max(0.1, ...stations.map(s => Math.abs(s.lon - origin.lon) * 2.5));
    for (const s of stations.slice(0, 120)) {
      const pin = document.createElement('button');
      const x = 50 + ((s.lon - origin.lon) / lonSpan) * 100;
      const y = 50 - ((s.lat - origin.lat) / latSpan) * 100;
      pin.className = `fallback-pin ${s.id === selectedId ? 'is-selected' : ''}`;
      pin.style.left = `${Math.max(2, Math.min(98, x))}%`;
      pin.style.top = `${Math.max(2, Math.min(98, y))}%`;
      pin.style.background = getBrand(s.brand).color;
      pin.title = `${s.name}: ${s.price.hufPerLitre} Ft/l (demo)`;
      pin.setAttribute('aria-label', pin.title);
      pin.textContent = s.price.hufPerLitre;
      pin.addEventListener('click', () => onStationClick(s.id));
      layer.appendChild(pin);
    }
    return;
  }
  if (!mapInstance) return;
  markerLayer.clearLayers();
  for (const s of stations.slice(0, 150)) {
    const brand = getBrand(s.brand);
    const selected = s.id === selectedId;
    const pin = window.L.divIcon({
      className: 'station-leaflet-marker',
      html: `<div class="map-price-pin${selected ? ' is-selected' : ''}" style="--pin-color:${brand.color}" title="${escapeHtml(s.name)} (demo)"><small>${escapeHtml(brand.label)}</small><b>${s.price.hufPerLitre}</b></div>`,
      iconSize: [54, 43], iconAnchor: [27, 43],
    });
    window.L.marker([s.lat, s.lon], { icon: pin, title: `${s.name}: ${s.price.hufPerLitre} Ft/l (demo)`, alt: `${s.name} (demo)` }).addTo(markerLayer).on('click', () => onStationClick(s.id));
  }
  if (center && (!previousCenter || center.lat !== previousCenter.lat || center.lon !== previousCenter.lon)) {
    mapInstance.setView([center.lat, center.lon], 11, { animate: false });
    previousCenter = { lat: center.lat, lon: center.lon };
  }
}

export function panMapTo(station, zoom = 13) {
  if (currentMode !== 'leaflet' || !mapInstance || !station) return;
  mapInstance.flyTo([station.lat, station.lon], Math.max(zoom, mapInstance.getZoom()), { duration: 0.6 });
}

export function resizeMap() { if (mapInstance) setTimeout(() => mapInstance.invalidateSize(), 60); }

export function destroyMap() {
  if (mapInstance) { mapInstance.remove(); mapInstance = null; }
  markerLayer = null;
  currentMode = null;
  previousCenter = null;
  lastUpdate = null;
}
