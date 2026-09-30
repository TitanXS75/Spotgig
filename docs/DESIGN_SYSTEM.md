# Aaspass — Design System

> Visual design tokens, component patterns, and UI guidelines.

---

## 1. Color Palette

### Named Palette Specification

| Token | HSL | Hex |
|-------|-----|-----|
| `--dark-amaranth` | `339 54% 28%` | `#6d213c` |
| `--toffee-brown` | `26 36% 43%` | `#946846` |
| `--sand` | `49 37% 57%` | `#baab68` |
| `--metallic-gold` | `42 67% 66%` | `#e3c16f` |
| `--canary-yellow` | `62 100% 72%` | `#faff70` |

### Light Theme

| Token | HSL | Hex / Color | Usage |
|-------|-----|-------------|-------|
| `--background` | `45 30% 98%` | `#fbfbf8` | Warm ivory canvas |
| `--foreground` | `339 35% 12%` | `#29141b` | Primary text (deep amaranth charcoal, 16.7:1 AAA contrast) |
| `--card` | `0 0% 100%` | `#ffffff` | Elevated pure white card surfaces |
| `--primary` | `339 54% 28%` | `#6d213c` | CTA buttons, active states (Dark Amaranth) |
| `--primary-foreground` | `0 0% 100%` | `#ffffff` | High-contrast white text on primary (10.8:1 AAA contrast) |
| `--secondary` | `26 36% 43%` | `#946846` | Secondary buttons & product badges (Toffee Brown) |
| `--secondary-foreground` | `0 0% 100%` | `#ffffff` | High-contrast white text on secondary (AAA compliant) |
| `--muted` | `45 25% 93%` | `#f2efe9` | Warm sand cream backgrounds |
| `--muted-foreground` | `26 22% 40%` | `#7c6350` | Secondary text, captions, metadata (5.4:1 AA contrast) |
| `--accent` | `42 60% 92%` | `#f8eccf` | Soft gold hover & focus wash |
| `--accent-foreground` | `339 54% 28%` | `#6d213c` | Dark amaranth interactive active text |
| `--destructive` | `0 84% 60%` | `#ef4444` | Error states, delete actions |
| `--border` | `45 20% 88%` | `#e5e2db` | Subtle warm sand card borders, dividers |
| `--accent-product` | `26 36% 43%` | `#946846` | Product type badge (Toffee Brown) |
| `--accent-service` | `42 67% 45%` | `#c2992d` | Service type badge (Metallic Gold) |

### Dark Theme

| Token | HSL | Hex / Color | Usage |
|-------|-----|-------------|-------|
| `--background` | `339 35% 7%` | `#180c10` | Deep velvet amaranth-black (18.4:1 contrast) |
| `--foreground` | `60 20% 98%` | `#fbfbf9` | Warm ivory typography |
| `--card` | `339 25% 11%` | `#24141b` | Elevated dark amaranth card surfaces |
| `--primary` | `42 67% 66%` | `#e3c16f` | CTA buttons, active states (radiant Metallic Gold) |
| `--primary-foreground` | `339 54% 16%` | `#3f1222` | Deep amaranth text on gold (9.0:1 AAA contrast) |
| `--secondary` | `49 37% 57%` | `#baab68` | Secondary buttons & product badges (Sand) |
| `--secondary-foreground` | `339 54% 14%` | `#370e1c` | Deep amaranth text on sand (7.3:1 AAA contrast) |
| `--muted` | `339 20% 15%` | `#2d2025` | Deep muted amaranth backgrounds |
| `--muted-foreground` | `49 20% 68%` | `#beb89d` | Soft golden sand text (9.6:1 AAA contrast) |
| `--accent` | `339 30% 18%` | `#3c202a` | Warm amaranth hover wash |
| `--accent-foreground` | `42 67% 72%` | `#e8cb80` | Glowing gold hover text |
| `--border` | `339 18% 18%` | `#36282e` | Subtle amaranth borders |
| `--accent-product` | `26 50% 60%` | `#ba8f73` | Product type badge (Toffee Gold) |
| `--accent-service` | `42 67% 66%` | `#e3c16f` | Service type badge (Metallic Gold) |

### Design Rationale
The platform adopts an artisanal, warm, luxurious earth-and-gold aesthetic:
- **Light mode**: Warm ivory canvas (`#fbfbf8`) anchored with commanding Dark Amaranth (`#6d213c`) CTAs, Toffee Brown (`#946846`) secondary actions, and subtle warm sand dividers.
- **Dark mode**: An opulent velvet amaranth-black foundation (`#180c10`) where radiant Metallic Gold (`#e3c16f`) and Canary Yellow (`#faff70`) shine with 9:1+ AAA contrast and warm amber rim lighting.

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
