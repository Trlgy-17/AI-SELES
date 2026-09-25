# MASTER RESPONSIVE AUDIT & MOBILE HARDENING
**NACIRA STUDIO — SALES ARY**  
Multi-Brand Interior Sales AI Copilot (Cross-Device Architecture & Reliability)

---

## 1. CURRENT LAYOUT ARCHITECTURE
- **Root Shell (`AppShell.jsx`):** Employs a dual-container architecture:
  - Desktop: Fixed left navigation drawer (`w-72 fixed left-0 top-0 h-[100dvh]`), with main viewport area offset using `lg:ml-72 flex-1 w-full min-h-[100dvh]`.
  - Mobile & Tablet: Sidebar collapses offscreen (`-translate-x-full lg:translate-x-0`) with a dark backdrop (`bg-black/70 backdrop-blur-md z-30`). The header presents a hamburger toggle button (`ref={toggleButtonRef}`) to toggle `isSidebarOpen`.
- **Primary Workspaces:**
  - **Sales Ary (`AIWorkspace.jsx`):** 12-column split grid (`grid-cols-1 lg:grid-cols-12 gap-6`). Left 6 columns host Brand badge, Strategy selector, Client memory, WhatsApp chat textarea, Directive chips, Screenshot uploader, and the primary Generate button. Right 6 columns host Streaming reply, Recommended reply card with WA Web link, Copy button, Analysis accordion, and Diagnostic panel.
  - **CRM Leads (`CRMModule.jsx`):** Metric cards grid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3`), Lead intake form (`grid-cols-1 sm:grid-cols-2 md:grid-cols-6`), Search/Filter toolbar, and an itemized data table wrapped in an `overflow-x-auto` container.
  - **Kalkulator Estimasi RAB (`EstimatorCalculator.jsx`):** Region pill switcher, Category carousel chips (`overflow-x-auto`), 12-column layout (`lg:col-span-7` form vs `lg:col-span-5` sticky-style summary card), and action buttons (Copy WhatsApp & Ekspor PDF Penawaran RAB).
  - **Knowledge Base (`KnowledgeBase.jsx`):** 3-layer architecture header, search bar, and expandable knowledge chunk cards.

---

## 2. EXISTING BREAKPOINTS
The codebase currently relies on Tailwind CSS default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px (used as the primary breakpoint for Desktop Sidebar toggle `lg:ml-72` and desktop split grids)
- `xl`: 1280px
- `2xl`: 1536px

**Audit Inconsistencies:**
- In `Header.jsx`, logo hidden with `hidden sm:flex`, while brand name title uses `text-2xl md:text-3xl` without mobile downscaling for long brand names like "HOMEPUTRA INTERIOR".
- In `CRMModule.jsx`, intake form jumps from `grid-cols-1` to `sm:grid-cols-2` to `md:grid-cols-6`. On tablets (768px - 900px), 6 input fields in one row result in illegible 120px inputs with clipped placeholders.
- In `AIWorkspace.jsx`, Strategy cards use `grid-cols-2 sm:grid-cols-3` which on 320px screens causes card label clipping.

---

## 3. MOBILE PROBLEMS (320px – 430px)
1. **Viewport & Safe-Area Configuration:** `index.html` lacks `viewport-fit=cover` and dynamic device safe-area insets (`env(safe-area-inset-bottom)`), risking clipping on modern iPhones with home indicator bars.
2. **CRM Leads 7-Column Table Unusable on Handheld Devices:** A wide desktop table forced onto mobile requires extreme horizontal scrolling, making routine lead follow-ups and WhatsApp clicking cumbersome for single-hand usage.
3. **Empty Result Space Waste:** When no AI response is generated yet, the right panel renders `min-h-[480px]`, creating a massive dead blank box under the form before the user clicks Generate.
4. **Post-Generation Scroll Friction:** After clicking Generate on mobile, the result appears below the fold, forcing the user to manually scroll down to locate the AI recommendation.
5. **Toast Placement Overflow:** `Toast.jsx` is positioned with `right-6 bottom-6` without `left-4 right-4` or `max-w` boundaries, risking horizontal overflow on narrow 320px screens.
6. **Virtual Keyboard Layout Collisions:** Modals (`CloudSettingsModal`, `EditTaskModal`) lack max-height boundaries (`max-h-[90dvh] overflow-y-auto`), causing buttons to be pushed offscreen when the mobile keyboard emerges.
7. **Input Font Zoom:** Standard inputs without explicit `text-base` triggers iOS Safari auto-zoom on focus.

---

## 4. TABLET PROBLEMS (768px – 1024px)
1. **CRM Lead Intake Cramping:** 6-column form layout on 768px portrait mode squishes text boxes and dropdowns into ~110px widths.
2. **Strategy Grid Layout Stacking:** On 768px portrait mode, the 12-column grid in `AIWorkspace` stacks vertically, but internal padding (`p-6 md:p-8`) eats horizontal canvas space unnecessarily.
3. **Header Element Stacking:** Tablet portrait header combines brand title, status badge, command palette search button, brand dropdown selector, and user badge in a multi-line wrap that can feel cluttered.

---

## 5. DESKTOP RISKS (1280px – 1920px+)
1. **Regressions to Split-Screen Workflow:** Refactoring mobile responsive layout must not diminish desktop's two-column simultaneous view where the sales rep sees the input chat and generated recommendations side-by-side.
2. **Sidebar Persistent Visibility:** Desktop must keep the sidebar visible without needing hamburger toggles.

---

## 6. OVERFLOW RISKS
1. `min-w-0` missing on flex child containers containing long strings, file names, or phone numbers.
2. WhatsApp screenshot long previews without aspect-ratio constraints can vertically distort the viewport.
3. `whitespace-nowrap` on chip badges and action buttons without `overflow-x-auto` or `flex-wrap`.

---

## 7. FIXED-WIDTH COMPONENTS
- `w-72` fixed sidebar (correct for desktop, properly converted to off-canvas drawer on mobile/tablet).
- Fixed width modals (`max-w-lg`) need `w-full mx-4` margins so they don't touch screen edges on small phones.
- Table columns in CRM lack responsive priority hiding.

---

## 8. NAVIGATION PROBLEMS
- The sidebar drawer on mobile requires proper touch targets (minimum 44x44px), smooth translation transitions, and backdrop tap dismiss.
- Active states must remain visually distinct on mobile with high-contrast luxury gold accents.

---

## 9. FORM PROBLEMS
- Inputs must use `font-size: 16px` on mobile (`text-base sm:text-sm`) to eliminate iOS Safari zoom quirks.
- Numeric inputs in Estimator Calculator need tap-friendly stepper or clean numeric keypad bindings (`inputMode="decimal"`).
- Textarea placeholder text should cleanly wrap without clipping.

---

## 10. AI PANEL PROBLEMS
- When AI streams its reply, the loading indicator must not cause Cumulative Layout Shift (CLS).
- Copy button must be immediately accessible at the top and bottom of the reply on mobile.
- "Buka WhatsApp Web / Chat" button must offer mobile fallback (`https://api.whatsapp.com/send?text=...`) so mobile devices open the native WhatsApp application seamlessly.

