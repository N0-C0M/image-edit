# AERO Icon Atlas

`site/` contains the static browser for the repository icon library.

## Features

- global search by icon name;
- pack browser with visual previews;
- family filters;
- semantic category filters;
- style filters;
- pack search and sorting;
- lazy icon loading;
- dark/light theme;
- icon detail dialog with path, ID, author and license;
- copy path / copy ID actions;
- URL deep-linking to packs with `?pack=<family:prefix>`.

The site is generated from the repository manifests and does not maintain a second manual icon database.

## Build locally

```bash
node scripts/build-pages-data.mjs .pages-dist
python -m http.server 8080 -d .pages-dist
```

Then open `http://localhost:8080`.

## Why the site uses generated indexes

Loading hundreds of thousands of standalone SVG files into one browser page would be slow and wasteful. The build step creates:

- a compact catalog;
- per-pack JSON indexes;
- search shards;
- reusable SVG sprite packs;
- taxonomy metadata.

The UI fetches only what the current search or selected pack needs.

## GitHub Pages publishing

The repository workflow `.github/workflows/deploy-pages.yml` publishes the generated static site to the `gh-pages` branch.

Because repository administration is not available to the automation connection, the first-time Pages source may need to be selected manually:

1. Open repository **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch `gh-pages` and folder `/ (root)`.
5. Save.

After this one-time setting, future site rebuilds are automatically published to `gh-pages`.

## Performance targets

- Do not publish the entire source repository as the site.
- Keep the generated Pages payload below GitHub Pages repository/site limits.
- Reuse source SVG sprites between generated variants where possible.
- Keep search sharded so the browser never downloads the entire search index for one query.
- Keep pack JSON independent so browsing one pack does not load every icon record.

## Source of truth

- taxonomy: `catalog/taxonomy.json`;
- icon metadata: `manifest*.jsonl`;
- source SVGs: `library*/`;
- web UI: `site/`;
- generated web data: `.pages-dist/` (CI artifact/worktree only).
