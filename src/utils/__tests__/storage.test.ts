import { describe, it, expect, beforeEach } from 'vitest';
import {
  exportEventAsJSON,
  importEventFromJSON,
  loadDemoEventIntoStorage,
  getEventById,
  deleteEvent,
} from '../storage';
import { getDemoEvent } from '../demoEvent';

describe('storage & import/export engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exports and imports valid event JSON seamlessly', () => {
    const demo = getDemoEvent();
    const jsonStr = exportEventAsJSON(demo);
    expect(jsonStr).toContain("Aarav's 30th Milestone");

    const result = importEventFromJSON(jsonStr);
    expect(result.success).toBe(true);
    expect(result.event).toBeDefined();
    expect(result.event?.city).toBe('Bhopal, MP');
  });

  it('rejects malformed or invalid JSON payloads during import', () => {
    const invalidJson = '{"not": "a valid event plan"}';
    const result = importEventFromJSON(invalidJson);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('loads and persists the demo celebration event', () => {
    const loaded = loadDemoEventIntoStorage();
    expect(loaded.id).toBe('demo-bhopal-30th-birthday');

    const retrieved = getEventById('demo-bhopal-30th-birthday');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toContain('Aarav');

    // Test deletion
    const deleted = deleteEvent('demo-bhopal-30th-birthday');
    expect(deleted).toBe(true);
    expect(getEventById('demo-bhopal-30th-birthday')).toBeNull();
  });
});
