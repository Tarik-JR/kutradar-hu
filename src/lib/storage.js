const PREFIX = 'kutradar.v1.';
const safeRead = (key) => {
  try { return localStorage.getItem(PREFIX + key); } catch { return null; }
};
const safeWrite = (key, value) => {
  try { localStorage.setItem(PREFIX + key, value); } catch { /* private mode */ }
};
export function readSettings() {
  try {
    const saved = JSON.parse(safeRead('settings') || '{}');
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch { return {}; }
}
export function saveSettings(settings) { safeWrite('settings', JSON.stringify(settings)); }
export function readFavourites() {
  try {
    const entries = JSON.parse(safeRead('favourites') || '[]');
    return new Set(Array.isArray(entries) ? entries.filter(v => typeof v === 'string') : []);
  } catch { return new Set(); }
}
export function saveFavourites(set) { safeWrite('favourites', JSON.stringify([...set])); }
export function toggleFavourite(set, stationId) {
  const next = new Set(set);
  if (next.has(stationId)) next.delete(stationId);
  else next.add(stationId);
  return next;
}
