export function vibrate(enabled: boolean, pattern: number | number[]) {
  try {
    if (enabled && typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
  } catch {
    /* Unsupported devices remain silent. */
  }
}
