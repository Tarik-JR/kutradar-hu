import { getBrand } from '../data/brands.js';
import { escapeHtml } from '../lib/format.js';

const OSM_ATTRIBUTION = '© OpenStreetMap contributors · © CARTO';
let mapInstance = null;
let markerLayer = null;
let currentMode = null;

/** Leaflet is optional: a static geography overview is shown if the CDN is unavailable. */
export function setupMap(element, onStationClick) {
  if (typeof window.L === 'undefined') {
    currentMode = 'fallback';
    element.classList.add('map-fallback');
    element.innerHTML = `<div class="fake-map-grid"></div><div class="fake-map-hu">MAGYARORSZÁG</div><div class="fallback-pins" id="fallback-pins"></div><div class="fallback-credit">Demo map · Map tiles unavailable</div>`;
    return;
  }
  currentMode = 'leaflet';
  mapInstance = window.L.map(element, { zoomControl: false, preferCanvas: true, scrollWheelZoom: false }).setView([47.15, 19.4], 7);
  window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
  window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: OSM_ATTRIBUTION, subdomains: 'abcd', maxZoom: 19,
  }).addTo(mapInstance);
  markerLayer = window.L.layerGroup().addTo(mapInstance);
  mapInstance.on('click', () => onStationClick(null));
}

export function updateMap(stations, selectedId, center, onStationClick) {
  if (currentMode === 'fallback') {
    const layer = document.getElementById('fallback-pins');
    if (!layer) return;
    layer.innerHTML = '';
    for (const s of stations.slice(0, 120)) {
      const pin = document.createElement('button');
      const x = ((s.lon - 16.0) / 7.0) * 100;
      const y = ((48.7 - s.lat) / 3.1) * 100;
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
      html: `<div class="map-price-pin${selected ? ' is-selected' : ''}" style="--pin-color:${brand.color}" title="${escapeHtml(s.name)}"><small>${escapeHtml(brand.label)}</small><b>${s.price.hufPerLitre}</b></div>`,
      iconSize: [54, 43], iconAnchor: [27, 43],
    });
    window.L.marker([s.lat, s.lon], { icon: pin }).addTo(markerLayer).on('click', () => onStationClick(s.id));
  }
  if (center) mapInstance.panTo([center.lat, center.lon], { animate: true, duration: 0.35 });
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
}
