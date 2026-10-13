export function scheduleIdle(callback: () => void, timeout = 2000) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(id);
  }

  const id = setTimeout(callback, Math.min(timeout, 1000));
  return () => clearTimeout(id);
}
