import { CITIES, DEFAULT_CITY, findCity } from './data/cities.js';
import { FUELS } from './data/fuels.js';
import { BRANDS } from './data/brands.js';
import { provider, attachPrices } from './data/provider.js';
import { filterStations } from './lib/filter.js';
import { distanceKm, locationInHungary } from './lib/geo.js';
import { finiteInRange } from './lib/format.js';
import { readSettings, saveSettings, readFavourites, saveFavourites, toggleFavourite } from './lib/storage.js';
import { renderLayout, syncControls } from './ui/layout.js';
import { stationCard, statsTemplate, emptyTemplate } from './ui/cards.js';
import { stationDetail } from './ui/detail.js';
import { setupMap, updateMap, panMapTo, resizeMap, destroyMap } from './ui/map.js';
import { t } from './lib/i18n.js';

const stored = readSettings();
const params = new URLSearchParams(window.location.search);
const validCity = id => CITIES.some(c => c.id === id) ? id : DEFAULT_CITY.id;
const validFuel = id => FUELS.some(f => f.id === id) ? id : 'petrol95';
const validBrand = id => BRANDS.some(b => b.id === id) ? id : 'all';
const validSort = id => ['price', 'distance', 'total'].includes(id) ? id : 'price';
const validRadius = value => [10, 25, 50, 100, 250].includes(Number(value)) ? Number(value) : 25;

const state = {
  lang: stored.lang === 'en' ? 'en' : 'hu',
  theme: stored.theme === 'dark' ? 'dark' : 'light',
  city: validCity(params.get('city') || stored.city),
  center: null,
  fuel: validFuel(params.get('fuel') || stored.fuel),
  brand: validBrand(params.get('brand') || stored.brand),
  radiusKm: validRadius(params.get('radius') || stored.radiusKm),
  sort: validSort(params.get('sort') || stored.sort),
  search: '',
  onlyFresh: false,
  favouritesOnly: false,
  favourites: readFavourites(),
  litres: finiteInRange(stored.litres ?? 40, 5, 120, 40),
  consumption: finiteInRange(stored.consumption ?? 7, 0, 30, 7),
  selectedId: null,
  mobileTab: 'list',
  bannerDismissed: false,
  mapMode: stored.mapMode === 'online' ? 'online' : 'demo',
};
state.center = findCity(state.city);
let stations = [];
let visible = [];
let toastTimeout = null;

const $ = selector => document.querySelector(selector);
const settings = () => Object.fromEntries(['lang','theme','city','fuel','brand','radiusKm','sort','litres','consumption','mapMode'].map(k => [k, state[k]]));
function persist() { saveSettings(settings()); }
function showToast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => { node.hidden = true; }, 2600);
}

function refresh() {
  visible = filterStations(stations, state);
  syncControls(document, state);
  const results = $('#station-results');
  if (!results) return;
  results.innerHTML = visible.length ? visible.map((s, i) => stationCard(s, state, i)).join('') : emptyTemplate(state.lang);
  $('#stats').innerHTML = statsTemplate(visible, state);
  $('#result-count').textContent = `${visible.length} ${t('resultsCount', state.lang)}`;
  const locationName = $('#location-name');
  if (locationName) locationName.textContent = state.center?.name || t('myLocation', state.lang);
  if (state.selectedId && !visible.some(s => s.id === state.selectedId)) state.selectedId = null;
  updateMap(visible, state.selectedId, state.center, selectStation);
  updateDetail();
}

function updateDetail() {
  const panel = $('#detail-panel');
  const station = visible.find(s => s.id === state.selectedId);
  if (!panel) return;
  panel.hidden = !station;
  panel.innerHTML = station ? stationDetail(station, state) : '';
  if (station) {
    const selectedCard = document.querySelector(`[data-station="${station.id}"]`);
    if (selectedCard) selectedCard.classList.add('selected');
  }
}

function selectStation(id) {
  state.selectedId = id;
  refresh();
  const station = visible.find(s => s.id === id);
  if (station) {
    panMapTo(station);
    if (window.innerWidth <= 800) {
      state.mobileTab = 'map';
      $('.app-shell')?.classList.add('show-map');
      document.querySelectorAll('[data-tab]').forEach(el => el.classList.toggle('active', el.dataset.tab === 'map'));
      resizeMap();
    }
  }
}

function build() {
  destroyMap();
  document.documentElement.lang = state.lang;
  document.documentElement.dataset.theme = state.theme;
  $('#app').innerHTML = renderLayout(state);
  setupMap($('#map'), selectStation, state.mapMode);
  if (state.bannerDismissed) $('.map-banner').hidden = true;
  refresh();
}

