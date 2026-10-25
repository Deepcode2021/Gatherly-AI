/**
 * Focused regression tests: Key Priorities selector logic
 *
 * Covers:
 * 1. togglePriority adds a priority when under limit
 * 2. togglePriority deselects an already-selected priority
 * 3. Selecting 6 priorities reaches the limit exactly
 * 4. A 7th selection is rejected (returns unchanged array of 6)
 * 5. After reaching limit, deselecting one allows a new selection
 * 6. All 6 selected priorities are preserved in the payload (schema validation)
 */
import { describe, it, expect } from 'vitest';
import { createEventFormSchema } from '@/types/schemas';

const MAX = 6;

/**
 * Pure function mirroring the togglePriority logic in create/page.tsx.
 * Extracted here so we can unit-test it without rendering the component.
 */
function togglePriority(current: string[], priority: string): string[] {
  if (current.includes(priority)) {
    return current.filter((p) => p !== priority);
  }
  if (current.length < MAX) {
    return [...current, priority];
  }
  // At limit — return unchanged
  return current;
}

describe('priorities selector logic', () => {
  // ── Test 1: adds a priority ──────────────────────────────────────────────
  it('adds a priority when below the 6-item limit', () => {
    const result = togglePriority([], 'Live Music');
    expect(result).toEqual(['Live Music']);
  });

  // ── Test 2: deselects a priority ─────────────────────────────────────────
  it('removes a priority when it is already selected', () => {
    const result = togglePriority(['Live Music', 'Photography'], 'Live Music');
    expect(result).toEqual(['Photography']);
  });

  // ── Test 3: exactly 6 selections are allowed ─────────────────────────────
  it('allows exactly 6 priorities to be selected', () => {
    let state: string[] = [];
    const items = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (const item of items) {
      state = togglePriority(state, item);
    }
    expect(state).toHaveLength(6);
    expect(state).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  // ── Test 4: 7th selection is rejected ────────────────────────────────────
  it('rejects a 7th priority and returns the unchanged 6-item array', () => {
    const sixItems = ['A', 'B', 'C', 'D', 'E', 'F'];
    const result = togglePriority(sixItems, 'G');
    expect(result).toHaveLength(6);
    expect(result).not.toContain('G');
    // Original array is not mutated
    expect(result).toEqual(sixItems);
  });

  // ── Test 5: deselect from limit then re-select ───────────────────────────
  it('allows a new selection after deselecting one from a full (6-item) list', () => {
    let state = ['A', 'B', 'C', 'D', 'E', 'F'];
    // Deselect 'F'
    state = togglePriority(state, 'F');
    expect(state).toHaveLength(5);
    // Now 'G' should be accepted
    state = togglePriority(state, 'G');
    expect(state).toHaveLength(6);
    expect(state).toContain('G');
    expect(state).not.toContain('F');
  });

  // ── Test 6: 6 priorities pass the Zod form schema ────────────────────────
  it('validates a form payload with all 6 priorities through createEventFormSchema', () => {
    const sixPriorities = [
      'Memorable Live Food Counters',
      'Candid Photography & Reels',
      'Acoustic Live Music / DJ',
      'Eco-Friendly / Zero Waste',
      'Sentimental Photo Memory Wall',
      'Interactive Games & Quizzes',
    ];

    const payload = {
      title: 'Test Event With 6 Priorities',
      eventType: 'birthday' as const,
      eventDate: '2026-12-31',
      city: 'Mumbai',
      guestCount: 100,
      totalBudget: 50000,
      venueType: 'indoor' as const,
      theme: 'Modern Minimal',
      dietary: 'Mixed',
      accessibility: 'Standard',
      priorities: sixPriorities,
      additionalNotes: '',
    };

    const result = createEventFormSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priorities).toHaveLength(6);
      expect(result.data.priorities).toEqual(sixPriorities);
    }
  });

  // ── Test 7: 7 priorities are rejected by the Zod form schema ─────────────
  it('rejects a form payload with 7 priorities via createEventFormSchema', () => {
    const sevenPriorities = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const payload = {
      title: 'Too Many Priorities',
      eventType: 'birthday' as const,
      eventDate: '2026-12-31',
      city: 'Delhi',
      guestCount: 50,
      totalBudget: 30000,
      venueType: 'outdoor' as const,
      priorities: sevenPriorities,
    };

    const result = createEventFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const prioritiesError = result.error.issues.find((i) =>
        i.path.includes('priorities')
      );
      expect(prioritiesError).toBeDefined();
    }
  });
});
