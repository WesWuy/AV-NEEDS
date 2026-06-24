# AVIXA Discovery Instrument

A single-page, fully static web app for AV systems integrators to run **client
discovery / needs analysis** in the room: capture requirements, compute
standards-based recommendations live, and export a professional needs-analysis
package. No backend, no database, no auth — all state lives in `localStorage`
and every output is generated client-side.

> ⚠️ **Standards integrity.** Outputs are *indicative* per the cited AVIXA
> standard + revision. They are **not** a stamped engineering design and not a
> substitute for AVIXA's official calculators or the published standards. Every
> numeric constant lives in [`src/standards/standardsConfig.ts`](src/standards/standardsConfig.ts)
> with `// VERIFY:` markers — confirm each against the current revision before
> relying on a recommendation.

## What it does (v1)

- **Project → many Spaces** data model with autosave to `localStorage`.
- **Room-type templates** (huddle, small/medium/large conf, training, town hall,
  lecture, signage) that pre-fill sensible, fully-editable baselines.
- **Full needs-analysis question set** organized by the PROGRAM-phase intent of
  ANSI/AVIXA D401.01:2023, in plain language to read aloud to stakeholders.
- **Live DISCAS (ANSI/AVIXA V202.01:2016)** image-size calculation — both
  Basic (BDM, %EH driven) and Analytical (ADM, resolution + 1-arcminute acuity)
  categories, plus closest-viewer geometric bound and mounting sanity.
- **Live flags** for ambient-light/contrast (V201.01), audio adequacy
  (A104.01 / A102.01), and an infrastructure power/heat/rack estimate
  (F502.01 / S601.01), each carrying its standard citation.
- **Exports:** Program Report (**PDF** + **Markdown**, with a client sign-off
  block), Infrastructure/BOM skeleton (**Markdown** + **CSV**), and full
  **JSON** project export/import for reload & version control.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the built dist/
```

## Deploy to GitHub Pages

The app uses a **relative base** (`base: './'` in
[`vite.config.ts`](vite.config.ts)) and is **single-view (no client router)**,
so it works from any Pages subpath (`https://<user>.github.io/<repo>/`) with no
404 issues. A `public/404.html` safety net is included.

1. Push this repo to GitHub.
2. In the repo: **Settings → Pages → Build and deployment → Source =
   GitHub Actions**.
3. Push to `main` (or `master`). The workflow in
   [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and
   publishes `dist/` to Pages automatically.

## Offline reliability

No external API calls, fonts, or CDNs are required to function. The PDF library
(jsPDF) is bundled locally. The tool works fully offline once loaded.

## Verifying / editing the standards math

All perception/geometry/planning constants are centralized and commented in
[`src/standards/standardsConfig.ts`](src/standards/standardsConfig.ts):

- Genuine physical constants (e.g. 1-arcminute visual acuity, W→BTU/hr) are
  noted as such.
- Operator-editable approximations are marked `// VERIFY:` — edit them to match
  the current published standard and cross-check against AVIXA's free official
  DISCAS calculator (the source of truth for the image-size math).

## Roadmap

- **v1 (this release):** data model, templates, question set, DISCAS (BDM+ADM),
  Program Report (MD+PDF), localStorage save/resume, Pages deploy. *(Audio /
  contrast flags, BOM/CSV, and the infra estimator are also included.)*
- **v2:** deeper audio coverage modeling, richer contrast targets.
- **v3:** multi-project library, branding/letterhead, J-STD-710 symbol notes.
