# Tech Stack & Versions
- Core: React (Latest), TypeScript (Strict Mode), Vite
- Routing: React Router v7 (following Data Router patterns)
    - IMPORTANT: I am using exactly:
      `import { createBrowserRouter, RouterProvider, Navigate } from "react-router";`
      (React Router v7)
- Server State: TanStack Query v5
- Client State: Redux Toolkit (RTK)
- Styling: Tailwind CSS
- Visualization: Highcharts Core + `highcharts/react` wrapper

# Critical architectural guidelines

## 1) State management separation (Mandatory)
- Server State (async): MUST use TanStack Query. NEVER store API data in Redux.
- Client State (sync): Use Redux Toolkit only for global UI state (theme, sidebar status, complex filter parameters, etc.).
- Data flow: Fetch with `useQuery`, transform using `select` (memoized transformation), and pass plain arrays/objects to components (including charts).

## 2) Highcharts best practices (Strict)
- Wrapper: You MUST use `<HighchartsReact />` from `highcharts-react-official`.
- Configuration: NEVER manually instantiate `Highcharts.chart()` inside a `useEffect`. Rely on the wrapper to handle updates.
- Typing: Use `Highcharts.Options` for strict typing of the chart configuration object.
- Performance: Keep the `options` object stable. If it depends on data, build it with `useMemo` to avoid unnecessary chart re-renders.
- Responsiveness: Ensure the container has defined dimensions (e.g., Tailwind classes) so Highcharts can calculate width correctly.
- Required imports whenever charts are used:
  import {
  Chart,
  Title
  } from '@highcharts/react';

import {
Area,
Line
} from '@highcharts/react/series';

## 3) Code quality & patterns
- TanStack Query v5: Use Object Syntax (`{ queryKey: [...], queryFn: ... }`).
- Tailwind: Use utility classes cleanly. For dynamic classes, use `clsx` or `tailwind-merge`.
- Folder structure: Feature-based architecture (e.g., `features/analytics/components/RevenueChart.tsx`).

# Response style
- Respond in Portuguese (PT-BR) unless I request otherwise.
- Provide concise, production-ready code, including all necessary imports.

# Delivery mode: incremental (so I can test)
- Implement changes IN SMALL STEPS so I can test each feature before moving on.
- For each step, include:
    1) What was done
    2) Files/snippets changed (full code where it makes sense)
    3) Quick test instructions (step-by-step)
    4) A checklist of what was NOT touched

# Stability requirement (do not break what already works)
- Be extremely careful NOT to break existing functionality.
- Avoid broad changes, unnecessary refactors, and indirect side effects.
- Preserve working contracts, existing routes, styling, and current behaviors.
- If a sensitive change is needed, prefer an incremental, backwards-compatible approach.

# UI / Visual identity rules (VERY IMPORTANT)
You are designing an institutional frontend for the Government of the State of São Paulo.
The result must be sober, accessible, readable, and highly consistent, with a modern governmental look and no excessive visual effects.

- Aesthetic: institutional, clean, trustworthy (“public service”).
- Layout: simple grid, plenty of whitespace, clear hierarchy.
- Avoid: neon, flashy gradients, heavy shadows, glassmorphism, textures.
- Prioritize accessibility (contrast, visible focus, keyboard navigation).