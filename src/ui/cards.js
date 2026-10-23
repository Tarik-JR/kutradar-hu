import { getBrand } from '../data/brands.js';
import { escapeHtml, formatDistance, formatMoney } from '../lib/format.js';
import { t } from '../lib/i18n.js';

export function freshnessLabel(ageHours, lang) {
  if (ageHours < 24) return `<span class="freshness fresh" title="${t('updated', lang)}">● ${t('freshNow', lang)}</span>`;
  if (ageHours <= 168) return `<span class="freshness recent" title="${t('updated', lang)}">● ${t('recent', lang)}</span>`;
  return `<span class="freshness old" title="${t('updated', lang)}">● ${t('old', lang)}</span>`;
}

export function stationCard(station, state, index) {
  const { lang, selectedId, favourites, sort, litres } = state;
  const brand = getBrand(station.brand);
  const liked = favourites.has(station.id);
  return `<article class="station-card ${station.id === selectedId ? 'selected' : ''}" data-station="${station.id}" role="button" tabindex="0" aria-label="${escapeHtml(station.name)}">
    <div class="station-card-top"><span class="station-rank">${String(index + 1).padStart(2, '0')}</span><span class="brand-chip" style="--brand:${brand.color}">${escapeHtml(brand.label)}</span><span class="station-demo">${t('demoShort', lang)}</span><button class="favourite-button ${liked ? 'is-liked' : ''}" data-favourite="${station.id}" title="${t(liked ? 'unfavourite' : 'favourite', lang)}" aria-label="${t(liked ? 'unfavourite' : 'favourite', lang)}">${liked ? '♥' : '♡'}</button></div>
    <div class="station-card-body"><div class="station-info"><h3>${escapeHtml(station.name)}</h3><p>⌖ ${escapeHtml(station.city)} · ${formatDistance(station.distance, lang)}</p></div><div class="station-price"><strong>${formatMoney(station.price.hufPerLitre, lang)}</strong><span>/ L</span></div></div>
    <div class="station-card-foot">${freshnessLabel(station.price.ageHours, lang)}<span>${sort === 'total' ? `${t('tripCost', lang)} ${formatMoney(station.totalCost, lang)}` : `${formatMoney(station.price.hufPerLitre * litres, lang)} / ${litres} L`}</span></div>
  </article>`;
}

export function statsTemplate(stations, state) {
  const values = stations.map(s => s.price.hufPerLitre);
  const low = values.length ? Math.min(...values) : null;
  const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
  return `<div class="stat"><div class="stat-label">${t('stations', state.lang)}</div><div class="stat-value">${stations.length}</div></div><div class="stat"><div class="stat-label">${t('lowest', state.lang)}</div><div class="stat-value">${low == null ? '—' : formatMoney(low, state.lang)}</div></div><div class="stat"><div class="stat-label">${t('average', state.lang)}</div><div class="stat-value">${avg == null ? '—' : formatMoney(avg, state.lang)}</div></div>`;
}

export function emptyTemplate(lang) {
  return `<div class="empty-state"><div class="empty-icon">⌕</div><h3>${t('emptyTitle', lang)}</h3><p>${t('emptyText', lang)}</p></div>`;
}
