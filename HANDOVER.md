# Handover — AVIXA Discovery Instrument (AV-NEEDS)

This document hands the project over to the next developer/operator. It explains
what the app is, how it's built, how to run and deploy it, and — most
importantly — how to keep its standards math trustworthy.

---

## 1. What this is

A **single-page, fully static** web app for AV systems integrators to run client
**discovery / needs analysis** in the room:

- capture requirements per space,
- compute standards-based recommendations **live**, and
- export a professional needs-analysis package (Program Report PDF/MD, BOM
  MD/CSV, full JSON).

There is **no backend, no database, no auth**. All state lives in the browser's
`localStorage`; every output is generated client-side. It is operated by the
integrator (not self-served by the client) and is designed for fast in-room
entry on a tablet or laptop.

> ⚠️ **It is not a stamped engineering design and not a quote.** Every computed
> value is *indicative* per the cited AVIXA standard + revision and must be
> verified against the current revision and AVIXA's official calculators.

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| Build | Vite 5 |
| UI | React 18 + TypeScript (strict) |
| Styling | Tailwind CSS 3 |
| PDF | jsPDF (bundled locally — no CDN) |
| State | `localStorage` + a small React hook, no external state lib |
| Routing | **None** (single view) — avoids Pages deep-link 404s |
| Hosting | GitHub Pages via GitHub Actions |

No runtime external API calls, fonts, or CDNs — the app works offline once
loaded.

---

## 3. Run locally

> **Note (this machine):** Node was installed via winget and is **not on PATH**.
> It lives under
> `…\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_*\node-v24.*-win-x64\`.
> Prepend that directory to PATH before running `npm`, or use a normal Node
> install on another machine.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc --noEmit + vite build → dist/
npm run preview  # serve the built dist/
```

---

## 4. Deploy to GitHub Pages

The app uses a **relative base** (`base: './'` in `vite.config.ts`) and is
**single-view**, so it runs from any Pages subpath
(`https://weswuy.github.io/AV-NEEDS/`) with no router 404s. `public/404.html` is
a safety-net redirect.

1. Repo **Settings → Pages → Build and deployment → Source = GitHub Actions**.
2. Push to `main`. `.github/workflows/deploy.yml` builds and publishes `dist/`.

---

## 5. Project structure

```
src/
  standards/
    standardsConfig.ts   ← ⭐ SINGLE SOURCE OF TRUTH for all constants
    discas.ts            V202.01 image-size (BDM + ADM, closest viewer, mounting)
    audio.ts             A104.01 / A102.01 audio-coverage sanity flags
    contrast.ts          V201.01 ambient-light / tech-suitability flag
    infrastructure.ts    F502.01 / S601.01 power/heat/rack + BOM skeleton
    compute.ts           orchestrator → computeSpace(); UI & exports both use it
  data/
    roomTemplates.ts     editable baselines per room type
    questionSet.ts       D401.01 PROGRAM-phase question groups
  state/
    store.ts             project/space factories + localStorage autosave hook
  export/
    markdown.ts          Program Report (MD) + BOM (MD/CSV)
    pdf.ts               Program Report (PDF) via jsPDF
    json.ts              full-project JSON import/export
    download.ts          client-side file download helper
  components/            ui primitives, SpaceEditor, ComputedPanel, ExportBar
  App.tsx                shell: navigator, project header, editor, computed panel
```

---

## 6. ⭐ Standards integrity — the most important rule

**Do not scatter magic numbers.** Every numeric constant, threshold, and
assumption lives in [`src/standards/standardsConfig.ts`](src/standards/standardsConfig.ts).
There are two kinds:

- **Genuine physical/perceptual constants** (e.g. 1-arcminute visual acuity,
  W→BTU/hr) — noted as such.
- **Operator-editable approximations** of the published method — marked
  `// VERIFY:`. These produce sane defaults out of the box but **must be
  confirmed** against the current published standard and AVIXA's free official
  DISCAS calculator (the source of truth for image-size math) before relying on
  output.

When the standard needs professional judgement or data the tool can't derive,
the compute layer raises a **flag** instead of guessing. Every computed value
shown in the UI and in exports carries its standard citation and the verify
qualifier (`VERIFY_QUALIFIER`).

### DISCAS behaviour to know
ADM ("Analytical") uses the resolve-every-line criterion, so **high resolution
at long distance correctly demands a very large image** (e.g. 4K at 8 m ⇒ ~5 m
image height ⇒ flagged as exceeding catalog panels → projection/dvLED/multiple).
That is intentional: pick the resolution to the *content's* critical detail, not
the panel's maximum.

---

## 7. Standards anchored (verify revisions yourself)

D401.01:2023 (process/PROGRAM phase) · V202.01:2016 (DISCAS) ·
V201.01:2021 (contrast) · A104.01:2018 + A102.01:2017 (audio) ·
F502.01:2018 + F501.01:2015 + S601.01:2021 (rack/label/power) ·
10:2013 (verification) · RP-38-17 (VC lighting).

---

## 8. Status & roadmap

- **v1 (shipped):** data model, room templates, full question set, DISCAS
  (BDM+ADM), Program Report (MD+PDF) with sign-off, localStorage save/resume,
  Pages deploy. Audio/contrast flags, BOM (MD/CSV), and the infra power/heat/rack
  estimator are also included (they fell naturally out of the same pipeline).
- **v2 (next):** deeper audio coverage/uniformity modelling; richer V201.01
  contrast-ratio targets by viewing category.
- **v3:** multi-project library, branding/letterhead on exports, J-STD-710
  symbol notes.

### Known limitations
- The BDM minimum element-subtense angle and all planning power/heat figures are
  `// VERIFY:` defaults — confirm before quoting.
- BOM is a **skeleton** (quantities/models are placeholders), explicitly marked
  not-yet-engineered.
- Single project at a time in `localStorage` (export JSON to keep multiples);
  multi-project library is a v3 item.
