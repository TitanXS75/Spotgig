---
name: frontend-tailwind-shadcn
description: Guidelines and component implementation patterns for React 18, TypeScript, Tailwind CSS, shadcn/ui, and Framer Motion micro-interactions in Aaspass.
---

# Frontend UI & shadcn/ui Skill — Aaspass

## When to Use
Load this skill when creating or updating React UI components, styling responsive layouts with Tailwind CSS, or adding Framer Motion animations and modal dialogs.

---

## 1. Design System Rules & Tokens

- Always use existing HSL tokens from `src/index.css`:
  - `bg-background text-foreground`
  - `bg-primary text-primary-foreground` (Aaspass Green)
  - `bg-secondary text-secondary-foreground` (Warm Orange)
  - `bg-muted text-muted-foreground`
  - `shadow-card` for soft elevation
- Never hardcode raw hex colors like `#22c55e` or `#ff7700` in JSX; use semantic Tailwind classes.
- Use `cn()` from `@/lib/utils` for merging conditional class names.

---

## 2. Component Composition Patterns

### shadcn/ui Primitives
- Import primitives directly from `@/components/ui/<component>`.
- Do not edit files inside `@/components/ui/` manually.
- When composing dialogs, popovers, or sheets, manage open state cleanly:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ContactDialog({ sellerName, phone }: { sellerName: string; phone: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90">Contact Freelancer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact {sellerName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Reach out directly via WhatsApp or Phone:</p>
          <a
            href={`https://wa.me/91${phone}?text=Hi, I found your profile on Aaspass!`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block w-full rounded-md bg-green-600 p-2.5 text-center font-medium text-white hover:bg-green-700"
          >
            Chat on WhatsApp
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 3. Mobile-First & Responsive Guidelines

- Aaspass is heavily accessed on smartphones. Always build mobile view first, then scale with `md:` and `lg:`.
- Bottom navigation space compensation: Use `pb-20 md:pb-6` on scrollable main containers to avoid content being hidden behind `BottomNav`.
- Use `safe-bottom` utility on fixed footers for iPhone home bar padding.

---

## 4. Framer Motion Animations

- Keep animations subtle, fast, and purposeful (150ms–300ms).
- Standard card entrance and hover effect:

```tsx
import { motion } from "framer-motion";

export const cardMotionProps = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: "easeOut" },
  whileHover: { y: -2, transition: { duration: 0.15 } },
};
```
