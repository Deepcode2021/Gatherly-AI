export const EVENT_TABS = ['overview', 'budget', 'timeline', 'vendors', 'ideas'] as const;

export type EventTab = (typeof EVENT_TABS)[number];

export function isEventTab(value: string): value is EventTab {
  return (EVENT_TABS as readonly string[]).includes(value);
}
