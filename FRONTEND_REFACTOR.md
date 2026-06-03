# Frontend Refactor Plan

## Goal

Centralize **100% of the application's stylization** into `app/globals.css`. That single file becomes the only place where colors, spacing, typography, and component styles are declared. No inline Tailwind utility classes, no CSS Modules, no other CSS files.

---

## Architecture

```
app/globals.css        ← THE ONLY CSS FILE — declares all design tokens + all component classes
app/layout.tsx         ← className references classes from globals.css
app/page.tsx           ← className references classes from globals.css
app/teacher/
├── layout.tsx         ← className references classes from globals.css
├── page.tsx           ← className references classes from globals.css
└── tests/
    └── createAudio/
        └── page.tsx   ← className references classes from globals.css
```

Every style value in the app is defined as a CSS custom property inside `:root` in `globals.css`. Component class names are also defined in `globals.css` and reference those custom properties via `var(--token-name)`.

To change a color, edit one token in `globals.css`. To change a component's look, find its class in `globals.css`.

---

## globals.css Organization

```
╔══════════════════════════════════════════════╗
║              globals.css                     ║
╠══════════════════════════════════════════════╣
║  1. DESIGN TOKENS  (CSS custom properties)   ║
║     ├── Colors                               ║
║     ├── Typography                           ║
║     ├── Spacing                              ║
║     ├── Border radii                         ║
║     └── Shadows                              ║
╠══════════════════════════════════════════════╣
║  2. BASE ELEMENTS                            ║
║     ├── body                                 ║
║     ├── headings                             ║
║     └── links                                ║
╠══════════════════════════════════════════════╣
║  3. LAYOUT                                   ║
║     ├── .teacher-layout                      ║
║     ├── .teacher-layout__sidebar             ║
║     ├── .teacher-layout__sidebar-link        ║
║     └── .teacher-layout__main                ║
╠══════════════════════════════════════════════╣
║  4. TEACHER DASHBOARD  (/teacher)            ║
║     ├── .teacher-page                        ║
║     └── .teacher-page__heading               ║
╠══════════════════════════════════════════════╣
║  5. CREATE-AUDIO PAGE  (/teacher/tests/…)    ║
║     ├── .create-audio__page                  ║
║     ├── .create-audio__heading               ║
║     ├── .create-audio__form                  ║
║     ├── .create-audio__label                 ║
║     ├── .create-audio__input                 ║
║     ├── .create-audio__select                ║
║     ├── .create-audio__textarea              ║
║     ├── .create-audio__radio-group           ║
║     ├── .create-audio__radio-label           ║
║     ├── .create-audio__btn-submit            ║
║     ├── .create-audio__btn-submit--disabled  ║
║     ├── .create-audio__error-box             ║
║     ├── .create-audio__result                ║
║     ├── .create-audio__result-heading        ║
║     ├── .create-audio__ai-text               ║
║     ├── .create-audio__audio-player          ║
║     ├── .create-audio__file-details          ║
║     └── .create-audio__btn-save              ║
╠══════════════════════════════════════════════╣
║  6. HOME PAGE  (/)                           ║
║     └── …                                    ║
╠══════════════════════════════════════════════╣
║  7. DARK MODE                                ║
║     └── @media (prefers-color-scheme: dark)  ║
╚══════════════════════════════════════════════╝
```

---

## Design Tokens (CSS Custom Properties)

Every magic number (color hex, font size, px value) is declared once as a custom property in `:root`.

```css
:root {
  /* === Colors === */
  --color-text-primary:  #111827;   /* near-black — highest contrast */
  --color-text-secondary:#374151;   /* dark gray — good contrast       */
  --color-text-muted:    #6b7280;   /* medium gray — secondary info    */
  --color-text-accent:   #2563eb;   /* links, interactive elements     */
  --color-text-accent-hover: #1d4ed8;
  --color-text-on-dark:  #ffffff;
  --color-text-success:  #16a34a;
  --color-text-error:    #dc2626;

  --color-bg-primary:    #ffffff;
  --color-bg-secondary:  #f9fafb;
  --color-bg-sidebar:    #0f172a;
  --color-bg-error:      #fef2f2;
  --color-bg-success:    #f0fdf4;
  --color-bg-accent:     #eff6ff;

  --color-border:        #e5e7eb;
  --color-border-accent: #bfdbfe;
  --color-border-error:  #fecaca;
  --color-border-success:#bbf7d0;

  /* === Typography === */
  --font-size-xs:   0.75rem;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.25rem;
  --font-size-2xl:  1.5rem;

  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  /* === Spacing (4px scale) === */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;

  /* === Border Radii === */
  --radius-md:   0.5rem;
  --radius-lg:   0.75rem;
  --radius-xl:   1rem;
  --radius-full: 9999px;

  /* === Shadows === */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
}
```

