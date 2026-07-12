/** Estimates only: a straight-line distance cannot determine an actual drive. */
export const ROAD_FACTOR = 1.3;
export function fillCost(hufPerLitre, litres = 40) {
  return hufPerLitre * litres;
}
export function estimatedDetourKm(oneWayCrowFlightKm) {
  return oneWayCrowFlightKm * 2 * ROAD_FACTOR;
}
export function estimatedTripCost(price, distance, litres, consumptionPer100Km = 7) {
  if (![price, distance, litres, consumptionPer100Km].every(Number.isFinite)) return Infinity;
  if (price < 0 || distance < 0 || litres <= 0 || consumptionPer100Km < 0) return Infinity;
  const detourLitres = estimatedDetourKm(distance) * consumptionPer100Km / 100;
  return Math.round((litres + detourLitres) * price);
}
export function estimatedSavings(benchmark, alternative, litres) {
  if (![benchmark, alternative, litres].every(Number.isFinite)) return 0;
  return Math.round((benchmark - alternative) * litres);
}
