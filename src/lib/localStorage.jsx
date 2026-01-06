export const LS_KEYS = {
  USERS: "sw_users",
  SESSION: "sw_session",
  PRACTITIONERS: "sw_practitioners",
  READINGS: "sw_readings",
  APPOINTMENTS: "sw_appointments",
};

export function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