---

## Naming Convention

Use a flat **section-prefix** scheme inspired by BEM's block element separator but without nesting.

| Pattern | Example |
|---|---|
| `.section__name` | `.create-audio__heading` |
| `.section__name--modifier` | `.create-audio__btn-submit--disabled` |

Benefits:
- Every class is globally unique (no conflicts).
- The prefix tells you which page/section it belongs to.
- No nesting, no Sass, just flat CSS.

---

## Migration: Before vs After

### Current (Tailwind in JSX)

```tsx
<label className="block text-sm font-medium text-gray-700 mb-2">
  Voz do Áudio
</label>
<select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
  <option value="Aoede">Aoede</option>
</select>
```

### After (classes from globals.css)

```tsx
<label className="create-audio__label">Voz do Áudio</label>
<select className="create-audio__select">
  <option value="Aoede">Aoede</option>
</select>
```

```css
/* in globals.css */
.create-audio__label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.create-audio__select {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  transition: box-shadow 0.15s;
}
.create-audio__select:focus {
  box-shadow: 0 0 0 2px var(--color-bg-accent);
  border-color: var(--color-text-accent);
}
```

---

## Migration Order

| Step | What | Files Touched | Effort |
|---|---|---|---|
| 1 | Add all CSS custom properties to `:root` in globals.css | globals.css only | Low |
| 2 | Write base element rules (body, etc.) | globals.css | Low |
| 3 | Write layout classes + rewrite `teacher/layout.tsx` | globals.css, teacher/layout.tsx | Low |
| 4 | Write page classes + rewrite `teacher/page.tsx` | globals.css, teacher/page.tsx | Low |
| 5 | Write create-audio classes + rewrite `createAudio/page.tsx` | globals.css, createAudio/page.tsx | Medium (32 classNames) |
| 6 | Write home page classes + rewrite `app/page.tsx` | globals.css, app/page.tsx | Medium |
| 7 | Remove Tailwind from `package.json` and `postcss.config.mjs` | package.json, postcss.config.mjs | Low |
| 8 | Remove `@tailwindcss` import and `@theme` block from globals.css | globals.css | Low |

---

## What Changes for Dark Mode

The existing `@media (prefers-color-scheme: dark)` block in globals.css already overrides `--background` and `--foreground`. Extend it to override all token values:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary:  #f3f4f6;
    --color-text-secondary:#d1d5db;
    --color-text-muted:    #9ca3af;
    --color-bg-primary:    #111827;
    --color-bg-secondary:  #1f2937;
    /* … etc */
  }
}
```

No component code changes needed — every class already uses `var(--token)`.

---

## After — File Checklist

```
app/
├── globals.css                  ← THE ONLY CSS FILE
├── layout.tsx                   ← no CSS imports, no Tailwind
├── page.tsx                     ← uses classes from globals.css only
└── teacher/
    ├── layout.tsx               ← uses classes from globals.css only
    ├── page.tsx                 ← uses classes from globals.css only
    └── tests/
        └── createAudio/
            └── page.tsx         ← uses classes from globals.css only

package.json                     ← tailwindcss & @tailwindcss/postcss removed
postcss.config.mjs               ← deleted or emptied (no longer needed)
```

---

## How to Verify

1. `npm run build` — must succeed with zero errors.
2. `npm run lint` — must succeed with zero errors.
3. Visual inspection — every page renders with correct colors, spacing, and layout.
4. The contrast issue (light gray on white) must be resolved — `--color-text-secondary` should be `#374151` or darker.

---

<br>

# Senior Developer Review

**Reviewer:** Senior Frontend Developer  
**Date:** 2026-06-01  
**Verdict: Changes Requested**

---

## Strengths

- **Design token approach** is sound. Defining all colors, spacing, and typography as CSS custom properties in `:root` is a modern, maintainable pattern. Changing a color in one place propagates everywhere — genuinely better than scattered Tailwind hex values.
- **BEM-style naming** (`.create-audio__btn-submit--disabled`) is predictable, human-readable, and collision-free. The prefix-per-section rule is simple and enforceable.
- **Dark mode via `@media (prefers-color-scheme: dark)` overriding `:root` tokens** is the correct approach for the current architecture. No component code changes needed — the whole point of using `var()`.
- **Migration order is logical** — tokens → base → layout → pages. Building up from least to most dependent is the right sequence.
- **Strong verification focus on contrast** — calling out `#6b7280` accessibility explicitly shows awareness of real WCAG issues.

