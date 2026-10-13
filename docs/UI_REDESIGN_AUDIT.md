# UI Redesign Audit — "Modern Sky Intelligence"

Audit performed before implementation (2026-09-29).

## Current architecture
- Entry: `index.html` → `src/js/app.jsx`. No router; pages switch on `activeTab` (`workspace`, `crm`, `estimator`, `knowledge`).
- State lives in `App` (auth session, brands, `crmLeads`, `followUpTasks`, sync status) and is passed to modules as props. Firestore sync via `window.firebaseServices` bridge.
- Build: React 18 + Vite 6. Scripts: `dev`, `build`, `preview` only (no lint / unit test runner). Acceptance tests: `node scripts/run_acceptance_tests.mjs`.

## Current UI problems
- Tailwind loaded from the Play CDN; no config, no tokens. Styling is hard-coded hex in arbitrary classes (`#c5a059` ×281, `#26262d` ×123, `#2e2e38` ×85…).
- Gold used as primary everywhere; near-black background; `glass-panel` blur on large surfaces.
- Serif headings (Playfair) mixed with Plus Jakarta Sans; heavy uppercase labels at 10–11px with low contrast.
- Deep nesting (panel → card → card → chip); borders on almost every element.
- Emoji used as icons in 13 JSX files; custom inline-SVG icon object with fixed sizes.
- Sales AI: dense left column, large empty right panel before generation. Six large strategy cards all showing descriptions.
- CRM: 6-column inline add form; three large metric cards; row actions as multiple buttons.
- Estimator & Knowledge Base looked alike (Knowledge embedded the whole calculator).
- Header repeated the brand name as a large serif title on every page. Brand switcher was a native `<select>` with emoji.

## Responsive / accessibility problems
- No mobile bottom navigation; sidebar drawer only.
- Modals: no focus trap or focus restore; AuthModal had no ESC handling.
- Command palette advertised keyboard navigation but had none.
- Icon-only buttons partly missing labels/tooltips; form labels not bound to inputs (`htmlFor`).

## Reusable components (before)
`FormField`, `StatusBadge`, `ConfirmModal`, `Toast`, `InAppReminderBanner` — all with inline gold styling, no variants.

## Business-logic boundaries (not touched)
- `src/js/services/**` (AI, auth, storage, firebase, knowledge, calculatorData, export, migration, telemetry).
- `src/js/utils/pdfExport.js` (pure jsPDF; keeps its own gold PDF branding).
- `constants.js` data (brands, statuses, AI modes — emoji in data feed prompts/WhatsApp text).
- Module logic sections were kept byte-identical and verified with `diff` against `HEAD`:
  - `AIWorkspace.jsx` — state + handlers through `handleApplyDirective` (only call: `AIService.generateWhatsAppReply`).
  - `CRMModule.jsx` — state, add/update/delete, filtering, metrics.
  - `EstimatorCalculator.jsx` — state, `handleCategoryChange`, `calculateEstimate` memo, copy/PDF/send handlers (one toast string renamed "Sales Ary" → "Sales AI").
  - Estimator input parse rules, category-gated arguments, aluminium style coupling and hard-coded price labels were copied verbatim into the new JSX.

## Risks identified
- Acceptance tests do substring checks on component source (responsive class strings, labels). These strings were preserved; only the "Sales Ary" label assertions were updated (approved rename).
- Tailwind v4 differs from the CDN (v3) in defaults (border colour, ring width); mitigated by migrating every rendered component to tokens.
- `FollowUpModule.jsx` is not rendered anywhere — left out of scope.

## Strategy
Token-first design system (CSS variables mapped through Tailwind `@theme`), small primitive set in `src/components/ui/`, JSX-only rewrites of each module, shared `Modal` with focus management rendered through a portal.
