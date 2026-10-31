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

const EMPTY_EVENTS: EventPlan[] = [];
let cachedRaw: string | null = null;
let cachedEvents: EventPlan[] = EMPTY_EVENTS;
let hasCachedSnapshot = false;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function parseStoredEvents(raw: string): EventPlan[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as StorageDataV1).events)) {
      return EMPTY_EVENTS;
    }

    const validEvents: EventPlan[] = [];
    for (const item of (parsed as StorageDataV1).events) {
      const result = fullEventPlanSchema.safeParse(item);
      if (result.success) {
        validEvents.push(result.data as EventPlan);
      } else if (item && item.id && item.title) {
        validEvents.push(item as EventPlan);
      }
    }

    return validEvents;
  } catch (error) {
    console.error('Failed to parse saved events from localStorage:', error);
    return EMPTY_EVENTS;
  }
}

export function getEventsSnapshot(): EventPlan[] {
  if (!isBrowser()) return EMPTY_EVENTS;

  const raw = window.localStorage.getItem(STORAGE_KEY_V1);
  if (hasCachedSnapshot && raw === cachedRaw) {
    return cachedEvents;
  }

  hasCachedSnapshot = true;
  cachedRaw = raw;
  cachedEvents = raw ? parseStoredEvents(raw) : EMPTY_EVENTS;
  return cachedEvents;
}

export function loadAllEvents(): EventPlan[] {
  return getEventsSnapshot();
}

export function saveAllEvents(events: EventPlan[]): boolean {
  if (!isBrowser()) return false;

  try {
    const payload: StorageDataV1 = {
      version: 1,
      updatedAt: new Date().toISOString(),
      events,
    };
    const raw = JSON.stringify(payload);
    window.localStorage.setItem(STORAGE_KEY_V1, raw);

    cachedRaw = raw;
    cachedEvents = events;
    hasCachedSnapshot = true;

    window.dispatchEvent(new Event('gatherly-events-updated'));
    return true;
  } catch (error) {
    console.error('Failed to save events to localStorage:', error);
    return false;
  }
}

export function getEventById(id: string): EventPlan | null {
  return getEventsSnapshot().find((event) => event.id === id) || null;
}

export function saveEvent(event: EventPlan): boolean {
  const events = getEventsSnapshot();
  const existingIndex = events.findIndex((item) => item.id === event.id);
  const updatedEvent: EventPlan = {
    ...event,
    updatedAt: new Date().toISOString(),
  };

  const nextEvents = [...events];
  if (existingIndex >= 0) {
    nextEvents[existingIndex] = updatedEvent;
  } else {
    nextEvents.unshift(updatedEvent);
  }

  const success = saveAllEvents(nextEvents);
  if (success && isBrowser()) {
    window.localStorage.setItem(ACTIVE_EVENT_KEY, event.id);
  }
  return success;
}

export function deleteEvent(id: string): boolean {
  const filtered = getEventsSnapshot().filter((event) => event.id !== id);
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

export function loadDemoEventIntoStorage(): EventPlan {
  const demo = getDemoEvent();
  saveEvent(demo);
  return demo;
}

export function exportEventAsJSON(event: EventPlan): string {
  return JSON.stringify(event, null, 2);
}

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

export function importEventFromJSON(jsonString: string): {
  success: boolean;
  event?: EventPlan;
  importedCount?: number;
  error?: string;
} {
  try {
    if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
      return {
        success: false,
        error: 'Empty JSON file. Please select a valid Gatherly AI backup file.',
      };
    }

    const cleanJson = jsonString.replace(/^\uFEFF/, '').trim();
    const parsed: unknown = JSON.parse(cleanJson);

    let candidateEvents: unknown[] = [];
    if (Array.isArray(parsed)) {
      candidateEvents = parsed;
    } else if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>;
      if (Array.isArray(record.events)) {
        candidateEvents = record.events;
      } else if (record.event && typeof record.event === 'object') {
        candidateEvents = [record.event];
      } else if (record.data && typeof record.data === 'object') {
        candidateEvents = [record.data];
      } else {
        candidateEvents = [parsed];
      }
    }

    if (candidateEvents.length === 0) {
      return { success: false, error: 'No valid celebration event plans found in file.' };
    }

    const existingEvents = getEventsSnapshot();
    const usedIds = new Set(existingEvents.map((event) => event.id));
    const importedEvents: EventPlan[] = [];

    for (const rawItem of candidateEvents) {
      if (!rawItem || typeof rawItem !== 'object') continue;

      const itemWithId = {
        id: createEventId(),
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
      if (usedIds.has(imported.id)) {
        imported.id = createEventId();
        imported.title = `${imported.title} (Imported)`;
      }

      usedIds.add(imported.id);
      importedEvents.push(imported);
    }

    if (importedEvents.length === 0) {
      return {
        success: false,
        error: 'Invalid plan backup file: None of the entries matched the required event format.',
      };
    }

    const saved = saveAllEvents([...importedEvents, ...existingEvents]);
    if (!saved) {
      return { success: false, error: 'Failed to store the imported plan in local storage.' };
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