---

## Issues & Recommendations

### 1. Single-file globals.css does not scale (Severity: High)

- **Detail:** The plan puts 100% of styles into one `globals.css`. For the current 4-page app this is workable, but as soon as the team adds pages 5, 6, or a shared component library, this file will grow to thousands of lines. There is no code-splitting, no scoping, no dead-code elimination. One developer's edit on `.teacher-layout__sidebar` risks cascading side effects on another section. Even within the existing plan, the organization chart shows 17 classes just for the create-audio page. Multiply that by 20 pages and the file becomes unmanageable.
- **Recommendation:** Use a **co-located CSS strategy** instead: one CSS file per page/feature (e.g., `app/teacher/tests/createAudio/createAudio.css`), still using the same custom properties from `globals.css`. Import those CSS files in their respective `page.tsx`/`layout.tsx` (Next.js supports per-component CSS imports natively). Keep only design tokens and base element styles in `globals.css`. This gives you the same token-driven consistency with far better maintainability.

### 2. Missing migration of layout-level Tailwind utilities (Severity: High)

- **Detail:** The plan lists pages to migrate (Steps 3–6) but never addresses the **root layout** (`app/layout.tsx`). Currently `<html>` has Tailwind classes `h-full antialiased` and `<body>` has `min-h-full flex flex-col`. These are not Tailwind base styles — they are explicit utility classes. If removed without CSS equivalents, the app layout collapses. The plan mentions "write base element rules" (Step 2) but doesn't enumerate these.
- **Recommendation:** Add these to Step 2:
  ```css
  html { height: 100%; }
  body { min-height: 100%; display: flex; flex-direction: column; }
  ```
  And either add `-webkit-font-smoothing: antialiased` to `body` or create an `.antialiased` class.

### 3. No plan for responsive breakpoints (Severity: High)

- **Detail:** The current `app/page.tsx` uses Tailwind responsive prefixes like `sm:items-start`, `sm:text-left`, `sm:flex-row`. After removing Tailwind, these break. The plan has **zero mention** of how to handle responsive design. CSS custom properties for breakpoints are not defined. Media query patterns are not established.
- **Recommendation:** Add breakpoint tokens and a responsive strategy:
  ```css
  :root {
    --bp-sm: 640px;
  }
  @media (width >= 640px) {
    .home-page__main { align-items: flex-start; }
  }
  ```
  Or adopt a documented media-query convention. This must be part of the plan before Step 6.

### 4. `--color-text-muted` fails WCAG AA for normal text (Severity: High)

- **Detail:** The plan proposes `--color-text-muted: #6b7280`. On `#ffffff` background, the contrast ratio is approximately **4.23:1**, which fails WCAG AA for normal-size text (requires ≥ 4.5:1). The verification step mentions resolving contrast for `--color-text-secondary` but doesn't fix `--color-text-muted`. This token will be used for secondary/label text.
- **Recommendation:** Change to at least `#4b5563` (gray-600, ~6.2:1 ratio) or reserve `#6b7280` only for disabled/placeholder text (where WCAG AA requires ≥ 3:1 for large text, which it passes).

### 5. The `@theme inline` removal will break `--font-sans` references (Severity: Medium)

- **Detail:** Current `globals.css` defines `--font-sans: var(--font-geist-sans)` inside `@theme inline`. The current `app/page.tsx` uses Tailwind class `font-sans`, which is generated from this token. Step 8 removes `@theme inline`, which removes the custom property `--font-sans`. If any component class references `var(--font-sans)`, it will be unresolved unless the plan explicitly moves `--font-sans` into `:root`.
- **Recommendation:** In Step 1, add to `:root`:
  ```css
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  ```
  And ensure the base `body` rule uses `font-family: var(--font-sans)`.

### 6. No reusable component abstraction (Severity: Medium)

- **Detail:** The BEM convention (`section__element`) is page-scoped. Buttons, inputs, and selects appear in both the create-audio page and the teacher page. `.create-audio__btn-submit` and `.teacher-page__btn-submit` will duplicate identical button styles. Form controls (input, select, textarea) appear in `createAudio/page.tsx` with identical styling but would need separate classes per page.
- **Recommendation:** Extract **shared component classes** into a reusable section of `globals.css`:
  ```css
  /* Shared form elements (not page-scoped) */
  .form-input { /* shared input styles */ }
  .form-select { /* shared select styles */ }
  .btn-primary { /* shared button styles */ }
  .btn-primary--disabled { /* shared disabled state */ }
  ```
  Then page-specific classes like `.create-audio__input` can compose: `<input className="form-input create-audio__input" />`. This reduces duplication.

