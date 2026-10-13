# UI Redesign Report — "Modern Sky Intelligence"

## Overview
Full UI redesign of NACIRA STUDIO Sales AI CRM from a black/gold, serif, emoji-heavy interface to a dark-midnight + sky-blue SaaS design system. Business logic, data, API contracts and estimator formulas are unchanged (logic sections verified identical to `HEAD` with `diff`; 189/189 acceptance tests pass).

## Files changed
- Build & entry: `package.json`, `package-lock.json`, `vite.config.js`, `index.html`
- Styles: `src/styles/style.css` (rewritten as token sheet)
- App: `src/js/app.jsx` (font import, ErrorBoundary, estimator page header, KB navigation, add-lead command wiring, copy)
- Layout: `AppShell.jsx`, `Sidebar.jsx`, `Header.jsx`, `CommandPalette.jsx`
- Common: `FormField.jsx`, `Toast.jsx`, `StatusBadge.jsx`, `ConfirmModal.jsx`, `InAppReminderBanner.jsx`, `Icons.jsx`
- Modals: `EditLeadModal.jsx`, `EditTaskModal.jsx`, `ApiKeyModal.jsx`, `AuthModal.jsx`, `CloudSettingsModal.jsx`
- Modules: `AIWorkspace.jsx`, `CRMModule.jsx`, `EstimatorCalculator.jsx`, `KnowledgeBase.jsx`
- Tests: `scripts/run_acceptance_tests.mjs` (label assertions only: "Sales Ary" → "Sales AI")
- Docs: `README.md`, `BASE_APP_FITUR.md`, `docs/UI_REDESIGN_AUDIT.md`, `docs/UI_REDESIGN_PLAN.md`, this report

## Components added
- `src/components/ui/`: `Button`, `IconButton`, `Input` (prefix/suffix/icon), `Textarea`, `Select`, `SearchInput`, `Switch`, `Badge`, `Panel`, `SectionTitle`, `PageHeader`, `EmptyState`, `Skeleton`, `MetricCard`, `SegmentedControl`, `SelectableCard`, `Chip`, `Modal` (portal, focus trap, ESC, focus restore; center / sheet / bottom variants), `Menu` (accessible dropdown with arrow keys).
- `src/components/layout/`: `BottomNav`, `BrandSwitcher`, `navigation.js` (page metadata).
- `src/js/utils/cn.js`.

## Components refactored
All layout, common, modal and module components listed above were moved onto the primitives and tokens. `Icons.jsx` became a thin compatibility map over named Lucide imports.

## Design system
- **Tokens** (`style.css`): `--bg #090E14`, `--sidebar #0B1118`, `--surface #0F1620`, `--surface-2 #131C27`, `--surface-3 #182230`, borders `rgba(148,163,184,.12/.22)`, text `#F8FAFC / #CBD5E1 / #94A3B8 / #64748B`, primary `#0EA5E9` (hover `#0284C7`, text `#38BDF8`, subtle `rgba(14,165,233,.12)`, ring `rgba(56,189,248,.35)`), success/warning/danger/ai. A complete `[data-theme="light"]` set is defined; dark is default.
- Exposed as Tailwind utilities via `@theme inline` (`bg-surface`, `text-fg-3`, `bg-primary-subtle`, `ring-ring`…), plus radius (6/8/10/12/16px), shadow and type scale tokens (`text-h1`, `text-body`, `text-label`, `text-caption`…).
- **Typography**: Geist Variable (self-hosted via `@fontsource-variable/geist`) as the single family; uppercase limited to small group labels.
- **Icons**: Lucide React, tree-shaken named imports, 12–20px, stroke ~1.9. No emoji in rendered UI (data strings sent to AI/WhatsApp untouched).
- **Status colours**: Prospek/Survey sky, Design Review violet, Penawaran amber, Closing/DP emerald, Selesai neutral, Batal red — all low-saturation.

## Responsive improvements
- Desktop: 256px persistent sidebar, 64px sticky top bar, 1600px content max width.
- Tablet (md–lg): 72px icon rail; hamburger opens the full drawer.
- Mobile (<md): bottom navigation (Sales AI, CRM, Estimator, Knowledge, Lainnya→drawer), compact top bar, CRM cards instead of table, Estimator sticky total bar + bottom-sheet summary, full-width sheets for modals.
- Verified no horizontal overflow on all four pages at 320, 768, 1024 and 1440px.

