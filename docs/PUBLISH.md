# Putting KútRadar HU on GitHub

The imported baseline contains 20 Git commits with intentionally synthetic dates. Some subsequent changes also have synthetic dates. Do not present the original timeline as actual months of prior development.

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
# If the clone already has an origin, remove the local bundle remote first:
# git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/kutradar-hu.git
git branch -M main
git push -u origin main
```

The history attribution dates/identity are synthetic (see HISTORY.md). Preserve that notice if publishing this history.

## Deploying

The included `.github/workflows/pages.yml` deploys on pushes to `main` and supports manual runs. It runs `npm test`, executes the dependency-free `npm run build`, uploads only `dist/`, and deploys to the `github-pages` environment. Pull requests run tests and build without deploying.

1. Create an empty `kutradar-hu` repository under your account and push `main` without rebasing or squashing the imported history.
2. Enable **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Run **Actions → Deploy GitHub Pages → Run workflow** if the initial push happened before Pages was enabled.
4. Wait for both jobs to pass. Use the deployment URL reported by the workflow; normally it is `https://YOUR_USERNAME.github.io/kutradar-hu/`.

With GitHub CLI authenticated, the equivalent Pages setup is:

```bash
gh api --method POST repos/YOUR_USERNAME/kutradar-hu/pages -f build_type=workflow
gh workflow run pages.yml --repo YOUR_USERNAME/kutradar-hu --ref main
gh run list --repo YOUR_USERNAME/kutradar-hu --workflow pages.yml
```

If Pages is already enabled, inspect the existing configuration and use `PUT` to update `build_type` instead of creating a second Pages site. Pages availability depends on repository visibility and the account plan.

The build excludes Git metadata, development scripts and tests, while retaining `README.md`, `LICENSE` and `docs/` so attribution and the synthetic-history disclosure remain published. The PWA manifest resolves its start URL, scope and icon relative to its own `public/` location. App-shell requests prefer the network and use the cache offline; shared query-string links also work offline after the first successful visit. Cache cleanup is isolated to this application's deployment path.

The built-in illustrative demo map is the default and uses no map tiles. The toolbar's online-map switch enables the optional Leaflet/OpenStreetMap basemap. The online basemap needs internet connectivity and its provider may limit access; a demo-map switch remains available even if a provider returns an error image rather than a failed request. Repeated tile errors automatically restore the built-in map. Standard OSM tiles are used only for ordinary interactive viewing with normal browser caching, visible attribution and the browser's default referrer policy. There is no tile prefetching or offline map download. See the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
