# Plan — NACIRA Sales AI CRM: "Modern Sky Intelligence" UI Redesign

## Context
The current UI is black/gold, uses serif headings, puts cards inside cards and uses emoji as icons. Styling is hard-coded hex values in Tailwind arbitrary classes (`#c5a059` appears 281 times; `#26262d`, `#15151a` and others also recur), with Tailwind loaded from the Play CDN. The brief asks for a full redesign to a dark midnight + sky-blue token system, with Lucide icons, one sans font, a SaaS app shell, redesigned Sales AI / CRM / Estimator / Knowledge pages, responsive layouts and accessibility. **UI only: business logic must stay the same.**

Decisions confirmed with the user:
- Rename "Sales Ary" to **"Sales AI"** and update the acceptance-test assertions to match.
- Move Tailwind to **v4 via npm**, with semantic tokens.
- **Remove the calculator embedded in Knowledge Base** and link to the Estimator page instead.
- **FollowUpModule is out of scope.** It is never rendered.

## Audit facts that constrain the work
- Entry is `index.html` → `src/js/app.jsx`. There is no router; pages switch on `activeTab` with the values `workspace`, `crm`, `estimator` and `knowledge`.
- Logic lives in the upper part of each module and JSX in the lower part:
  - `AIWorkspace.jsx`: logic ends at around L408. The only AI call is `AIService.generateWhatsAppReply({...})` at L301–318.
  - `CRMModule.jsx`: logic is L47–217.
  - `EstimatorCalculator.jsx`: all math goes through `calculateEstimate()` (`src/js/services/calculatorData.js:469`) inside the `useMemo` at L101–159.
- **Keep every state variable, handler and input-parse rule unchanged.** Rewrite only the JSX that consumes them. Estimator behaviour that must survive the rewrite:
  - category-gated args (L111–123)
  - `handleCategoryChange` resets (L85–98)
  - `t` is set when a sub-item is clicked
  - aluminium material forces `SINGLE_LAYER`
  - raw-string lengths for top table and backsplash
  - hard-coded price labels in the JSX (L511–568, 651, 663–717, 1040) are copied verbatim
- `pdfExport.js` is pure jsPDF (no DOM access). It is out of scope; its gold PDF branding stays.
- `scripts/run_acceptance_tests.mjs` (run with `node scripts/run_acceptance_tests.mjs`) does **substring checks on component source**. The redesign must keep these strings:
  - AppShell: `min-w-0`, `p-3.5 sm:p-6 lg:p-10`, `safe-padding-bottom`
  - AIWorkspace: `responsePanelRef`, `ai-response-panel`, `min-h-[180px] lg:min-h-[480px]`, the WhatsApp API URL
  - CRM: `hidden md:block`, `md:hidden`, `text-base sm:text-sm`
  - Estimator: `flex flex-col sm:flex-row`, `min-h-[44px]`
  - Sidebar: `setActiveTab('estimator')` after `setActiveTab('crm')`, `min-h-[44px]`, no `'followup'`
  - Header: `min-h-[44px]` or `h-11 w-11`
  - style.css: `safe-padding-*`, `font-size: 16px !important`, `.touch-target-min`
  - Modals: `max-h-[90dvh]` and `overflow-y-auto`
  - Toast: `left-4 right-4` and `safe-padding-bottom`
  - Only the "Sales Ary" assertions (Sidebar `<span>`, CommandPalette `title`, Header) change to "Sales AI".
- The only scripts are `dev`, `build` and `preview`. There is no lint and no test runner.
- The command palette's Ctrl+K works, but it has no arrow-key or Enter navigation. None of the modals trap focus, and AuthModal doesn't close on ESC.
- Emoji in data files (`calculatorData.js`, `constants.js` `AI_RESPONSE_MODES.label`, the AI engines) feed AI prompts and WhatsApp output. **Don't edit that data.** In the UI, map ids to Lucide icons and strip the leading emoji from labels only at render time.

## Implementation phases

### Phase 0 — Docs
- Write `docs/UI_REDESIGN_AUDIT.md` (the facts above, risks, the logic boundaries that must not be crossed).
- Write `docs/UI_REDESIGN_PLAN.md` (the phases below).

