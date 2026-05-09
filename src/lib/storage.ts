// Tiny typed wrapper around localStorage so we keep all keys in one place.
const KEYS = {
  user:       'lr.user',
  onboarding: 'lr.onboarding',
  parent:     'lr.parent',
  progress:   'lr.progress',
  controls:   'lr.controls',
} as const;

export function load<T>(key: keyof typeof KEYS): T | null {
  try {
    const raw = localStorage.getItem(KEYS[key]);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function save<T>(key: keyof typeof KEYS, value: T) {
  localStorage.setItem(KEYS[key], JSON.stringify(value));
}

export function clear(key: keyof typeof KEYS) {
  localStorage.removeItem(KEYS[key]);
}

export function clearAll() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
