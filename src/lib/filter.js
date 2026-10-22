import { distanceKm } from './geo.js';
import { estimatedTripCost } from './cost.js';

/** The query is local to the demo data and never sent to an external service. */
export function filterStations(stations, options = {}) {
  const { center, fuel = 'petrol95', radiusKm = 25, brand = 'all', search = '',
    sort = 'price', onlyFresh = false, favouritesOnly = false,
    favourites = new Set(), litres = 40, consumption = 7 } = options;
  const query = search.trim().toLocaleLowerCase('hu');
  const matches = stations.flatMap(station => {
    const price = station.prices?.[fuel];
    if (!price || !Number.isFinite(price.hufPerLitre) || price.hufPerLitre <= 0) return [];
    if (brand !== 'all' && station.brand !== brand) return [];
    if (onlyFresh && (!Number.isFinite(price.ageHours) || price.ageHours < 0 || price.ageHours >= 24)) return [];
    if (favouritesOnly && !favourites.has(station.id)) return [];
    if (query && !`${station.name} ${station.city} ${station.brand}`.toLocaleLowerCase('hu').includes(query)) return [];
    const distance = distanceKm(center, station);
    if (!Number.isFinite(distance) || distance > radiusKm) return [];
    return [{ ...station, price, distance, totalCost: estimatedTripCost(price.hufPerLitre, distance, litres, consumption) }];
  });
  const comparisons = {
    price: (a, b) => a.price.hufPerLitre - b.price.hufPerLitre,
    distance: (a, b) => a.distance - b.distance,
    total: (a, b) => a.totalCost - b.totalCost,
  };
  matches.sort((a, b) => (comparisons[sort] || comparisons.price)(a, b) || a.distance - b.distance);
  return matches;
}
