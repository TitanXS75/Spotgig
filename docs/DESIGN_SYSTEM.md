# Aaspass — Design System

> Visual design tokens, component patterns, and UI guidelines.

---

## 1. Color Palette

### Light Theme (Warm Cream & Soft Sand)

| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | `40 33% 97%` | Page background |
| `--foreground` | `25 15% 15%` | Primary text |
| `--primary` | `142 71% 45%` | CTA buttons, active states (green) |
| `--secondary` | `25 95% 53%` | Accent highlights (warm orange) |
| `--muted` | `40 20% 93%` | Disabled states, subtle backgrounds |
| `--destructive` | `0 84% 60%` | Error states, delete actions |
| `--border` | `38 18% 89%` | Card borders, dividers |
| `--accent-product` | `25 95% 53%` | Product type badge (orange) |
| `--accent-service` | `199 89% 48%` | Service type badge (blue) |

### Dark Theme

| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | `0 0% 8%` | Page background |
| `--foreground` | `0 0% 98%` | Primary text |
| `--card` | `0 0% 12%` | Card surfaces |
| `--muted` | `0 0% 20%` | Subtle backgrounds |
| `--border` | `0 0% 16%` | Borders |

### Design Rationale
The light theme uses warm cream tones (`hsl(40, 33%, 97%)`) instead of pure
white to reduce eye strain and create a welcoming, editorial aesthetic. The
green primary (`hsl(142, 71%, 45%)`) conveys growth and trust — appropriate
for a freelancer marketplace.

---

## 2. Typography

### Font Family
- **Primary**: `Inter` (Google Fonts)
- **Fallback**: `system-ui, -apple-system, sans-serif`

### Scale

| Class | Size | Weight | Tracking | Usage |
|-------|------|--------|----------|-------|
| `.text-display` | `2rem` | 600 | `-0.04em` | Hero headings |
| `h1` | `2.25rem` | 700 | `tracking-tight` | Page titles |
| `h2` | `1.5rem` | 600 | `tracking-tight` | Section headings |
| `h3` | `1.25rem` | 600 | `tracking-tight` | Card titles |
| Body | `1rem` | 400 | Normal | Paragraph text |
| Small | `0.875rem` | 400 | Normal | Captions, metadata |

### Rules
- All headings use `text-wrap: balance` for better line breaks
- Anti-aliased rendering on all platforms
- Tabular nums (`.tabular-nums`) for price displays

---

## 3. Spacing & Layout

### Base Unit
`0.25rem` (4px) — All spacing uses multiples of 4px.

### Common Spacing

| Tailwind | Pixels | Usage |
|----------|--------|-------|
| `p-2` | 8px | Inner padding (tight) |
| `p-4` | 16px | Default card padding |
| `p-6` | 24px | Section padding |
| `gap-3` | 12px | Card grid gap |
| `gap-4` | 16px | Section gap |
| `mb-8` | 32px | Section margin |

### Border Radius
- `--radius: 0.5rem` (8px) — Default for cards, inputs
- `rounded-full` — Avatars, pills, toggles
- `rounded-lg` — Buttons, modals

---

## 4. Shadows

### Card Shadow
```css
--shadow-card: 0 0 0 1px rgba(60,45,30,.05),
               0 2px 4px rgba(60,45,30,.03),
               0 8px 16px -4px rgba(60,45,30,.06);
```

Use `.shadow-card` utility class. Provides a subtle, warm elevation effect
without harsh drop shadows.

### Dark Mode Shadow
```css
--shadow-card: 0 0 0 1px rgba(255,255,255,.08),
               0 2px 4px rgba(0,0,0,.3),
               0 8px 16px -4px rgba(0,0,0,.5);
```

---

## 5. Component Patterns

### Buttons
- **Primary**: Green background, white text — main CTA actions
- **Secondary**: Orange background — secondary actions
- **Outline**: Border only — tertiary actions
- **Ghost**: No background — navigation, subtle actions
- **Destructive**: Red — delete, danger actions

### Cards (ListingCard)
- White/dark surface with `.shadow-card`
- Image on top (aspect ratio maintained)
- Title, category, price, distance info
- Favorite toggle (heart icon) in top-right
- Emoji badge for visual personality

### Navigation
- **TopBar**: Logo + search + theme toggle (sticky top)
- **BottomNav**: 4-tab mobile navigation (Home, Categories, Map, Profile)
- Static pages (About, Privacy, etc.) hide both TopBar and BottomNav

### Forms
- `react-hook-form` + `zod` for all forms
- shadcn/ui `Input`, `Select`, `Checkbox`, `RadioGroup` primitives
- Error messages below inputs in red
- Loading state on submit buttons

---

## 6. Motion & Animation

### Library: Framer Motion

| Pattern | Duration | Easing | Usage |
|---------|----------|--------|-------|
| Page enter | `0.3s` | `ease-out` | Fade + slide up |
| Card hover | `0.2s` | `ease-in-out` | Scale 1.02 + shadow |
| Modal | `0.25s` | `spring` | Scale from center |
| Toast | `0.3s` | `ease-out` | Slide from bottom |

### Scroll: Lenis
- Smooth scrolling on all pages
- Scroll-to-top on route change
- `60fps` performance target

### Rules
- Never animate layout properties (width, height) — use `transform`
- Use `will-change` sparingly
- Respect `prefers-reduced-motion`

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| Default | `0px` | Mobile (portrait) |
| `sm` | `640px` | Mobile (landscape) |
| `md` | `768px` | Tablet |
| `lg` | `1024px` | Desktop |
| `xl` | `1280px` | Large desktop |

### Mobile-First Approach
All styles are mobile-first. Desktop overrides use `md:` and `lg:` prefixes.

### Bottom Navigation
- Visible on mobile (< `md`)
- Hidden on desktop (≥ `md`)
- Includes safe area padding for notched devices (`.safe-bottom`)

---

## 8. Iconography

### Library: Lucide React
- 24x24 default size
- 1.5px stroke width
- Consistent with Inter font weight

### Custom Elements
- Category emojis (user-selected during listing creation)
- Product/Service type badges (orange/blue color coding)

---

## 9. Accessibility

- All interactive elements have focus-visible outlines
- Color contrast ratios meet WCAG 2.1 AA
- Form labels associated with inputs
- Toast notifications use `role="status"`
- Map markers have aria-labels
- Skip-to-content link (planned)

---

## References

- [Inter Font](https://fonts.google.com/specimen/Inter)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS v3 Docs](https://tailwindcss.com/docs)
- [Framer Motion API](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [Refactoring UI (Book)](https://www.refactoringui.com/)
