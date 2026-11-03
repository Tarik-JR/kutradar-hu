# Replacing the demonstration prices

Current version deliberately contains **no production data ingestion**.

1. `src/data/stations.js` creates fictitious stations near 20 Hungarian city centres.
2. `src/data/mock-prices.js` creates deterministic hypothetical prices and simulated update ages.
3. `src/data/provider.js` implements the adapter used by the UI.
4. The app calls `listStations()` and `listPrices()` and joins them by `stationId`.

## Future data schema

```js
const station = {
  id: 'provider-stable-id', cityId: 'budapest', city: 'Budapest',
  brand: 'mol', name: 'Official station name', address: 'Official address',
  lat: 47.49, lon: 19.04, demo: false,
};
const price = {
  stationId: 'provider-stable-id', fuelId: 'petrol95',
  hufPerLitre: 600, ageHours: 1, source: 'licensed-operator-or-api',
};
```

Real ingestion must also store an **observedAt timestamp**, source URL or license, terms of use, collection status and provenance. In production, calculate freshness from timestamps rather than synthetic `ageHours`. Never replace absent prices with fabricated prices, and do not silently mix mock and real records. Avoid scraping sites that prohibit automated reuse. Do not display prices as live without verification.

## Current limitations

- Example station coordinates are made up; not suitable for turn-by-turn navigation.
- Trip cost uses straight-line distance times a road factor, *not* routing.
- The map tiles and Leaflet library load from external CDNs; fallback map works when unavailable.
- Favourites and settings use the browser's localStorage; no accounts or synchronisation.
- Offline availability of third-party basemap tiles is not guaranteed.
- No database, authentication, alerts, history or real price provider yet.