function changeField(id, value) {
  switch (id) {
    case 'city':
      state.city = validCity(value);
      state.center = findCity(state.city);
      state.selectedId = null;
      break;
    case 'radius': state.radiusKm = validRadius(value); break;
    case 'brand': state.brand = validBrand(value); break;
    case 'sort': state.sort = validSort(value); break;
    case 'fresh': state.onlyFresh = Boolean(value); break;
    case 'favouritesOnly': state.favouritesOnly = Boolean(value); break;
    case 'litres': state.litres = finiteInRange(value, 5, 120, 40); break;
    case 'consumption': state.consumption = finiteInRange(value, 0, 30, 7); break;
    default: return;
  }
  persist();
  refresh();
}

function locate() {
  if (!navigator.geolocation) return showToast(t('locationUnavailable', state.lang));
  navigator.geolocation.getCurrentPosition(position => {
    const center = { lat: position.coords.latitude, lon: position.coords.longitude };
    if (!locationInHungary(center)) return showToast(t('locationUnavailable', state.lang));
    state.center = center;
    state.city = CITIES.reduce((a, b) => distanceKm(a, center) < distanceKm(b, center) ? a : b).id;
    state.selectedId = null;
    refresh();
  }, () => showToast(t('locationUnavailable', state.lang)), { enableHighAccuracy: false, timeout: 12000, maximumAge: 120000 });
}

function shareView() {
  const url = new URL(window.location.href);
  url.search = new URLSearchParams({ city: state.city, fuel: state.fuel, brand: state.brand,
    radius: String(state.radiusKm), sort: state.sort }).toString();
  // Never share exact geolocation or private favourites.
  const text = url.toString();
  if (!navigator.clipboard?.writeText) return window.prompt('Copy link', text);
  navigator.clipboard.writeText(text).then(() => showToast(t('copied', state.lang)), () => showToast(t('linkFailed', state.lang)));
}

function handleAction(element) {
  const action = element.dataset.action;
  switch (action) {
    case 'map-mode': state.mapMode = state.mapMode === 'demo' ? 'online' : 'demo'; persist(); build(); break;
    case 'locate': locate(); break;
    case 'theme': state.theme = state.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = state.theme; persist(); break;
    case 'share': shareView(); break;
    case 'dismiss-banner': state.bannerDismissed = true; $('.map-banner').hidden = true; break;
    case 'close-detail': selectStation(null); break;
    case 'navigate': {
      const s = visible.find(st => st.id === element.dataset.target);
      if (!s) return;
      // Locations are fictional. An explicit warning precedes opening navigation.
      if (window.confirm(state.lang === 'hu' ? 'Ez egy kitalált pont, nem valódi benzinkút. Megnyitod a térképen?' : 'This is a fictional point, not a real petrol station. Open it on a map?')) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.lat},${s.lon}`)}`, '_blank', 'noopener,noreferrer');
      }
      break;
    }
    default: break;
  }
}

function bindInteractions() {
  const root = $('#app');
  root.addEventListener('input', event => {
    const el = event.target;
    if (el.id === 'search') { state.search = el.value.slice(0, 100); refresh(); }
  });
  root.addEventListener('change', event => {
    const el = event.target;
    if (el.id === 'language') { state.lang = el.value === 'en' ? 'en' : 'hu'; persist(); build(); return; }
    if (el.id === 'search') return;
    changeField(el.id, el.type === 'checkbox' ? el.checked : el.value);
  });
  root.addEventListener('click', event => {
    const el = event.target.closest('button,[data-station]');
    if (!el) return;
    if (el.dataset.favourite) {
      state.favourites = toggleFavourite(state.favourites, el.dataset.favourite);
      saveFavourites(state.favourites);
      refresh();
      return;
    }
    if (el.dataset.fuel) {
      state.fuel = validFuel(el.dataset.fuel);
      persist();
      refresh();
      return;
    }
    if (el.dataset.tab) {
      state.mobileTab = el.dataset.tab;
      $('.app-shell').classList.toggle('show-map', state.mobileTab === 'map');
      root.querySelectorAll('[data-tab]').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === state.mobileTab));
      resizeMap();
      return;
    }
    if (el.dataset.action) return handleAction(el);
    if (el.dataset.station) selectStation(el.dataset.station);
  });
  root.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.dataset.station) {
      event.preventDefault(); selectStation(event.target.dataset.station);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !document.activeElement?.matches('input,select,textarea,[contenteditable="true"]')) { event.preventDefault(); $('#search')?.focus(); }
    if (event.key === 'Escape') { if (state.selectedId) selectStation(null); else $('#search')?.blur(); }
  });
}

async function main() {
  try {
    const [locations, prices] = await Promise.all([provider.listStations(), provider.listPrices()]);
    stations = attachPrices(locations, prices);
    build();
    bindInteractions();
    if ('serviceWorker' in navigator && window.isSecureContext) {
      const register = () => navigator.serviceWorker.register('./sw.js').catch(() => {});
      if (document.readyState === 'complete') register();
      else window.addEventListener('load', register, { once: true });
    }
  } catch (error) {
    console.error('KútRadar startup error', error);
    $('#app').textContent = state.lang === 'hu' ? 'Nem sikerült betölteni a demóadatokat.' : 'Failed to load demo data.';
  }
}
main();
