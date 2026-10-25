/**
 * Focused regression tests: JSON backup import
 *
 * Covers:
 * 1. Valid exported JSON round-trips correctly and appears in storage
 * 2. Imported event does NOT overwrite existing events — only prepends
 * 3. Duplicate ID gets a new ID on re-import
 * 4. Malformed JSON returns error, existing events untouched
 * 5. Invalid schema returns descriptive error, existing events untouched
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  exportEventAsJSON,
  importEventFromJSON,
  loadAllEvents,
  saveEvent,
  getEventById,
} from '../storage';
import { getDemoEvent } from '../demoEvent';

describe('JSON import regression suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── Test 1: valid round-trip ──────────────────────────────────────────────
  it('imports a valid exported event and it is immediately readable from storage', () => {
    const demo = getDemoEvent();
    const json = exportEventAsJSON(demo);

    const result = importEventFromJSON(json);

    expect(result.success).toBe(true);
    expect(result.event).toBeDefined();
    expect(result.event?.title).toBe(demo.title);
    expect(result.event?.city).toBe(demo.city);

    // Verify it is persisted and loadable
    const stored = getEventById(result.event!.id);
    expect(stored).not.toBeNull();
    expect(stored?.title).toBe(demo.title);
  });

  // ── Test 2: existing events are NOT deleted on import ────────────────────
  it('does not overwrite or delete existing events when a new one is imported', () => {
    // Pre-save two events
    const demo = getDemoEvent();
    demo.id = 'original-event-1';
    demo.title = 'Original Event One';
    saveEvent(demo);

    const demo2 = getDemoEvent();
    demo2.id = 'original-event-2';
    demo2.title = 'Original Event Two';
    saveEvent(demo2);

    expect(loadAllEvents()).toHaveLength(2);

    // Import a fresh event
    const newEvent = getDemoEvent();
    newEvent.id = 'brand-new-event-id';
    newEvent.title = 'Brand New Imported Event';
    const json = exportEventAsJSON(newEvent);

    const result = importEventFromJSON(json);
    expect(result.success).toBe(true);

    // All 3 events must now be in storage
    const all = loadAllEvents();
    expect(all).toHaveLength(3);
    const ids = all.map((e) => e.id);
    expect(ids).toContain('original-event-1');
    expect(ids).toContain('original-event-2');
    expect(ids).toContain('brand-new-event-id');
  });

  // ── Test 3: duplicate ID gets a fresh ID ─────────────────────────────────
  it('assigns a new unique ID when importing an event whose ID already exists', () => {
    const demo = getDemoEvent();
    saveEvent(demo); // save it first

    // Import the same event again — same ID
    const json = exportEventAsJSON(demo);
    const result = importEventFromJSON(json);

    expect(result.success).toBe(true);
    // New ID must be different from the original
    expect(result.event?.id).not.toBe(demo.id);
    // Title should have "(Imported)" appended
    expect(result.event?.title).toContain('(Imported)');

    // Both must exist in storage
    const all = loadAllEvents();
    expect(all).toHaveLength(2);
  });

  // ── Test 4: malformed JSON string ────────────────────────────────────────
  it('returns a descriptive error for malformed JSON and does not touch existing events', () => {
    const demo = getDemoEvent();
    saveEvent(demo);

    const result = importEventFromJSON('{this is not valid json,,,}');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.event).toBeUndefined();

    // Existing event untouched
    expect(loadAllEvents()).toHaveLength(1);
  });

  // ── Test 5: valid JSON but wrong schema ──────────────────────────────────
  it('returns a descriptive Zod error for a JSON object that fails schema validation', () => {
    const demo = getDemoEvent();
    saveEvent(demo);

    // Missing required fields
    const invalid = JSON.stringify({ id: 'bad', title: 'Broken', notAField: true });
    const result = importEventFromJSON(invalid);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid plan backup file');
    expect(result.event).toBeUndefined();

    // Existing event untouched
    expect(loadAllEvents()).toHaveLength(1);
  });

  // ── Test 6: empty string ─────────────────────────────────────────────────
  it('returns a descriptive error for an empty string import', () => {
    const result = importEventFromJSON('');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  // ── Test 7: UTF-8 BOM handled gracefully ──────────────────────────────────
  it('handles files with UTF-8 Byte Order Mark (BOM) without failing JSON.parse', () => {
    const demo = getDemoEvent();
    const jsonWithBom = '\uFEFF' + exportEventAsJSON(demo);
    const result = importEventFromJSON(jsonWithBom);

    expect(result.success).toBe(true);
    expect(result.event).toBeDefined();
    expect(result.event?.title).toBe(demo.title);
  });

  // ── Test 8: Full storage backup wrapper { version: 1, events: [...] } ─────
  it('imports successfully from a storage backup wrapper object', () => {
    const demo = getDemoEvent();
    const wrappedBackup = JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      events: [demo],
    });

    const result = importEventFromJSON(wrappedBackup);
    expect(result.success).toBe(true);
    expect(result.event?.title).toBe(demo.title);
  });

  // ── Test 9: Event array [event1, event2] ─────────────────────────────────
  it('imports multiple events when supplied as an array', () => {
    const demo1 = getDemoEvent();
    demo1.id = 'batch-1';
    demo1.title = 'Batch Event 1';

    const demo2 = getDemoEvent();
    demo2.id = 'batch-2';
    demo2.title = 'Batch Event 2';

    const arrayBackup = JSON.stringify([demo1, demo2]);
    const result = importEventFromJSON(arrayBackup);

    expect(result.success).toBe(true);
    expect(result.importedCount).toBe(2);
    expect(loadAllEvents()).toHaveLength(2);
  });
});
