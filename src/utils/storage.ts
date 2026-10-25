// Gatherly AI - Versioned Local Storage and Data Access Layer
// Manages GATHERLY_AI_EVENTS_V1 with schema validation, recovery, and JSON import/export

import { EventPlan } from '@/types/event';
import { fullEventPlanSchema } from '@/types/schemas';
import { getDemoEvent } from './demoEvent';

export const STORAGE_KEY_V1 = 'GATHERLY_AI_EVENTS_V1';
export const ACTIVE_EVENT_KEY = 'GATHERLY_AI_ACTIVE_EVENT_ID_V1';

export interface StorageDataV1 {
  version: 1;
  updatedAt: string;
  events: EventPlan[];
}

/**
 * Check if running in browser
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Load all stored events safely
 */
export function loadAllEvents(): EventPlan[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.events)) {
      // Validate individual events, gracefully filtering out unrecoverably corrupt ones
      const validEvents: EventPlan[] = [];
      for (const item of parsed.events) {
        const result = fullEventPlanSchema.safeParse(item);
        if (result.success) {
          validEvents.push(result.data as EventPlan);
        } else {
          // If slight validation drift, attempt graceful retention if has id & title
          if (item && item.id && item.title) {
            validEvents.push(item as EventPlan);
          }
        }
      }
      return validEvents;
    }
    return [];
  } catch (error) {
    console.error('Failed to parse saved events from localStorage:', error);
    return [];
  }
}

/**
 * Save all events into versioned storage
 */
export function saveAllEvents(events: EventPlan[]): boolean {
  if (!isBrowser()) return false;

  try {
    const payload: StorageDataV1 = {
      version: 1,
      updatedAt: new Date().toISOString(),
      events,
    };
    window.localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(payload));
    window.dispatchEvent(new Event('gatherly-events-updated'));
    return true;
  } catch (error) {
    console.error('Failed to save events to localStorage:', error);
    return false;
  }
}

/**
 * Get single event by ID
 */
export function getEventById(id: string): EventPlan | null {
  const events = loadAllEvents();
  return events.find((e) => e.id === id) || null;
}

/**
 * Save or update a single event plan
 */
export function saveEvent(event: EventPlan): boolean {
  const events = loadAllEvents();
  const existingIdx = events.findIndex((e) => e.id === event.id);

  const updatedEvent: EventPlan = {
    ...event,
    updatedAt: new Date().toISOString(),
  };

  let newEvents: EventPlan[];
  if (existingIdx >= 0) {
    newEvents = [...events];
    newEvents[existingIdx] = updatedEvent;
  } else {
    newEvents = [updatedEvent, ...events];
  }

  const success = saveAllEvents(newEvents);
  if (success && isBrowser()) {
    window.localStorage.setItem(ACTIVE_EVENT_KEY, event.id);
  }
  return success;
}

/**
 * Delete an event by ID
 */
export function deleteEvent(id: string): boolean {
  const events = loadAllEvents();
  const filtered = events.filter((e) => e.id !== id);
  const success = saveAllEvents(filtered);
  if (success && isBrowser()) {
    const active = window.localStorage.getItem(ACTIVE_EVENT_KEY);
    if (active === id) {
      if (filtered.length > 0) {
        window.localStorage.setItem(ACTIVE_EVENT_KEY, filtered[0].id);
      } else {
        window.localStorage.removeItem(ACTIVE_EVENT_KEY);
      }
    }
  }
  return success;
}

/**
 * Load or reset the bundled demo celebration event
 */
export function loadDemoEventIntoStorage(): EventPlan {
  const demo = getDemoEvent();
  saveEvent(demo);
  return demo;
}

/**
 * Export a single event as formatted JSON string
 */
export function exportEventAsJSON(event: EventPlan): string {
  return JSON.stringify(event, null, 2);
}

/**
 * Trigger browser file download for event backup
 */
export function downloadEventJSONFile(event: EventPlan): void {
  if (!isBrowser()) return;
  const json = exportEventAsJSON(event);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeTitle = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);
  anchor.href = url;
  anchor.download = `gatherly-plan-${safeTitle}-${event.eventDate}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Validate and import an event plan from JSON string
 * Supports single event JSON, event arrays, and full storage backup wraps
 */
export function importEventFromJSON(jsonString: string): {
  success: boolean;
  event?: EventPlan;
  importedCount?: number;
  error?: string;
} {
  try {
    if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
      return { success: false, error: 'Empty JSON file. Please select a valid Gatherly AI backup file.' };
    }

    // Strip UTF-8 Byte Order Mark (BOM) if present from Windows/Notepad files
    const cleanJson = jsonString.replace(/^\uFEFF/, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Identify candidate event objects (support direct object, array, or { events: [...] } wrap)
    let candidateEvents: unknown[] = [];
    if (Array.isArray(parsed)) {
      candidateEvents = parsed;
    } else if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      if (Array.isArray(obj.events)) {
        candidateEvents = obj.events;
      } else if (obj.event && typeof obj.event === 'object') {
        candidateEvents = [obj.event];
      } else if (obj.data && typeof obj.data === 'object') {
        candidateEvents = [obj.data];
      } else {
        candidateEvents = [parsed];
      }
    }

    if (candidateEvents.length === 0) {
      return { success: false, error: 'No valid celebration event plans found in file.' };
    }

    const importedEvents: EventPlan[] = [];
    for (const rawItem of candidateEvents) {
      if (!rawItem || typeof rawItem !== 'object') continue;

      // Provide fallback ID if missing
      const itemWithId = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...(rawItem as Record<string, unknown>),
      };

      const result = fullEventPlanSchema.safeParse(itemWithId);

      if (!result.success) {
        if (candidateEvents.length === 1) {
          const issue = result.error.issues[0];
          return {
            success: false,
            error: `Invalid plan backup file: ${issue.path.join('.')} - ${issue.message}`,
          };
        }
        continue;
      }

      const imported = result.data as EventPlan;

      // Ensure unique ID on import to avoid clobbering existing event if user wants a duplicate
      const existing = getEventById(imported.id);
      if (existing) {
        imported.id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        imported.title = `${imported.title} (Imported)`;
      }

      saveEvent(imported);
      importedEvents.push(imported);
    }

    if (importedEvents.length === 0) {
      return {
        success: false,
        error: 'Invalid plan backup file: None of the entries matched the required event format.',
      };
    }

    return {
      success: true,
      event: importedEvents[0],
      importedCount: importedEvents.length,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid JSON file';
    return { success: false, error: message };
  }
}