---

## 11. TABLE PROBLEMS
- Desktop table in CRM Leads must convert to an adaptive Card List view on mobile devices (`md:hidden`), displaying client name, status badge, project type, city, value, and quick action buttons (WhatsApp, Consult in AI, Edit, Delete).

---

## 12. MODAL PROBLEMS
- Modals must be centered on desktop, with `max-h-[88dvh] overflow-y-auto` and bottom-sheet or near-fullscreen adaptation on mobile.
- Close buttons must be at least 44x44px touch targets.

---

## 13. TOUCH INTERACTION PROBLEMS
- All buttons, selector chips, and quick action directives must meet touch target guidelines (min ~44px height/padding).
- No functionality should be locked behind desktop `:hover` states.

---

## 14. ACCESSIBILITY PROBLEMS
- Ensure appropriate ARIA labels (`aria-label`, `role="dialog"`, `aria-modal="true"`) across hamburger menus, modals, and icon buttons.
- Preserve color contrast between `#c5a059` gold accents, `#15151a` dark surfaces, and readable text.

---

## 15. CROSS-BROWSER RISKS
- iOS Safari: Dynamic 100vh address bar issue solved with `100dvh`.
- Android Chrome: Virtual keyboard resize behavior.
- Clipboard API: Ensure fallback textarea copy for non-secure or restricted mobile browser contexts.