## UX improvements
- **Sales AI**: compact 6-way strategy selector (only the selected description shown; Smart Auto marked AUTO), textarea as the focal point with Tempel / Bersihkan toolbar and Ctrl+Enter, compact screenshot zone with thumbnail + replace/remove, single primary "Generate Rekomendasi" with progress, informative empty state, result panel with Copy / Regenerate / Buka WhatsApp and feedback, context analysis as a definition list with "Langkah berikutnya" and "Informasi yang masih dibutuhkan", collapsible client memory, human error state with "Coba lagi".
- **CRM**: page header with one primary action, 4 metric cards, add lead in a side sheet, compact toolbar, sticky-header table with WhatsApp + kebab menu per row, read-only pipeline view, empty state.
- **Estimator**: category tabs + DK/LK segmented control, numbered sections separated by dividers (no nested cards), selectable cards, inputs with inline units, sticky summary with one primary action (Salin penawaran WhatsApp).
- **Knowledge Base**: search-first layout, category chips (humanised labels) and layer filter, article cards, reading sheet with related items, collapsible retrieval tester; embedded calculator replaced by a "Buka Estimator" link.
- **Shell**: breadcrumb/page title instead of repeated brand hero, workspace-style brand switcher (Super Admin), avatar menu, command palette with arrow/Enter navigation and new "Tambah lead baru" / "Cari klien" commands.

## Accessibility
- Visible `:focus-visible` sky outline globally; inputs get border + ring on focus.
- Shared `Modal`: `role="dialog"`, `aria-modal`, labelled title/description, focus trap, ESC, focus restore, body scroll lock. AuthModal now closes with ESC.
- `Menu`/BrandSwitcher: `aria-haspopup`, `aria-expanded`, arrow-key navigation, ESC returns focus.
- Command palette: combobox/listbox semantics with `aria-activedescendant`.
- Icon-only buttons have `aria-label` + `title` tooltip; form labels bound with `htmlFor`; skip-to-content link; `aria-current` on navigation; `prefers-reduced-motion` honoured; touch targets ≥44px on mobile.

## Functional tests (browser, dev server)
- Sales AI: typed chat → generate (Gemini) → result with WhatsApp link ✔; error state + "Coba lagi" ✔ (first attempt hit the service's 28s upstream timeout; retry succeeded in ~3s).
- Estimator: UI totals match direct `calculateEstimate()` calls for default DK (Rp 10.000.000), LK (Rp 10.900.000), cabinet 3m (Rp 12.500.000), + granit top (Rp 20.900.000), + aluminium single layer (Rp 28.400.000); category switches and sub-item controls update the total ✔.
- CRM: add lead ✔, duplicate-phone warning ✔, validation error ✔, edit (location/status) ✔, pipeline grouping ✔, delete via kebab + confirm ✔, empty state ✔ (test leads removed afterwards).
- Knowledge: search, open article, ESC close, retrieval tester ✔.
- Brand switch via BrandSwitcher ✔ and back; Ctrl+K palette → "estim" + Enter navigates ✔.
- Cloud settings, AI provider and account modals open and close with ESC ✔. No console errors on a fresh session across all pages.

## Build results
- `npm run build` ✔ (Vite 6 + Tailwind v4). CSS ≈78 kB (14.6 kB gzip). The existing >500 kB JS chunk warning (jsPDF/html2canvas) is pre-existing.
- `node scripts/run_acceptance_tests.mjs` ✔ 189/189.

## Known limitations
- `FollowUpModule.jsx` remains unrendered and still uses legacy gold classes (out of scope; styles degrade gracefully since those classes were removed).
- "Konsultasi di Sales AI" from CRM only switches the tab (pre-existing behaviour; lead data is not passed).
- PDF export keeps its original gold branding (`pdfExport.js` intentionally untouched).
- Light theme tokens exist but no theme toggle is exposed yet.
- The Gemini request can abort on slow upstream responses (service timeout 25–28s, unchanged).

## Recommended next improvements
1. Wire `onConsultLeadInAI` to prefill Sales AI client memory with the selected lead.
2. Decide on FollowUpModule: expose it as a CRM tab (already has task logic) or delete it.
3. Add a theme toggle using the existing `[data-theme]` tokens.
4. Code-split jsPDF (dynamic import on export) to remove the large-chunk warning.
5. Allow stage changes directly from the pipeline view (drag or menu) once the business rule is agreed.
