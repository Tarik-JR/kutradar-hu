import { CITIES } from '../data/cities.js';
import { FUELS } from '../data/fuels.js';
import { BRANDS } from '../data/brands.js';
import { escapeHtml } from '../lib/format.js';
import { t } from '../lib/i18n.js';

/** Keep native controls in step with normalized input and GPS-based searches. */
export function syncControls(root, state) {
  for (const [id, value] of [['litres', state.litres], ['consumption', state.consumption]]) {
    const input = root.getElementById(id);
    if (input && input.value !== String(value)) input.value = String(value);
  }
  const city = root.getElementById('city');
  if (city) city.value = state.center?.name ? state.city : '';
  root.querySelectorAll('[data-fuel]').forEach(button => {
    const active = button.dataset.fuel === state.fuel;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

export function renderLayout(state) {
  const { lang, city, fuel, radiusKm, brand, sort, onlyFresh, favouritesOnly, litres, consumption } = state;
  const options = (items, current, label) => items.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === current ? 'selected' : ''}>${escapeHtml(item[label] || item.name)}</option>`).join('');
  return `<div class="app-shell ${state.mobileTab === 'map' ? 'show-map' : ''}">
    <header class="app-header">
      <div class="brand-area">
        <div class="brand-symbol" aria-hidden="true"><svg viewBox="0 0 42 42" fill="none"><path d="M13 9h13v28H13V9Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M11 16h17M17 30h5M28 17h4a4 4 0 0 1 4 4v10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></div>
        <div><div class="app-brand-name">KútRadar <span>HU</span></div><div class="app-tagline">${t('tagline', lang)}</div></div>
      </div>
      <div class="header-actions">
        <div class="demo-pill"><span class="demo-dot"></span>${t('demo', lang)}</div>
        <select class="language-select" id="language" aria-label="${t('language', lang)}"><option value="hu" ${lang === 'hu' ? 'selected' : ''}>HU</option><option value="en" ${lang === 'en' ? 'selected' : ''}>EN</option></select>
        <button class="icon-button" data-action="theme" title="${lang === 'hu' ? 'Téma váltása' : 'Toggle theme'}" aria-label="${lang === 'hu' ? 'Téma váltása' : 'Toggle theme'}">☼</button>
      </div>
    </header>

    <aside class="side-panel" id="side-panel">
      <div class="side-panel-content">
        <div class="section-intro"><div class="eyebrow"><span class="live-decoration"></span> MAGYARORSZÁG / HUNGARY</div><h1>${t('resultTitle', lang)}</h1><p>${t('disclaimerShort', lang)}</p></div>
        <label class="search-wrap"><span class="search-icon">⌕</span><input id="search" type="search" autocomplete="off" value="${escapeHtml(state.search)}" placeholder="${t('searchPlaceholder', lang)}" aria-label="${t('searchPlaceholder', lang)}"/><kbd>/</kbd></label>
        <div class="form-row two-cols city-row">
          <label class="field"><span>${t('chooseCity', lang)}</span><select id="city"><option value="" disabled ${!state.center?.name ? 'selected' : ''}>${t('myLocation', lang)}</option>${options(CITIES, city, 'name')}</select></label>
          <button class="locate-button" data-action="locate" title="${t('locate', lang)}"><span class="locate-crosshair">⌖</span><span>${t('myLocation', lang)}</span></button>
        </div>
        <div class="control-divider"></div>
        <div class="field fuel-field" role="group" aria-label="${t('fuel', lang)}"><span>${t('fuel', lang)}</span><div class="fuel-choices">${FUELS.map(f => `<button type="button" data-fuel="${f.id}" class="fuel-option ${fuel === f.id ? 'active' : ''}" aria-pressed="${fuel === f.id}">${escapeHtml(lang === 'hu' ? f.hu : f.en)}</button>`).join('')}</div></div>
        <div class="form-row two-cols second-fields">
          <label class="field"><span>${t('radius', lang)}</span><select id="radius">${[10, 25, 50, 100, 250].map(r => `<option value="${r}" ${radiusKm === r ? 'selected' : ''}>${r} km</option>`).join('')}</select></label>
          <label class="field"><span>${t('brand', lang)}</span><select id="brand"><option value="all">${t('allBrands', lang)}</option>${options(BRANDS, brand, 'label')}</select></label>
        </div>
        <label class="field sort-field"><span>${t('order', lang)}</span><select id="sort"><option value="price" ${sort === 'price' ? 'selected' : ''}>${t('price', lang)}</option><option value="distance" ${sort === 'distance' ? 'selected' : ''}>${t('distance', lang)}</option><option value="total" ${sort === 'total' ? 'selected' : ''}>${t('total', lang)}</option></select></label>
        <div class="check-row"><label class="check-label"><input type="checkbox" id="fresh" ${onlyFresh ? 'checked' : ''}/><span>${t('fresh', lang)}</span></label><label class="check-label"><input type="checkbox" id="favouritesOnly" ${favouritesOnly ? 'checked' : ''}/><span>${t('favouritesOnly', lang)}</span></label></div>
        <details class="preferences"><summary>${t('settings', lang)} <span>⌄</span></summary><div class="preference-fields"><label class="field"><span>${t('fillAmount', lang)} (${t('litres', lang)})</span><input id="litres" type="number" min="5" max="120" step="5" value="${litres}" /></label><label class="field"><span>${t('consumption', lang)} (${t('l100', lang)})</span><input id="consumption" type="number" min="0" max="30" step="0.5" value="${consumption}" /></label></div><small>${t('tripDisclaimer', lang)}</small></details>
        <div id="stats" class="stats-row" aria-live="polite"></div>
        <div class="result-head"><h2 id="result-heading">${t('resultTitle', lang)}</h2><span id="result-count"></span></div>
        <div class="station-results" id="station-results" aria-live="polite"></div>
      </div>
      <footer class="panel-footer"><span>© 2026 KútRadar HU</span><a href="https://github.com/aslafy-z/plein" target="_blank" rel="noopener noreferrer">Inspired by Plein ↗</a></footer>
    </aside>

    <main class="map-panel" aria-label="${t('map', lang)}">
      <div class="map-canvas" id="map"></div>
      <div class="map-banner"><div><strong>● ${t('demo', lang)}</strong><span>${t('demoDescription', lang)}</span></div><button class="banner-dismiss" data-action="dismiss-banner" title="${t('close', lang)}">×</button></div>
      <div class="map-toolbar"><button data-action="share" class="toolbar-button">↗ <span>${t('share', lang)}</span></button><button data-action="map-mode" class="toolbar-button">${t(state.mapMode === 'online' ? 'demoMap' : 'onlineMap', lang)}</button><div class="toolbar-location">⌖ <strong id="location-name">${escapeHtml(CITIES.find(c => c.id === city)?.name || 'Budapest')}</strong></div></div>
      <div id="detail-panel" class="detail-panel" hidden></div>
      <div class="bottom-map-legend"><span class="legend-bullet"></span>${t('sourceMock', lang)} · ${t('demoShort', lang)}</div>
    </main>
    <nav class="mobile-tabs" aria-label="View"><button data-tab="list" class="${state.mobileTab === 'list' ? 'active' : ''}">☷ ${t('list', lang)}</button><button data-tab="map" class="${state.mobileTab === 'map' ? 'active' : ''}">◎ ${t('map', lang)}</button></nav>
    <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
  </div>`;
}
