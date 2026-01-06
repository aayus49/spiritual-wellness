import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LS_KEYS, lsGet, lsSet, uid } from "../lib/localStorage";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const seed = () => {
  const existing = lsGet(LS_KEYS.USERS, null);
  if (existing) return;

  // Dummy users (local only)
  const users = [
    { id: uid("u"), role: "client", name: "Sarah Client", email: "sarah.client@test.com", password: "test123", avatarUrl: "" },
    { id: uid("u"), role: "practitioner", name: "Emma Practitioner", email: "emma.practitioner@test.com", password: "test123", avatarUrl: "", verified: true },
    { id: uid("u"), role: "practitioner", name: "Noah Practitioner", email: "noah.practitioner@test.com", password: "test123", avatarUrl: "", verified: true },
    { id: uid("u"), role: "admin", name: "Admin", email: "admin@spiritual.com", password: "admin123", avatarUrl: "" },
  ];

  // Seed practitioner profiles (ONLY from registered practitioners)
  const practitioners = users
    .filter(u => u.role === "practitioner")
    .map(u => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      verified: !!u.verified,
      rating: 4.9,
      reviews: 128,
      priceGBP: 50,
      specialties: ["Astrology", "Tarot"],
      bio: "Professional practitioner specializing in astrology and tarot. Calm, practical guidance.",
    }));

  lsSet(LS_KEYS.USERS, users);
  lsSet(LS_KEYS.PRACTITIONERS, practitioners);
  lsSet(LS_KEYS.READINGS, []);
  lsSet(LS_KEYS.APPOINTMENTS, []);
  lsSet(LS_KEYS.SESSION, null);
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => lsGet(LS_KEYS.SESSION, null));

  useEffect(() => {
    seed();
  }, []);

  useEffect(() => {
    lsSet(LS_KEYS.SESSION, session);
  }, [session]);

  const user = useMemo(() => {
    if (!session) return { role: "guest", name: "Guest" };
    return session;
  }, [session]);

  const login = (email, password) => {
    const users = lsGet(LS_KEYS.USERS, []);
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { ok: false, message: "Invalid email or password" };
    setSession({ id: found.id, role: found.role, name: found.name, email: found.email, avatarUrl: found.avatarUrl || "" });
    return { ok: true };
  };

  const logout = () => setSession(null);

  const guestLogin = () => {
    setSession({ id: uid("guest"), role: "guest", name: "Guest", email: "", avatarUrl: "" });
    return { ok: true };
  };

  const register = ({ name, email, password, role }) => {
    const users = lsGet(LS_KEYS.USERS, []);
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { ok: false, message: "Email already exists" };

    const newUser = { id: uid("u"), role, name, email, password, avatarUrl: "", verified: role === "practitioner" ? false : undefined };
    users.push(newUser);
    lsSet(LS_KEYS.USERS, users);

    // If practitioner registers, create profile but NOT verified yet
    if (role === "practitioner") {
      const practitioners = lsGet(LS_KEYS.PRACTITIONERS, []);
      practitioners.push({
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        verified: false,
        rating: 0,
        reviews: 0,
        priceGBP: 40,
        specialties: ["Astrology"],
        bio: "New practitioner profile pending admin approval.",
      });
      lsSet(LS_KEYS.PRACTITIONERS, practitioners);
    }

    setSession({ id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email, avatarUrl: "" });
    return { ok: true };
  };

  const value = { user, login, logout, guestLogin, register, setSession };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
