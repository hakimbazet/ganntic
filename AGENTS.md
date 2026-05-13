# AGENTS.md

## Project

Next.js 16 App Router app (static export) that converts Excel files to interactive Gantt charts.

## Package manager

Use **pnpm**. (`pnpm-lock.yaml`, `pnpm-workspace.yaml` present.)

## Commands

- `pnpm dev` – start dev server (Next.js, port 3000)
- `pnpm build` – static export into `out/` (config: `output: "export"`)
- `pnpm lint` – ESLint via `eslint-config-next/core-web-vitals` + `typescript`

There is **no test runner** configured (`npm test` will fail). No typecheck script either; rely on `tsc --noEmit` if needed.

## Architecture

- **Entry page**: `app/page.tsx` (client component; imports from `app/components/`)
- **Layout**: `app/layout.tsx` with hardcoded `SITE_URL = "https://ganttic.app"` and inline JSON-LD schema
- **UI components**: `components/ui/` (shadcn/ui, installed with `base-nova` style)
- **Utils**: `lib/utils.ts` exports `cn(...)` for `clsx` + `tailwind-merge`
- **Path alias**: `@/*` maps to `./*`

## Styling (Tailwind v4)

- Uses `@tailwindcss/postcss` (v4), **not** `@tailwindcss/vite` or classic `tailwind.config.js`
- Theme tokens and light/dark modes are defined manually in `app/globals.css` via `@theme inline` and CSS custom properties
- Dark mode is class-based (`dark` class on `<html>`), toggled via localStorage key `ganttic-theme`
- Custom animations (`animate-fade-up`, `animate-scale-in`, etc.) and scrollbars are defined in `globals.css`

## Build quirks

- `next.config.ts`: `output: "export"`, `images.unoptimized: true`, `trailingSlash: true`
- Do not add API routes or `next/headers` usage — they break static export.
- `.next/` and `out/` are gitignored.

## Duplicate / dead code warning

There are **two** `GanttView.tsx` files:
- `app/components/gantt/GanttView.tsx` — **active**, consumed by page
- `app/components/GanttView.tsx` — **orphaned/older**; do not edit this one expecting UI changes

When editing Gantt chart logic, target `app/components/gantt/GanttView.tsx`.

## Toolchain constraints

- React 19, TypeScript strict mode, `moduleResolution: bundler`
- `eslint.config.mjs` extends `eslint-config-next` flat configs; do not introduce `.eslintrc.*`
- `xlsx` is the legacy `xlsx@0.18.5` package (SheetJS Community Edition). If you need modern features, evaluate migration cost.
- `jimp` is included but check whether it is actually used before adding new image-processing code.
