const RADIUS_KM = 6371.0088;
export function distanceKm(a, b) {
  if (!validCoordinates(a) || !validCoordinates(b)) return Infinity;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  const clamped = Math.min(1, Math.max(0, s));
  return 2 * RADIUS_KM * Math.atan2(Math.sqrt(clamped), Math.sqrt(1 - clamped));
}
export function validCoordinates(p) {
  return Number.isFinite(p?.lat) && Number.isFinite(p?.lon)
    && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180;
}
export function locationInHungary(p) {
  return validCoordinates(p) && p.lat >= 45.7 && p.lat <= 48.8 && p.lon >= 16 && p.lon <= 23;
}
