# KútRadar HU

A mobile-friendly fuel station map for Hungary, **using fictional station records and simulated fuel prices**. No live station prices or scraping are included.

Inspired by the UX of [Plein](https://github.com/aslafy-z/plein), an MIT-licensed fuel-price PWA by Zadkiel Aharonian. **This repository is an independent implementation, not a fork or a copy of Plein's source code.** The original source could not be downloaded in the environment where this prototype was authored.

> **Demo only.** Every price is generated test data. Every station and coordinate is illustrative. Never rely on it for purchases or navigation.

## Features

- 20 cities and 6 example brands, with fictional site coordinates
- Synthetic price records for petrol 95/100, diesel, premium diesel and LPG
- Compare by price, crow-flight distance, or estimated refuelling + detour cost
- Map markers, station detail panel, favourites, brand / radius / age filters
- Hungarian and English interface, light/dark theme, responsive mobile layout
- Shareable filters (without sharing your GPS location), basic installable PWA
- Optional Leaflet/CARTO map; a stylised fallback view works without the CDN

## Run locally

Requires Node.js 22 or newer. **No installation or npm dependencies needed.**

```bash
npm run dev
# open http://127.0.0.1:5173
```

Alternatively run `python3 -m http.server 5173` from the project directory.

Run tests: `npm test`.

To publish on GitHub Pages, upload the entire repository as a GitHub project and enable Pages from the root of its main branch. Paths are relative, so a project subpath works. The source is standard browser JavaScript modules.

## Architecture

- `src/data` — city list, brands, fuels, synthetic stations/prices, replaceable provider
- `src/lib` — pure calculations, filters, translations and local browser persistence
- `src/ui` — reusable map, layout, cards, station details
- `src/app.js` — app state and event wiring
- `tests` — Node built-in unit tests, no external packages

See [data integration guide](docs/DATA_PROVIDER.md) and [Git history note](docs/HISTORY.md).

## License and acknowledgements

KútRadar demo code is MIT-licensed. Design inspiration: [Plein](https://github.com/aslafy-z/plein) © Zadkiel Aharonian (MIT). Plein code has **not** been copied into this independent prototype. This product is not associated with any fuel retailer. Brand names are used as examples only.

## Publishing

The history is provided in a `.bundle` file so the incremental commits survive transport. Follow the [GitHub publishing guide](docs/PUBLISH.md). The dates are intentionally synthetic, not a record of work actually performed over six months.
