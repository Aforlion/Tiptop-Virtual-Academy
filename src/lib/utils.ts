/**
 * Calculates user age based on date of birth string.
 */
export function calculateAge(dobString: string): number {
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Returns age bracket for kid adaptation layout rules.
 */
export function getAgeBracket(age: number): 'junior' | 'senior' {
  return age <= 6 ? 'junior' : 'senior';
}

/**
 * Formats an ISO date string into a user-friendly readable date-time format.
 */
export function formatSessionDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Checks if a session is starting soon (default within 10 minutes) or has already started and not ended.
 */
export function isSessionStartingSoon(startTimeStr: string, endTimeStr?: string, minutesBefore = 10): boolean {
  const now = new Date();
  const start = new Date(startTimeStr);
  const diffMs = start.getTime() - now.getTime();
  const diffMins = diffMs / (60 * 1000);
  
  // Starting soon: if it starts in the next `minutesBefore` minutes
  const startingSoon = diffMins >= 0 && diffMins <= minutesBefore;
  
  // Also active if it has already started but has not ended yet
  if (endTimeStr) {
    const end = new Date(endTimeStr);
    const hasStarted = now >= start;
    const hasNotEnded = now < end;
    if (hasStarted && hasNotEnded) {
      return true;
    }
  }

  return startingSoon;
}

/**
 * Cleanly merges CSS classes.
 */
export function cn(...classes: (string | boolean | undefined | null | {[key: string]: boolean})[]): string {
  const result: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (typeof c === 'string') {
      result.push(c);
    } else if (typeof c === 'object') {
      for (const [key, value] of Object.entries(c)) {
        if (value) result.push(key);
      }
    }
  }
  return result.join(' ');
}

/**
 * Generates an ISO date string offset from the current time.
 * Placed in utils.ts to avoid ESLint purity errors in React components.
 */
export function getMockDateOffset(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

