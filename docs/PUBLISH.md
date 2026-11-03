# Putting KútRadar HU on GitHub

The `.bundle` archive distributed with this prototype preserves all 20 Git commits, including their intentionally synthetic dates. Do not present this timeline as actual months of prior development. The initial identity is a placeholder; change your Git identity for new work.

## Clone from the bundle

```bash
git clone kutradar-hu.bundle kutradar-hu
cd kutradar-hu
git log --oneline --reverse
npm test
npm run dev
```

In GitHub, create a **new empty repository** (without README or template), then push:

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/kutradar-hu.git
git branch -M main
git push -u origin main
```

The history attribution dates/identity are synthetic (see HISTORY.md). Preserve that notice if publishing this history. Never amend or rewrite Plein's upstream history as if it were your own; this is an independently authored prototype.

## Deploying

GitHub Pages can serve this static app straight from `main` / root. If GitHub Pages requires a deployment workflow for your configuration, point a static-site deploy action at the repository root (`index.html`). No build step is necessary.

The external Leaflet script and CARTO tile servers need internet connectivity for a full interactive base map; the built-in simplified demo map still shows station pins if they are unavailable.
