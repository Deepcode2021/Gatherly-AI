import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { Suspense } from 'react';
import type { EventPlan } from '@/types/event';
import { getDemoEvent } from '@/utils/demoEvent';
import { saveEvent } from '@/utils/storage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

import EventWorkspacePage from '../page';

async function renderWorkspace(event: EventPlan) {
  let result: ReturnType<typeof render> | undefined;

  // Render inside an awaited act scope so the `use(params)` promise settles
  // before assertions (React 19 async client rendering in tests).
  await act(async () => {
    result = render(
      <Suspense fallback={<p>Loading workspace…</p>}>
        <EventWorkspacePage params={Promise.resolve({ id: event.id })} />
      </Suspense>
    );
    // Flush the promise that suspends the route component on first render.
    await Promise.resolve();
  });

  if (!result) throw new Error('Workspace did not render');
  return result;
}

async function renderLoadedWorkspace(event: EventPlan) {
  await renderWorkspace(event);
  await screen.findByRole('heading', { level: 1, name: event.title });
}

describe('Event workspace page', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('keeps hook order stable when an event appears after the not-found state', async () => {
    const event: EventPlan = { ...getDemoEvent(), id: 'evt-hook-order', title: 'Hook Order Event' };

    await renderWorkspace(event);
    expect(await screen.findByText('Event Not Found')).toBeInTheDocument();

    // Saving the event flips the page from the early-return branch to the workspace.
    // If derived values were memoised after a conditional return this would throw.
    await act(async () => {
      saveEvent(event);
    });

    expect(await screen.findByRole('heading', { level: 1, name: event.title })).toBeInTheDocument();
  });

  it('exposes accessible budget inputs and recalculates the memoised summary', async () => {
    const event = getDemoEvent();
    saveEvent(event);
    await renderLoadedWorkspace(event);

    fireEvent.click(screen.getByRole('tab', { name: /Budget Engine/i }));

    const item = event.budgetItems[0];
    const estimated = screen.getByLabelText(`Estimated cost for ${item.description}`);
    const actual = screen.getByLabelText(`Actual cost for ${item.description}`);
    const paid = screen.getByLabelText(`Paid amount for ${item.description}`);

    expect(new Set([estimated, actual, paid]).size).toBe(3);
    // Distinguishable across rows: each row's name carries the item description.
    expect(
      screen.getAllByLabelText(/^Estimated cost for /).length
    ).toBe(event.budgetItems.length);

    fireEvent.change(actual, { target: { value: '500000' } });

    // budgetSummary is memoised on event.budgetItems, so the banner must re-render.
    expect(await screen.findByText(/Budget Limit Exceeded by/i)).toBeInTheDocument();
  });

  it('announces toast updates through a polite status region', async () => {
    const event = getDemoEvent();
    saveEvent(event);
    await renderLoadedWorkspace(event);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');

    fireEvent.click(screen.getByRole('tab', { name: /Budget Engine/i }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete expense item' })[0]);

    expect(status).toHaveTextContent('Expense item removed');
  });

  it('binds the readiness toggle to its breakdown panel', async () => {
    const event = getDemoEvent();
    saveEvent(event);
    await renderLoadedWorkspace(event);

    const collapsed = screen.getByRole('button', { name: 'Show readiness score breakdown' });
    expect(collapsed).toHaveAttribute('aria-expanded', 'false');
    expect(collapsed).toHaveAttribute('aria-controls', 'readiness-breakdown');
    expect(document.getElementById('readiness-breakdown')).not.toBeInTheDocument();

    fireEvent.click(collapsed);

    const expanded = screen.getByRole('button', { name: 'Hide readiness score breakdown' });
    expect(expanded).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('readiness-breakdown')).toBeInTheDocument();
  });

  it('renders overview task rows as native buttons that toggle on activation', async () => {
    const event = getDemoEvent();
    saveEvent(event);
    await renderLoadedWorkspace(event);

    const [firstRow] = screen.getAllByRole('button', { name: /^Mark ".*" as (complete|incomplete)$/ });
    expect(firstRow.tagName).toBe('BUTTON');
    expect(firstRow).toHaveAttribute('type', 'button');

    const before = firstRow.getAttribute('aria-pressed');
    fireEvent.click(firstRow);

    expect(firstRow).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true');
  });

  it('labels the timeline filters and vendor status selects', async () => {
    const event = getDemoEvent();
    saveEvent(event);
    await renderLoadedWorkspace(event);

    fireEvent.click(screen.getByRole('tab', { name: /Timeline & Checklist/i }));
    expect(screen.getByLabelText('Status:').tagName).toBe('SELECT');
    expect(screen.getByLabelText('Category:').tagName).toBe('SELECT');

    fireEvent.click(screen.getByRole('tab', { name: /Vendors Pipeline/i }));
    const vendorSelect = screen.getByLabelText(`Booking status for ${event.vendors[0].service}`);
    expect(vendorSelect.tagName).toBe('SELECT');
  });
});
