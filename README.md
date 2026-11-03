# KútRadar HU

A mobile-friendly fuel station map for Hungary, **using fictional station records and simulated fuel prices**. No live station prices or scraping are included.


> **Demo only.** Every price is generated test data. Every station and coordinate is illustrative. Never rely on it for purchases or navigation.

## Features

- 20 cities and 6 example brands, with fictional site coordinates
- Synthetic price records for petrol 95/100, diesel, premium diesel and LPG
- Compare by price, crow-flight distance, or estimated refuelling + detour cost
- Map markers, station detail panel, favourites, brand / radius / age filters
- Hungarian and English interface, light/dark theme, responsive mobile layout
- Shareable filters (without sharing your GPS location), basic installable PWA
- Built-in illustrative demo map by default; optional Leaflet/OpenStreetMap basemap with a demo-map switch and automatic fallback on tile errors

## Run locally

Requires Node.js 22 or newer. **No installation or npm dependencies needed.**

```bash
npm run dev
# open http://127.0.0.1:5173
```

Alternatively run `python3 -m http.server 5173` from the project directory.

Run tests: `npm test`.

Build the publishable static app: `npm run build`. The dependency-free build writes `dist/`, including the license and historical-date disclosure, and gives the offline cache a content-based release identifier. All paths work at the domain root or a GitHub Pages project subpath.

The included GitHub Actions workflow runs tests, builds the site and deploys `dist/` on pushes to `main`. Enable **Settings → Pages → Source → GitHub Actions** once. See the [publishing guide](docs/PUBLISH.md).

## Architecture

- `src/data` — city list, brands, fuels, synthetic stations/prices, replaceable provider
- `src/lib` — pure calculations, filters, translations and local browser persistence
- `src/ui` — reusable map, layout, cards, station details
- `src/app.js` — app state and event wiring
- `tests` — Node built-in unit tests, no external packages

See [data integration guide](docs/DATA_PROVIDER.md) and [Git history note](docs/HISTORY.md).

## License and acknowledgements

KútRadar demo code is MIT-licensed. This product is not associated with any fuel retailer. Brand names are used as examples only.

## Publishing

The imported baseline has 20 commits with intentionally synthetic historical dates, not a record of work actually performed over six months. Some subsequent commits also have synthetic dates. Both a full repository archive (including `.git`) and a Git bundle preserve this history. Follow the [GitHub publishing guide](docs/PUBLISH.md).
