'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { EventPlan } from '@/types/event';
import { getEventsSnapshot } from '@/utils/storage';

const SERVER_SNAPSHOT: EventPlan[] = [];

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('storage', callback);
  window.addEventListener('gatherly-events-updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('gatherly-events-updated', callback);
  };
}

function getServerSnapshot(): EventPlan[] {
  return SERVER_SNAPSHOT;
}

export function useEvents(): EventPlan[] {
  return useSyncExternalStore(subscribe, getEventsSnapshot, getServerSnapshot);
}

export function useEvent(id: string): EventPlan | null {
  const events = useEvents();
  return useMemo(() => events.find((event) => event.id === id) ?? null, [events, id]);
}
