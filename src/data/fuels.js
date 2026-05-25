/** Fuel identifiers are stable across mock and future live providers. */
export const FUELS = Object.freeze([
  { id: 'petrol95', hu: 'Benzin 95', en: 'Petrol 95', short: '95' },
  { id: 'diesel', hu: 'Gázolaj', en: 'Diesel', short: 'D' },
  { id: 'petrol100', hu: 'Prémium 100', en: 'Premium 100', short: '100' },
  { id: 'dieselPremium', hu: 'Prémium dízel', en: 'Premium diesel', short: 'D+' },
  { id: 'lpg', hu: 'Autógáz (LPG)', en: 'LPG', short: 'LPG' },
]);
export const DEFAULT_FUEL = 'petrol95';
export const findFuel = id => FUELS.find(f => f.id === id) || FUELS[0];