### Phase 1 — Foundation and design system
- `npm i -D tailwindcss @tailwindcss/vite` and `npm i lucide-react @fontsource-variable/geist` (a local font, no CDN).
- Add `tailwindcss()` to `vite.config.js`. Remove the CDN script and the gold `body` classes from `index.html`.
- Rewrite `src/styles/style.css`:
  - `@import "tailwindcss"`
  - `:root` tokens with the brief's dark values as the default, plus a `[data-theme="light"]` block
  - `@theme inline` mapping the tokens to utilities: `bg-bg`, `bg-surface`, `bg-surface-2`, `bg-surface-hover`, `border-border`, `border-border-strong`, `text-fg`, `text-fg-2`, `text-fg-muted`, `primary-*`, `success`, `warning`, `danger`, `ai` (violet)
  - radius tokens (8, 10, 12, 16px) and shadow tokens
  - Geist Sans as the only font
  - `prefers-reduced-motion` handling and a `:focus-visible` sky ring
  - keep `safe-padding-*`, `.touch-target-min` and the 16px mobile input rule
  - delete `gold-btn`, `glass-panel`, `serif-font` and `gold-gradient-text` once no file uses them
- New primitives in `src/components/ui/`:
  - `Button` (variants primary/secondary/outline/ghost/danger; sizes sm/md/lg), `IconButton` (required `aria-label` plus a title tooltip)
  - `Input`, `Textarea`, `Select`, `SearchInput`, `Badge` (neutral/primary/success/warning/danger/purple)
  - `Panel`, `PageHeader`, `EmptyState`, `Skeleton`, `SegmentedControl`, `SelectableCard`
  - `Modal`: a shared wrapper with focus trap, ESC, focus restore, `max-h-[90dvh] overflow-y-auto`
  - `MetricCard`
  - Keep `cn()` as a tiny helper in `src/js/utils/cn.js`.
- Replace `src/components/Icons.jsx` with named Lucide imports, and update the existing `Icons.X` call sites to Lucide components. Keep a tiny `NaciraLogo`.

### Phase 2 — App shell
- **`Sidebar.jsx`**:
  - 256px wide, `bg-sidebar`, 32px logo, "NACIRA STUDIO / Sales AI CRM"
  - a mapped nav array with groups: WORKSPACE (Sales AI: Sparkles, CRM Leads: UsersRound, Estimator: Calculator), KNOWLEDGE (Knowledge Base: BookOpen), SYSTEM (Cloud & Settings: Settings2, opens CloudSettingsModal)
  - active item: `bg-primary/10 text-primary-400` plus a 2px left indicator
  - footer: avatar, name, role (opens AuthModal), and a small sync-status dot
  - keep `setActiveTab('estimator')` and `min-h-[44px]`
  - on the drawer: tablet and mobile keep the existing off-canvas drawer. Tablet (md) collapses to 72px icon-only.
- **`Header.jsx`**:
  - 64px bar: hamburger (`h-11 w-11`, below lg), then page title/breadcrumb from `activeTab`, then search trigger `[Search ⌘K]`
  - **BrandSwitcher**: a custom accessible dropdown replacing the native `<select>`. It shows an icon, brand name, `shortDescription` and a check on the active brand. It calls the existing `onSwitchBrand` and is still visible only to SUPER_ADMIN; other roles see a static brand badge.
  - user avatar button
  - remove the repeated big serif brand title
- **`AppShell.jsx`**:
  - token backgrounds, `lg:ml-64`
  - content `max-w-[1600px]`, keep `p-3.5 sm:p-6 lg:p-10` and `min-w-0`
  - add a **`BottomNav.jsx`** below md (Sales AI / CRM / Estimator / Knowledge / More, where More opens the drawer) with `safe-padding-bottom`
- **`CommandPalette.jsx`**: restyle, add arrow-key and Enter navigation plus an active-row highlight. Add an "Add Lead" command that goes to CRM and opens the add sheet via a `window` event or prop. Rename the nav item to 'Sales AI'.
- Restyle **`InAppReminderBanner`**, **`Toast`**, **`ConfirmModal`** and **`StatusBadge`** (semantic status colours: Prospek/Survey = sky, Design Review = violet, Penawaran RAB = amber, Closing/DP = emerald, Selesai = green/neutral, Batal = red subtle).
- Move the ErrorBoundary in `app.jsx` to tokens, with human-readable error copy.

