import { useEffect, useState } from "react";

/**
 * Part of the day in the DEVICE's own time zone.
 *
 * Resolved after mount so server render and hydration agree (the server has no
 * idea which time zone the phone is in).
 */
export type DayPart = "morning" | "afternoon" | "evening";

export function dayPartForHour(hour: number): DayPart {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

/** The device's IANA time zone, or UTC when unavailable. */
export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function useDayPart(): DayPart {
  const [part, setPart] = useState<DayPart>("morning");

  useEffect(() => {
    const tick = () => setPart(dayPartForHour(new Date().getHours()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return part;
}
