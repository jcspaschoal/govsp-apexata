# Frontend Guidelines (Updated) — React + TS + Vite + **Official Highcharts in React**

These guidelines exist to stop recurring conflicts around “which Highcharts React wrapper to use” and to standardize implementation (architecture + performance + typing + UI), **without breaking what already works**.

---

## Tech Stack & Versions

- Core: React (Latest), TypeScript (Strict Mode), Vite
- Routing: React Router v7 (Data Router patterns)
  - IMPORTANT: use exactly:
    - `import { createBrowserRouter, RouterProvider, Navigate } from "react-router";`
- Server State: TanStack Query v5
- Client State: Redux Toolkit (RTK)
- Styling: Tailwind CSS (+ `clsx`/`tailwind-merge` when needed)
- UI Components: shadcn/ui
- Icons: lucide-react
- **Visualization (Highcharts)**:
  - ✅ `highcharts` (official Highcharts package; includes Core + Stock + Maps + Gantt distribution)
  - ✅ `@highcharts/react` (**the current official React wrapper**)
  - 🚫 DO NOT use/install `high-charts-react` (old/third-party wrapper)
  - 🚫 DO NOT use/install `highcharts-react-official` for new code (**legacy wrapper**, v3-era)
    - If the codebase still has it, treat as **migration** to `@highcharts/react` (see “Migration”)

Official references:
- Official wrapper repo: https://github.com/highcharts/highcharts-react
- Official wrapper package (NPM): https://www.npmjs.com/package/@highcharts/react
- Highcharts React docs (Getting started): https://www.highcharts.com/docs/react/getting-started

---

## CRITICAL directive — eliminate “wrapper conflicts” permanently

### 1) Single source of truth for the React wrapper
- Always assume the correct official wrapper is **`@highcharts/react`**.
- If anyone suggests installing `high-charts-react`, that is **wrong** and must be rejected.

### 2) Installation (only if you ever need to document it)
- The official docs recommend:
  - `npm install highcharts @highcharts/react`
- The `highcharts` package is the official Highcharts distribution package.

> IMPORTANT: never “fix” Highcharts issues by installing alternative wrappers. Fix imports and usage to match the official wrapper.

---

## Highcharts + React — official patterns (no hacks)

The official `@highcharts/react` integration supports two primary configuration styles:

1) **JSX Components (recommended for clarity and consistency)**
  - `Chart`, `Series`, `Title`, `XAxis`, `YAxis`, `Tooltip`, `Legend`, `PlotOptions`, etc.

2) **Options object (`Highcharts.Options`)**
  - Useful for large or generated configs.
  - Must be **memoized** with `useMemo`.

### 1) Recommended style — JSX components from `@highcharts/react`

Docs:
- Getting started: https://www.highcharts.com/docs/react/getting-started
- Series & chart types: https://www.highcharts.com/docs/react/series-and-chart-types
- Options: https://www.highcharts.com/docs/react/options
- Options component format (`data-hc-option`): https://www.highcharts.com/docs/react/options-component-format
- General chart/series types (Highcharts core docs): https://www.highcharts.com/docs/chart-and-series-types/chart-types

### 2) Alternative style — Options object

- Typing: use `Highcharts.Options` (from `highcharts`) for strict typing.
- Performance: keep the `options` object stable via `useMemo`.
- Strictly forbidden: manually calling `Highcharts.chart()` inside `useEffect` to “control updates”.
  - Let the official wrapper manage the lifecycle.

---

## Migration (if the codebase still uses legacy wrappers)

If the codebase still uses `highcharts-react-official` (legacy), the recommended path is migrating to `@highcharts/react` (v4+).

- Official V4 migration guide: https://www.highcharts.com/docs/react/v4-migration-guide
- Official blog post: https://www.highcharts.com/blog/news/how-to-migrate-to-the-new-highcharts-for-react/

Practical rule:
- New code: **only `@highcharts/react`**.
- Legacy code: migrate incrementally (one chart at a time) while preserving contracts.

---

## Export / Download (no hacks)

To support chart download:
- Enable the **Exporting** module:
  - Export module overview: https://www.highcharts.com/docs/export-module/export-module-overview
  - Exporting API options: https://api.highcharts.com/highcharts/exporting

Export methods:
- `exportChart()` (standard)
- `exportChartLocal()` (if used; may require extra modules and has constraints)

UI rule:
- Download must be a **shadcn/ui Button** (icon button) using **lucide-react** (`ImageDown`).
- Do not render a “standalone icon” outside of Button.

---

## TanStack Query v5 integration (mandatory)

### State separation (mandatory)
- **Server State (async)**: must use TanStack Query.
  - NEVER store API responses in Redux.
- **Client State (sync)**: Redux Toolkit only for global UI state (theme, sidebar, global filters, etc.)

### Data pipeline for charts
- Fetch with `useQuery({ queryKey, queryFn, select })`
- Transform in `select` (memoized)
- Pass plain arrays/objects to chart components.

---

## Typing & datetime (anti-bugs)

### Datetime axis
- For time series: `xAxis.type = "datetime"`.

### Parsing `YYYY-MM-DD` safely
- Never rely on `new Date("YYYY-MM-DD")` because timezone behavior can differ.
- Use explicit UTC conversion:
  - `Date.UTC(y, m - 1, d)`.

---

## Performance (Highcharts + React)

- If using `options`, memoize with `useMemo`.
- Prefer targeted updates when it makes sense:
  - update axis extremes / zoom via chart API rather than rebuilding the entire chart
- Avoid re-rendering the whole chart for small UI changes.
- Ensure the container has defined dimensions (Tailwind classes) so Highcharts can compute width correctly.

---

## UI / Visual identity (Government of São Paulo)

This is an institutional public-sector frontend:
- Aesthetic: sober, accessible, readable, consistent (modern governmental look).
- Layout: simple grid, generous whitespace, clear hierarchy.
- Avoid: neon, flashy gradients, heavy shadows, glassmorphism, textures.
- Accessibility first:
  - proper contrast
  - visible focus ring
  - keyboard navigation

---

## shadcn/ui + lucide-react (chart controls)

- Buttons: https://ui.shadcn.com/docs/components/button
- Icon reference (download): https://lucide.dev/icons/image-down

---

## Delivery mode (incremental) — for chart changes

Always deliver chart changes in small, testable steps:

1) What was done
2) Files/snippets changed (full code where it matters)
3) Quick test instructions (step-by-step)
4) What was NOT touched (to guarantee stability)

---

## Stability requirement (do not break existing behavior)

- Avoid broad refactors and indirect changes.
- Preserve contracts, routes, styling, and current behavior.
- Prefer incremental, backward-compatible changes.

---

## Final anti-conflict note (must follow)

If any library choice/install decision comes up:
- The default is **`highcharts` + `@highcharts/react`** (official).
- Any suggestion to install/use `high-charts-react` is an error.
- If legacy `highcharts-react-official` exists, treat as incremental migration using the official guide.
