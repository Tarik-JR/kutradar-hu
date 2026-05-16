/** Approximate city centers, used exclusively to seed synthetic map records. */
export const CITIES = Object.freeze([
  { id: 'budapest', name: 'Budapest', lat: 47.4979, lon: 19.0402, count: 14 },
  { id: 'debrecen', name: 'Debrecen', lat: 47.5316, lon: 21.6273, count: 6 },
  { id: 'szeged', name: 'Szeged', lat: 46.2530, lon: 20.1414, count: 6 },
  { id: 'miskolc', name: 'Miskolc', lat: 48.1035, lon: 20.7784, count: 5 },
  { id: 'pecs', name: 'Pécs', lat: 46.0727, lon: 18.2323, count: 6 },
  { id: 'gyor', name: 'Győr', lat: 47.6875, lon: 17.6504, count: 6 },
  { id: 'nyiregyhaza', name: 'Nyíregyháza', lat: 47.9554, lon: 21.7167, count: 4 },
  { id: 'kecskemet', name: 'Kecskemét', lat: 46.9062, lon: 19.6913, count: 5 },
  { id: 'szekesfehervar', name: 'Székesfehérvár', lat: 47.1860, lon: 18.4221, count: 5 },
  { id: 'szombathely', name: 'Szombathely', lat: 47.2307, lon: 16.6218, count: 4 },
  { id: 'sopron', name: 'Sopron', lat: 47.6817, lon: 16.5845, count: 4 },
  { id: 'veszprem', name: 'Veszprém', lat: 47.0930, lon: 17.9115, count: 4 },
  { id: 'kaposvar', name: 'Kaposvár', lat: 46.3594, lon: 17.7968, count: 4 },
  { id: 'eger', name: 'Eger', lat: 47.9025, lon: 20.3772, count: 4 },
  { id: 'bekescsaba', name: 'Békéscsaba', lat: 46.6736, lon: 21.0877, count: 4 },
  { id: 'zalaegerszeg', name: 'Zalaegerszeg', lat: 46.8417, lon: 16.8416, count: 4 },
  { id: 'dunaujvaros', name: 'Dunaújváros', lat: 46.9619, lon: 18.9355, count: 5 },
  { id: 'tatabanya', name: 'Tatabánya', lat: 47.5862, lon: 18.3949, count: 4 },
  { id: 'szolnok', name: 'Szolnok', lat: 47.1733, lon: 20.1946, count: 4 },
  { id: 'vac', name: 'Vác', lat: 47.7759, lon: 19.1361, count: 3 },
]);
export const DEFAULT_CITY = CITIES[0];
export const findCity = (id) => CITIES.find(city => city.id === id) || DEFAULT_CITY;