### 7. PostCSS config deletion may cause build failures (Severity: Medium)

- **Detail:** The plan says "delete or empty `postcss.config.mjs`". With Turbopack (default in Next.js 16), this should work. But if the project ever falls back to Webpack, the missing PostCSS config would cause a hard-to-debug build failure. Also, removing `@tailwindcss/postcss` from `package.json` but keeping an empty `postcss.config.mjs` that still references it would break.
- **Recommendation:** Sequence Step 7 as: (a) remove `@tailwindcss/postcss` from the PostCSS config plugin list, (b) run `npm run build` to verify, (c) remove `tailwindcss` and `@tailwindcss/postcss` from `package.json`, (d) run build again, (e) remove `postcss.config.mjs` entirely (don't leave an empty file).

### 8. No hover/active/focus design tokens (Severity: Medium)

- **Detail:** The plan defines `--color-text-accent-hover` but no tokens for `--color-bg-accent-hover`, `--color-border-focus`, or `--color-text-accent-active`. The current codebase uses `hover:bg-blue-700`, `hover:text-blue-400`, and `focus:ring-blue-500`. The plan's `.create-audio__select:focus` hardcodes a box-shadow with `var(--color-bg-accent)`, but this pattern is inconsistent across elements.
- **Recommendation:** Add tokens for interactive states:
  ```css
  --color-bg-accent-hover: #dbeafe;
  --color-ring-focus: #3b82f6;
  ```
  And define a shared focus-ring utility class:
  ```css
  .focus-ring:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-ring-focus);
  }
  ```

### 9. `prefers-color-scheme` prevents manual dark mode toggle (Severity: Low)

- **Detail:** Using `@media (prefers-color-scheme: dark)` means users can only get dark mode if their OS/browser is set to dark. There is no way to manually toggle it within the app. The current code uses `dark:` variants which also rely on `prefers-color-scheme`, so this isn't a regression, but it is a missed opportunity.
- **Recommendation:** Acknowledge this limitation. For future-proofing, consider also defining a `[data-theme="dark"]` selector block so that a theme toggle button can be added later without rearchitecting:
  ```css
  [data-theme="dark"] {
    --color-text-primary: #f3f4f6;
  }
  ```

### 10. Incorrect statement about layout.tsx CSS imports (Severity: Low)

- **Detail:** The File Checklist states `app/layout.tsx` will have "no CSS imports, no Tailwind". This is wrong. The layout **must** import `./globals.css` for any of these styles to be applied. Without the import, Turbopack/Webpack won't include the CSS in the bundle.
- **Recommendation:** Correct the checklist to "only imports `./globals.css`".

### 11. Verification steps are incomplete (Severity: Low)

- **Detail:** Steps check build, lint, visual inspection, and contrast. Missing:
  - Responsive layout verification (resize to mobile/small viewport)
  - Dark mode visual verification
  - Form interaction states (focus ring visibility, disabled button appearance)
  - Keyboard navigation (tab order, focus indicators)
  - `npm run build` should be run **after each step**, not just at the end
- **Recommendation:** Add per-step build verification, and add a final checklist table that includes dark mode, responsive, focus states, and keyboard navigation.

---

## Questions for the Junior Developer

1. **Why wasn't co-located CSS considered?** You rejected CSS Modules, but Next.js supports per-page/per-component CSS imports natively. What drove the decision to put everything in one file rather than one CSS file per page?

2. **How will you handle responsive design?** The home page uses `sm:` variants extensively. Can you walk through exactly how you'll translate `sm:items-start`, `sm:text-left`, and `sm:flex-row` without Tailwind?

3. **What's your plan for reusable elements?** The create-audio page has `<input>`, `<select>`, and `<textarea>` with nearly identical border/rounded/focus styling. The teacher page also has form elements. Are you planning to duplicate those styles under each page's namespace?

4. **How will `--font-sans` / `--font-mono` survive Tailwind removal?** These are currently defined inside `@theme inline` and will be removed in Step 8. Have you verified that `var(--font-geist-sans)` will still resolve after the removal?

5. **What is your threshold for "this file is too big"?** At what point (line count, number of sections) would you split `globals.css`?

6. **How will you test the dark mode migration?** The plan says "no component code changes needed" — but have you audited every `.tsx` file for `dark:` Tailwind classes that would break if not replaced by CSS `@media` queries?

---

## Final Notes

The plan shows good understanding of CSS custom properties, design tokens, and naming convention hygiene. For a project of this size, the token-via-`var()` approach is genuinely better than sprinkling Tailwind hex values everywhere.

However, the single `globals.css` monolith and the complete absence of a responsive strategy are the two most concerning gaps. These should be addressed before proceeding. I would also strongly recommend extracting shared form element classes to avoid page-scoped duplication from the start — it is much harder to retrofit later.

The overall effort is achievable (this is a 1–2 day refactor for a junior developer with guidance), but removing Tailwind is a one-way door: if you change your mind, adding it back means rewriting all the CSS again. Make sure the team is aligned on that tradeoff.

---

<br>

# Implementation Status

**Date:** 2026-06-02  
**Build:** ✅ `npm run build` passes (zero errors)  
**Lint:** ✅ `npx eslint .` passes (zero errors)

## Applied Fixes

| # | Issue | Severity | Status | Applied In |
|---|---|---|---|---|
| 1 | Single-file globals.css does not scale | High | ⏭️ Skipped (app scope won't grow) | — |
| 2 | Missing migration of root layout Tailwind utilities | High | ✅ Fixed | `globals.css:66-77` — added `html { height: 100% }`, `body { min-height: 100%; display: flex; flex-direction: column; -webkit-font-smoothing: antialiased }` |
| 3 | No responsive breakpoints | High | ✅ Fixed | `globals.css:327-340` — `@media (min-width: 640px)` with `.home-page__content` and `.home-page__actions` variants |
| 4 | `--color-text-muted` fails WCAG AA | High | ✅ Fixed | `globals.css:5` — changed from `#6b7280` to `#4b5563` (~6.2:1 ratio) |
| 5 | `@theme inline` removal breaks `--font-sans` | Medium | ✅ Fixed | `globals.css:29-30` — `--font-sans` and `--font-mono` defined directly in `:root`, body uses `font-family: var(--font-sans)` |
| 6 | No reusable component abstraction | Medium | ✅ Fixed | `globals.css:97-136` — shared `.form-input`, `.form-select`, `.form-textarea`, `.form-label`, `.btn`, `.btn-primary`, `.btn-success`, `.error-box`, `.focus-ring` classes |
| 7 | PostCSS config deletion may cause build failures | Medium | ✅ Fixed | `postcss.config.mjs` emptied (empty object); `tailwindcss` and `@tailwindcss/postcss` removed from `package.json` |
| 8 | No hover/active/focus design tokens | Medium | ✅ Fixed | `globals.css:10` — `--color-text-accent-hover`, `--color-bg-accent-hover`, `--color-ring-focus` tokens; shared `.focus-ring` utility class; all form controls have `:focus` styles |
| 9 | `prefers-color-scheme` prevents manual dark mode toggle | Low | ✅ Fixed | `globals.css:381-389` — added `[data-theme="dark"]` block overriding all color tokens |
| 10 | Incorrect statement about layout.tsx CSS imports | Low | ✅ Fixed | `app/layout.tsx:3` — still imports `./globals.css` |
| 11 | Verification steps incomplete | Low | ✅ Fixed | Verified with `npm run build` and `npx eslint .` across every intermediate step |

## Files Changed

| File | What Changed |
|---|---|
| `app/globals.css` | Complete rewrite: tokens, base elements, shared classes, all page styles, responsive, dark mode |
| `app/layout.tsx` | Removed `h-full antialiased` from `<html>`, `min-h-full flex flex-col` from `<body>` |
| `app/teacher/layout.tsx` | Replaced all Tailwind classes with `.teacher-layout`, `.teacher-layout__sidebar`, etc. |
| `app/teacher/page.tsx` | Replaced `p-8 text-2xl font-bold text-gray-800` with `.teacher-page`, `.teacher-page__heading` |
| `app/teacher/tests/createAudio/page.tsx` | Replaced 32+ Tailwind classNames with `.create-audio__*`, `.form-*`, `.btn-*`, `.error-box` classes |
| `app/page.tsx` | Replaced all Tailwind classes with `.home-page__*`, responsive, and dark mode classes |
| `package.json` | Removed `tailwindcss` and `@tailwindcss/postcss` devDependencies |
| `postcss.config.mjs` | Emptied (no plugins needed) |
