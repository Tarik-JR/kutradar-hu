import { CITIES } from './cities.js';
import { BRANDS } from './brands.js';

/** Repeatable synthetic station sites. Not real addresses, stations or locations. */
export function createDemoStations() {
  const stations = [];
  for (const city of CITIES) {
    for (let i = 0; i < city.count; i++) {
      const angle = (i * 2.399963229728653 + city.lat) % (Math.PI * 2);
      const radius = 0.007 + (i % 5) * 0.0065;
      const lat = +(city.lat + Math.sin(angle) * radius).toFixed(5);
      const lon = +(city.lon + Math.cos(angle) * radius * 1.43).toFixed(5);
      const brand = BRANDS[(i + city.name.length) % BRANDS.length];
      stations.push(Object.freeze({
        id: `demo-${city.id}-${i + 1}`,
        cityId: city.id,
        city: city.name,
        brand: brand.id,
        name: `${brand.label} · ${city.name} ${String(i + 1).padStart(2, '0')}`,
        address: `${city.name} — illustrative location`,
        lat, lon,
        demo: true,
        open24h: i % 3 !== 0,
      }));
    }
  }
  return Object.freeze(stations);
}
export const STATIONS = createDemoStations();
