export function formatMoney(value, lang = 'hu') {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(lang === 'hu' ? 'hu-HU' : 'en-US', { maximumFractionDigits: 0 }).format(value) + ' Ft';
}
export function formatPrice(value, lang = 'hu') {
  return formatMoney(value, lang) + (lang === 'hu' ? '/l' : '/L');
}
export function formatDistance(km, lang = 'hu') {
  if (!Number.isFinite(km)) return '—';
  return new Intl.NumberFormat(lang === 'hu' ? 'hu-HU' : 'en-US', { maximumFractionDigits: km < 10 ? 1 : 0 }).format(km) + ' km';
}
export function escapeHtml(input) {
  return String(input ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
}
export function finiteInRange(value, low, high, defaultValue) {
  if (!['number', 'string'].includes(typeof value) || (typeof value === 'string' && !value.trim())) return defaultValue;
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(high, Math.max(low, n)) : defaultValue;
}
