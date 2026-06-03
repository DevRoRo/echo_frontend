  # Styling Refactor Plan

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
