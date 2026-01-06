export const LS_KEYS = {
  SESSION: "ip_session",
  USERS: "ip_users",
  PRACTITIONERS: "ip_practitioners",
  READINGS: "ip_readings",
  APPOINTMENTS: "ip_appointments",
  ACTIVITY: "ip_activity",
};

export function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function pushActivity(userId, item) {
  const all = lsGet(LS_KEYS.ACTIVITY, []);
  const next = [{ id: uid("act"), userId, ...item }, ...all].slice(0, 200);
  lsSet(LS_KEYS.ACTIVITY, next);
  return next;
}

export function seedIfEmpty() {
  const users = lsGet(LS_KEYS.USERS, null);
  const practitioners = lsGet(LS_KEYS.PRACTITIONERS, null);

  if (!users) {
    const seededUsers = [
      {
        id: "u_client_sarah",
        role: "client",
        name: "Sarah Client",
        email: "sarah.client@test.com",
        password: "test123",
        avatarDataUrl: "",
      },
      {
        id: "u_prac_emma",
        role: "practitioner",
        name: "Emma Practitioner",
        email: "emma.practitioner@test.com",
        password: "test123",
        avatarDataUrl: "",
      },
      {
        id: "u_prac_noah",
        role: "practitioner",
        name: "Noah Practitioner",
        email: "noah.practitioner@test.com",
        password: "test123",
        avatarDataUrl: "",
      },
      {
        id: "u_admin",
        role: "admin",
        name: "Admin",
        email: "admin@spiritual.com",
        password: "admin123",
        avatarDataUrl: "",
      },
    ];
    lsSet(LS_KEYS.USERS, seededUsers);
  }

  if (!practitioners) {
    const seededPractitioners = [
      {
        userId: "u_prac_emma",
        name: "Emma Practitioner",
        specialties: ["Astrology", "Tarot"],
        bio: "Grounded, structured guidance with a calm approach. Focused on clarity and action.",
        verified: true,
        services: [
          { id: "svc_emma_1", type: "Tarot", title: "Tarot Consultation", durationMin: 30, priceGBP: 45 },
          { id: "svc_emma_2", type: "Astrology", title: "Birth Chart Reading", durationMin: 60, priceGBP: 75 },
        ],
      },
      {
        userId: "u_prac_noah",
        name: "Noah Practitioner",
        specialties: ["Tarot", "Energy Work"],
        bio: "Intuitive readings with practical takeaways. Strong on relationship and career themes.",
        verified: true,
        services: [
          { id: "svc_noah_1", type: "Tarot", title: "3-Card Deep Dive", durationMin: 30, priceGBP: 40 },
          { id: "svc_noah_2", type: "Guidance", title: "Life Direction Session", durationMin: 60, priceGBP: 70 },
        ],
      },
    ];
    lsSet(LS_KEYS.PRACTITIONERS, seededPractitioners);
  }

  if (!lsGet(LS_KEYS.READINGS, null)) lsSet(LS_KEYS.READINGS, []);
  if (!lsGet(LS_KEYS.APPOINTMENTS, null)) lsSet(LS_KEYS.APPOINTMENTS, []);
  if (!lsGet(LS_KEYS.ACTIVITY, null)) lsSet(LS_KEYS.ACTIVITY, []);
}
