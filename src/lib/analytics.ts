export type EventData = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: EventData) => void;
      identify: (data: EventData) => void;
    };
  }
}

/**
 * Fire-and-forget Umami event. No-ops when the script is blocked, absent, or
 * running off a non-reporting host, so callers never need to guard.
 */
export function track(name: string, data?: EventData): void {
  if (typeof window === "undefined" || !window.umami) return;
  const payload = data
    ? Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined && v !== ""))
    : undefined;
  try {
    window.umami.track(name, payload as EventData);
  } catch {
    /* never let analytics break a click handler */
  }
}
