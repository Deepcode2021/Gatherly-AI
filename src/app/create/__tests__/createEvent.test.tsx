import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

import CreateEventPage from '../page';

describe('Create event form', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('associates every visible label with its control', () => {
    render(<CreateEventPage />);

    expect(screen.getByLabelText(/Celebration Title/)).toHaveAttribute('id', 'event-title');
    expect(screen.getByLabelText(/Event Type/)).toHaveAttribute('id', 'event-type');
    expect(screen.getByLabelText(/Event Date/)).toHaveAttribute('id', 'event-date');
    expect(screen.getByLabelText(/City or Location/)).toHaveAttribute('id', 'event-city');
  });

  it('labels the step 2 and step 3 controls and custom button groups', () => {
    render(<CreateEventPage />);

    fireEvent.change(screen.getByLabelText(/Celebration Title/), {
      target: { value: 'Test Celebration' },
    });
    fireEvent.change(screen.getByLabelText(/City or Location/), {
      target: { value: 'Bhopal' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));

    expect(screen.getByLabelText(/Expected Guest Count/)).toHaveAttribute('id', 'guest-count');
    expect(screen.getByLabelText(/Total Target Budget/)).toHaveAttribute('id', 'total-budget');
    expect(screen.getByLabelText(/Preferred Theme/)).toHaveAttribute('id', 'event-theme');
    expect(screen.getByRole('group', { name: /Venue Style/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));

    expect(screen.getByLabelText(/Dietary & Catering Preferences/)).toHaveAttribute(
      'id',
      'dietary-prefs'
    );
    expect(screen.getByLabelText(/Accessibility Requirements/)).toHaveAttribute(
      'id',
      'accessibility-reqs'
    );
    expect(screen.getByLabelText(/Additional Instructions/)).toHaveAttribute(
      'id',
      'additional-notes'
    );
    expect(screen.getByRole('group', { name: /Select Key Priorities/ })).toBeInTheDocument();
  });

  it('applies a preset to every field it provides', () => {
    render(<CreateEventPage />);

    fireEvent.click(screen.getByRole('button', { name: /30th Birthday \(Bhopal\)/ }));

    expect(screen.getByLabelText(/Celebration Title/)).toHaveValue(
      "Aarav's 30th Rooftop Sunset Birthday"
    );
    expect(screen.getByLabelText(/City or Location/)).toHaveValue('Bhopal');
    expect(screen.getByLabelText(/Event Type/)).toHaveValue('birthday');

    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));

    expect(screen.getByLabelText(/Preferred Theme/)).toHaveValue('Warm Sunset & Earthy Boho');
    expect(screen.getByRole('button', { name: 'mixed' })).toHaveAttribute('aria-pressed', 'true');
  });
});
