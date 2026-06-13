import { STATIONS } from './stations.js';
import { FUELS } from './fuels.js';

const BASE = Object.freeze({ petrol95: 584, diesel: 601, petrol100: 644, dieselPremium: 657, lpg: 329 });
/** Hashing a stable station/fuel key makes test prices repeatable across reloads. */
function seed(text) {
  let hash = 2166136261;
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return hash >>> 0;
}

/** Simulated values in HUF/litre; 'ageHours' is also simulated freshness. */
export function createDemoPrices() {
  const prices = [];
  for (const station of STATIONS) {
    for (const fuel of FUELS) {
      const key = `${station.id}:${fuel.id}`;
      const number = seed(key);
      if (fuel.id === 'lpg' && number % 4 !== 0) continue;
      if (fuel.id === 'dieselPremium' && number % 9 === 0) continue;
      const delta = ((number >>> 3) % 75) - 37;
      const brandOffset = { mol: 9, shell: 15, omv: 12, orlen: 2, auchan: -13, envi: -10 }[station.brand] || 0;
      prices.push(Object.freeze({
        stationId: station.id,
        fuelId: fuel.id,
        hufPerLitre: Math.max(250, BASE[fuel.id] + delta + brandOffset),
        ageHours: [2, 5, 11, 20, 29, 42, 71, 180][number % 8],
        source: 'mock',
      }));
    }
  }
  return Object.freeze(prices);
}
export const MOCK_PRICES = createDemoPrices();
