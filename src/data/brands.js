/** These brands are examples only; the demo does not identify real station sites. */
export const BRANDS = Object.freeze([
  { id: 'mol', label: 'MOL', color: '#e1251b' },
  { id: 'shell', label: 'Shell', color: '#efb920' },
  { id: 'omv', label: 'OMV', color: '#1977b9' },
  { id: 'orlen', label: 'ORLEN', color: '#cb2031' },
  { id: 'auchan', label: 'Auchan', color: '#12a354' },
  { id: 'envi', label: 'ENVI', color: '#78a83b' },
]);
export const getBrand = id => BRANDS.find(b => b.id === id) || BRANDS[0];
