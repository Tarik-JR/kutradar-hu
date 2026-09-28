import { FUELS } from '../data/fuels.js';
import { getBrand } from '../data/brands.js';
import { escapeHtml, formatMoney, formatDistance, formatPrice } from '../lib/format.js';
import { t } from '../lib/i18n.js';

export function stationDetail(station, state) {
  const { lang, favourites, litres, consumption, fuel } = state;
  const brand = getBrand(station.brand);
  const liked = favourites.has(station.id);
  const rows = FUELS.map(type => {
    const p = station.prices[type.id];
    return `<div class="fuel-price-row ${fuel === type.id ? 'active' : ''}"><span>${escapeHtml(lang === 'hu' ? type.hu : type.en)}</span><strong>${p ? formatPrice(p.hufPerLitre, lang) : t('noPrice', lang)}</strong></div>`;
  }).join('');
  return `<div class="detail-inner"><div class="detail-handle"></div>
    <div class="detail-header"><div class="detail-brand" style="--brand:${brand.color}">${escapeHtml(brand.label)}</div><button class="icon-button detail-close" data-action="close-detail" aria-label="${t('close', lang)}">×</button></div>
    <h2>${escapeHtml(station.name)}</h2><p class="detail-address">⌖ ${escapeHtml(station.city)} · ${formatDistance(station.distance, lang)}</p>
    <div class="detail-hero"><div><small>${t('pricePerLitre', lang)}</small><strong>${formatPrice(station.price.hufPerLitre, lang)}</strong></div><span class="detail-demo-label">${t('demo', lang)}</span></div>
    <div class="fuel-price-table">${rows}</div>
    <div class="detail-estimate"><div><span>${t('fillCost', lang)} (${litres} L)</span><strong>${formatMoney(station.price.hufPerLitre * litres, lang)}</strong></div><div><span>${t('tripCost', lang)} *</span><strong>${formatMoney(station.totalCost, lang)}</strong></div></div>
    <p class="detail-warning">* ${t('tripDisclaimer', lang)}</p>
    <div class="detail-actions"><button data-favourite="${station.id}" class="detail-secondary">${liked ? '♥' : '♡'} ${t(liked ? 'unfavourite' : 'favourite', lang)}</button><button class="detail-primary" data-action="navigate" data-target="${station.id}">↗ ${t('navigate', lang)}</button></div>
    <p class="detail-source">${t('source', lang)}: ${t('sourceMock', lang)} · ${t('updated', lang)}: ${station.price.ageHours} h</p>
  </div>`;
}