### Phase 3 — Sales AI (`AIWorkspace.jsx`, JSX only below L408)
- Grid `lg:grid-cols-[minmax(420px,0.9fr)_minmax(500px,1.1fr)]`.
- **Left column**, in this order:
  1. compact context line (brand, provider/model button → ApiKeyModal)
  2. **strategy SegmentedControl** over the six `AI_RESPONSE_MODES` using Lucide icons (SMART_REPLY: Sparkles with an AUTO badge, PRICE_EXPLANATION: BadgeDollarSign, SURVEY_INVITATION: Ruler, OBJECTION_HANDLING: ShieldCheck, FOLLOW_UP: Clock3, CLOSING: Handshake). Only the selected mode's `desc` is shown.
  3. message Textarea (`min-h-[180px]`), placeholder "Tempel chat calon klien atau tulis instruksi untuk AI…", with an internal toolbar: Paste (`navigator.clipboard.readText`), Clear, character count, and an Enter-to-submit hint (keep the existing behaviour)
  4. quick-action chips (36px, Lucide icons in place of emoji) from `ADMIN_DIRECTIVE_SHORTCUTS`
  5. compact upload zone (ImagePlus, dashed subtle border, "PNG / JPG / WEBP · Ctrl+V"); after upload, a thumbnail with Replace and Remove
  6. primary **Generate Rekomendasi** button (Sparkles), with "Menganalisis percakapan…" and a subtle progress bar while loading
  7. collapsible **Client Memory** section: lead select plus 4 inputs, a compact summary when collapsed, "Belum ada memori klien" + "Tambah Memori" when empty
- **Right column** (`ref={responsePanelRef}`, id/class `ai-response-panel`, `min-h-[180px] lg:min-h-[480px]`):
  - **empty state**: Bot icon, "Belum ada rekomendasi" and a 3-step hint (paste → generate → copy/WA)
  - **loading**: the streaming text or a skeleton
  - **result**:
    - header "Rekomendasi AI" with strategy and temperature badges; `metrics.formattedSummary` as small muted metadata
    - actions Copy / Buka WhatsApp (keep the `api.whatsapp.com/send?text=` URL) / Regenerate (calls `generateReply`), each an IconButton with a tooltip
    - reply text at 15–16px, line-height 1.7
    - feedback: "Akurat" / "Perlu koreksi" wired to `handleGiveFeedback`
    - `principlesUsed` as muted metadata
  - **Smart context section**: a definition list (Intent, Tahap, Proyek, Lokasi), "Informasi yang masih dibutuhkan" as a list, "Langkah berikutnya" highlighted, and `internalSources` collapsed
- Error state: "Tidak dapat menghasilkan rekomendasi." plus subtext and a Coba lagi button.

### Phase 4 — CRM (`CRMModule.jsx`, JSX only below L217)
- PageHeader "CRM Leads" with the subtitle and a primary **+ Tambah Lead** button. The super-admin "all brands" toggle becomes a secondary switch.
- **4 MetricCards** from the existing values: Total Leads, Pipeline Value (`activePipelineValue`), Survey/Aktif (`activeLeads.length`), Closing Value (`closingRevenueValue`).
- **Add Lead**: the inline 6-column form moves into a `Modal`, which is a side sheet on desktop and full screen on mobile. It is a structured form with labels, the existing duplicate warning and `crmError`. Submit calls the existing `handleAddLead`. Inputs keep `text-base sm:text-sm`.
- Toolbar: SearchInput, status Select, sort Select, and a ghost Export CSV button.
- **Table** (`hidden md:block`): sticky header, compact hover rows; columns Client, Phone, Project, Location, Value, Stage, Last Activity (`updatedAt`/`createdAt`), Action. Actions are an IconButton for WhatsApp plus a kebab menu with Edit, Konsultasi AI and Delete.
- **Mobile LeadCard** list (`md:hidden`).
- Empty state (UsersRound): "Belum ada lead" + Tambah Lead.
- The Table/Pipeline toggle is included as an **optional Kanban view** grouped by `LEAD_STATUS_OPTIONS`. It is read-only and opens the edit modal to change status (the status-change logic is unchanged).
- Restyle `EditLeadModal` onto the shared `Modal`.

### Phase 5 — Estimator (`EstimatorCalculator.jsx`, JSX only below L204)
- Remove the inline gold page header in `app.jsx:340-356` and use `PageHeader` instead.
- Layout `lg:grid-cols-[minmax(0,1fr)_360px]`, left ≈ 68%, with the summary `lg:sticky lg:top-20`.
- Top row:
  - category tabs with Lucide icons (CookingPot, BedDouble, Sofa, Hammer) keyed by the `ESTIMATOR_CATEGORIES` ids, labels stripped of emoji
  - region SegmentedControl DK/LK
  - rule text as a small muted line
- Sub-item chips for non-kitchen categories.
- Sections as numbered groups separated by dividers, not nested cards:
  1. Material
  2. Style
  3. Dimensi
  4. Countertop
  5. Backsplash
  6. Aksesoris
  7. Pekerjaan tambahan (HPL, manual add-ons)
