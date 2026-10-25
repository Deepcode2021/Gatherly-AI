'use client';

import { useSyncExternalStore } from 'react';
import { EventPlan } from '@/types/event';
import { loadAllEvents, STORAGE_KEY_V1 } from '@/utils/storage';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('gatherly-events-updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('gatherly-events-updated', callback);
  };
}

let cachedEvents: EventPlan[] = [];
let cachedRaw: string | null = null;

function getSnapshot(): EventPlan[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY_V1);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedEvents = loadAllEvents();
  }
  return cachedEvents;
}

function getServerSnapshot(): EventPlan[] {
  return [];
}

/**
 * React 19 recommended hook for reading and synchronizing with localStorage
 */
export function useEvents(): EventPlan[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook to retrieve a single event plan reactively
 */
export function useEvent(id: string): EventPlan | null {
  const events = useEvents();
  return events.find((e) => e.id === id) || null;
}