---

## 16. PERFORMANCE RISKS
- Avoid unnecessary JS resize listeners; rely on CSS-first responsive utilities.
- Avoid large layout shifts during state transitions.

---

## 17. PROPOSED SOLUTION & ARCHITECTURE
1. **Shell & Viewport:**
   - Update `index.html` viewport with `viewport-fit=cover`.
   - Update `AppShell.jsx` with `min-w-0`, safe-area padding (`pb-[env(safe-area-inset-bottom)]`), and mobile gutter optimization (`px-3 sm:px-6 lg:px-8`).
2. **Header & Navigation:**
   - Adaptive header sizing in `Header.jsx`: Compact title on mobile (`text-lg sm:text-2xl`), responsive action buttons with icon-only or shortened labels on mobile.
   - Enhanced touch targets in `Sidebar.jsx`.
3. **Sales Ary Workspace:**
   - On mobile, convert empty result state to a compact card (`min-h-[140px]` instead of `min-h-[480px]`).
   - Implement auto-scroll to `#ai-response-panel` on mobile when generation completes or streams.
   - Strategy modes: 2 columns on mobile, 3 columns on tablet/desktop.
   - Directive chips: Natural `flex-wrap` with adequate touch padding.
4. **CRM Leads Module:**
   - Implement dual view: Adaptive Mobile Card List on `< md`, Full Data Table on `>= md`.
   - Responsive lead intake form: 1 col on mobile, 2 cols on tablet, 6 cols on large desktop.
5. **RAB Calculator Module:**
   - Region selector pill: `flex-col sm:flex-row w-full sm:w-auto`.
   - Responsive form grids: 1 column on mobile, 2 columns on tablet, multi-column on desktop.
6. **Modals & Toast:**
   - Add `max-h-[88dvh] overflow-y-auto` and mobile-safe padding across all modals.
   - Center toast on mobile (`left-4 right-4 sm:left-auto sm:right-6`).

---

## 18. FILES TO MODIFY
- `index.html`
- `src/styles/style.css`
- `src/components/layout/AppShell.jsx`
- `src/components/layout/Header.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/layout/CommandPalette.jsx`
- `src/components/modules/AIWorkspace.jsx`
- `src/components/modules/CRMModule.jsx`
- `src/components/modules/EstimatorCalculator.jsx`
- `src/components/modules/KnowledgeBase.jsx`
- `src/components/modals/ApiKeyModal.jsx`
- `src/components/modals/AuthModal.jsx`
- `src/components/modals/CloudSettingsModal.jsx`
- `src/components/modals/EditLeadModal.jsx`
- `src/components/modals/EditTaskModal.jsx`
- `src/components/common/Toast.jsx`
- `src/components/common/InAppReminderBanner.jsx`
- `scripts/run_acceptance_tests.mjs`

---

## 19. REGRESSION RISKS & MITIGATION
- **Risk:** Desktop split panel layout collapses.  
  *Mitigation:* Keep `lg:grid-cols-12` intact; all mobile adjustments scoped to `< lg` or `< md`.
- **Risk:** Multi-brand state or Lead isolation breaks.  
  *Mitigation:* Zero changes to underlying business logic, state hooks, or services.
- **Risk:** Automated acceptance tests fail.  
  *Mitigation:* Verify all 122 existing tests pass, plus add comprehensive responsive test suite.
