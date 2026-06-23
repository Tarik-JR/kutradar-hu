import { STATIONS } from './stations.js';
import { MOCK_PRICES } from './mock-prices.js';

/**
 * Data provider interface. A future API provider should implement listStations(),
 * listPrices(), getStation(id), without changing UI components.
 * Currency: HUF/litre. Coordinates: WGS84 latitude/longitude.
 * Prices can be absent; never invent a missing live price.
 */
export const mockProvider = Object.freeze({
  kind: 'mock',
  async listStations() { return STATIONS; },
  async listPrices() { return MOCK_PRICES; },
  async getStation(id) { return STATIONS.find(station => station.id === id) || null; },
});

/** Explicit selection keeps mock data isolated from future authorized sources. */
export const provider = mockProvider;

export function attachPrices(stations, prices) {
  const byStation = new Map();
  for (const price of prices) {
    if (!byStation.has(price.stationId)) byStation.set(price.stationId, {});
    byStation.get(price.stationId)[price.fuelId] = price;
  }
  return stations.map(station => ({ ...station, prices: byStation.get(station.id) || {} }));
}
