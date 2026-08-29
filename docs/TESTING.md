# Aaspass — Testing Guide

> How to write and run tests for the Aaspass project.

---

## Test Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit + integration test runner |
| **Testing Library** | React component testing |
| **jsdom** | Browser environment simulation |
| **Playwright** | End-to-end browser testing |

---

## Running Tests

```bash
# Unit tests (one-shot)
npm run test

# Unit tests (watch mode — re-runs on file change)
npm run test:watch

# E2E tests (requires Playwright browsers installed)
npx playwright install    # First time only
npx playwright test
```

---

## Test File Locations

```
src/
├── hooks/
│   ├── use-favorites.ts
│   └── use-favorites.test.ts     ← Co-located unit test
├── lib/
│   ├── distance.ts
│   └── distance.test.ts          ← Co-located unit test
├── components/
│   ├── ListingCard.tsx
│   └── ListingCard.test.tsx      ← Co-located component test
└── test/
    ├── setup.ts                  ← Global test setup
    └── integration/              ← Integration tests
```

### Convention
- **Unit tests**: Co-located next to the source file (`*.test.ts`)
- **Component tests**: Co-located next to the component (`*.test.tsx`)
- **Integration tests**: `src/test/integration/`
- **E2E tests**: `tests/` (project root, Playwright default)

---

## Writing Unit Tests

### Pure Functions

```typescript
// src/lib/distance.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDistance } from './distance';

describe('calculateDistance', () => {
  it('returns 0 for same coordinates', () => {
    expect(calculateDistance(28.6, 77.2, 28.6, 77.2)).toBe(0);
  });

  it('calculates distance between two cities', () => {
    // Delhi to Mumbai ≈ 1,150 km
    const distance = calculateDistance(28.6139, 77.209, 19.076, 72.8777);
    expect(distance).toBeGreaterThan(1100);
    expect(distance).toBeLessThan(1200);
  });
});
```

### Hooks

```typescript
// src/hooks/use-favorites.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from './use-favorites';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
  },
}));

describe('useFavorites', () => {
  it('toggles favorite state', async () => {
    const { result } = renderHook(() => useFavorites());
    
    await act(async () => {
      await result.current.toggleFavorite('listing-123');
    });
    
    expect(result.current.isFavorited('listing-123')).toBe(true);
  });
});
```

### Components

```typescript
// src/components/ListingCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ListingCard from './ListingCard';

const mockListing = {
  id: '1',
  name: 'Web Development',
  category: 'Web Development',
  type: 'service' as const,
  area: 'Koramangala',
  price: 5000,
  emoji: '💻',
  image_url: null,
};

describe('ListingCard', () => {
  it('renders listing name', () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Web Development')).toBeInTheDocument();
  });

  it('shows area name', () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Koramangala')).toBeInTheDocument();
  });
});
```

---

## Mocking Supabase

### Global Mock Setup

```typescript
// src/test/setup.ts
import { vi } from 'vitest';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));
```

---

## E2E Tests (Playwright)

### Example: Auth Flow

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can navigate to auth page', async ({ page }) => {
  await page.goto('http://localhost:7000');
  await page.click('text=Get Started');
  await expect(page).toHaveURL(/\/auth/);
});

test('auth page shows sign in form', async ({ page }) => {
  await page.goto('http://localhost:7000/auth');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
```

### Running E2E Tests

```bash
# Start dev server first
npm run dev &

# Run Playwright tests
npx playwright test

# Run with UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test tests/auth.spec.ts
```

---

## Test Coverage

```bash
# Generate coverage report
npx vitest run --coverage

# View HTML report
open coverage/index.html
```

### Coverage Targets

| Area | Target |
|------|--------|
| `lib/api/` | > 80% |
| `lib/` (utils) | > 90% |
| `hooks/` | > 70% |
| `components/` | > 50% |
| `pages/` | > 30% (E2E covers these) |

---

## Best Practices

1. **Test behavior, not implementation** — Test what the user sees, not internal state
2. **One assertion per test** — Keep tests focused and descriptive
3. **Mock at boundaries** — Mock Supabase, not internal functions
4. **Use factories** — Create test data helpers instead of inline objects
5. **Name tests clearly** — `it('shows error when email is invalid')` not `it('test 1')`
6. **Clean up** — Reset mocks between tests with `beforeEach(() => vi.clearAllMocks())`

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Playwright Documentation](https://playwright.dev/)
- [Kent C. Dodds — Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Supabase Testing Patterns](https://supabase.com/docs/guides/getting-started/testing)