- Use SelectableCard for options (sky border and subtle background when selected), and Input with an inline unit suffix (m¹, m², pcs).
- Keep `flex flex-col sm:flex-row` and `min-h-[44px]`.
- **Summary**: breakdown rows, delivery, divider, then "Estimasi Total" in a large tabular-nums figure. Primary action: **Salin Penawaran WhatsApp**. Secondary: Export PDF and Gunakan di Sales AI.
- **Mobile**: a sticky bottom bar (Estimasi Rp X · [Lihat Rincian]) above BottomNav that opens the summary in a bottom-sheet `Modal`.

### Phase 6 — Knowledge Base (`KnowledgeBase.jsx`)
- Remove the CALCULATOR/CATALOG toggle and the `EstimatorCalculator` import. Add a small "Buka Estimator" ghost link. This needs a new `onNavigate` prop from `app.jsx`, which calls `setActiveTab('estimator')`.
- PageHeader, then a prominent SearchInput ("Cari knowledge, SOP, material…"), then scope filter chips (Global, Brand Override, Campaign) and category chips derived from the item categories.
- Card grid: title, category, scope, short excerpt (line-clamp-3).
- Clicking a card opens a reading `Modal`/drawer (max-w 720px). Where an article is long, it gets headings and a small "Terkait" list of the same category.
- RAG tester becomes a collapsible "Uji Retrieval AI" section.
- Empty state: BookOpen, "Knowledge tidak ditemukan."

### Phase 7 — Modals and multi-brand polish
- Move `ApiKeyModal`, `AuthModal` (gains ESC), `CloudSettingsModal`, `EditTaskModal` and `ConfirmModal` onto the shared `Modal`, with tokens and Lucide icons in place of emoji.
- Brand identity appears only via BrandSwitcher and a small badge. The core UI stays sky blue.

### Phase 8–10 — Responsive, accessibility, QA
- Accessibility: `aria-label` and tooltip on every IconButton, labels on every input, a visible focus ring, focus trap in modals, keyboard support in the command palette and BrandSwitcher, 44px touch targets.
- Grep for leftovers (`c5a059`, `gold-`, `serif-font`, `glass-panel`, emoji in JSX) and clean them up. FollowUpModule is excluded; it is unrendered and out of scope, but still gets the token swap so the build doesn't reference deleted classes.
- Update the "Sales Ary" assertions in `scripts/run_acceptance_tests.mjs`.
- Write `docs/UI_REDESIGN_REPORT.md` with the sections from the brief.

## Critical files
`index.html`, `vite.config.js`, `package.json`, `src/styles/style.css`, `src/components/ui/*` (new), `src/components/Icons.jsx`, `src/components/layout/{AppShell,Sidebar,Header,CommandPalette,BottomNav}.jsx`, `src/components/common/*`, `src/components/modals/*`, `src/components/modules/{AIWorkspace,CRMModule,EstimatorCalculator,KnowledgeBase}.jsx`, `src/js/app.jsx` (estimator header, KB `onNavigate`, ErrorBoundary), `scripts/run_acceptance_tests.mjs` (label only).

**Not touched:** `src/js/services/**`, `src/js/utils/pdfExport.js`, `calculatorData.js`, `constants.js` data, auth, storage, firebase, migration.

## Verification
1. `npm run build` passes, and `node scripts/run_acceptance_tests.mjs` passes. It covers the estimator math and PDF checks, which confirms the formulas are unchanged.
2. Run the `dev` preview and check each page in the browser pane:
   - Sales AI: type a message, pick a strategy, paste/upload an image, generate (with the default Gemini key), copy, open WA, give feedback, fill client memory from a lead
   - CRM: add a lead (duplicate warning), edit, filter, search, sort, delete, export CSV, consult in AI
   - Estimator: switch every category and DK/LK. Compare the total for the default Kitchen Set config before and after (note the pre-change total first). Copy WA, export PDF, send to AI.
   - Knowledge: search, filter, open an article, RAG test, the Estimator link
   - Brand switch changes lead scoping. Ctrl+K works with the keyboard. Modals close on ESC and trap focus.
3. Use `resize_window` at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 widths: no horizontal overflow (JS check `document.documentElement.scrollWidth > innerWidth`), bottom nav and sheets work on mobile, the sidebar collapses on tablet.
4. `read_console_messages` shows no errors, and a screenshot of each page goes into the report.
