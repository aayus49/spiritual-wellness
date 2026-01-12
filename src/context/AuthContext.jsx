import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const DEFAULT_GUEST = { id: null, role: "guest", name: "Guest", email: "" };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_GUEST);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  async function loadProfile(firebaseUser) {
    const uid = firebaseUser.uid;
    const email = firebaseUser.email || "";

    const ref = doc(db, "profiles", uid);
    const snap = await getDoc(ref);

    // If no profile exists, create one as client
    if (!snap.exists()) {
      const profile = {
        email,
        full_name: email.split("@")[0] || "User",
        role: "client",
        practitioner_status: "approved",
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, profile);

      setUser({
        id: uid,
        role: profile.role,
        name: profile.full_name,
        email: profile.email,
      });
      return;
    }

    const p = snap.data();

    setUser({
      id: uid,
      role: p.role || "client",
      name: p.full_name || (email.split("@")[0] || "User"),
      email: p.email || email,
      practitioner_status: p.practitioner_status || null,
    });
  }

  // Listen auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setAuthError("");
      try {
        if (!firebaseUser) {
          setUser(DEFAULT_GUEST);
          return;
        }
        await loadProfile(firebaseUser);
      } catch (e) {
        console.error(e);
        setAuthError(e?.message || "Auth failed");
        setUser(DEFAULT_GUEST);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e?.message || "Invalid email or password" };
    }
  };

  // LOGOUT
  const logout = async () => {
    setAuthError("");
    try {
      await signOut(auth);
      setUser(DEFAULT_GUEST);
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e?.message || "Logout failed" };
    }
  };

  // GUEST
  const guestLogin = async () => {
    setUser(DEFAULT_GUEST);
    return { ok: true };
  };

  // REGISTER
  const register = async ({ name, email, password, role }) => {
    setAuthError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const profile = {
        email,
        full_name: name,
        role: role || "client",
        practitioner_status: role === "practitioner" ? "approved" : "approved",
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "profiles", uid), profile);

      // user will be hydrated by onAuthStateChanged, but set immediately too
      setUser({
        id: uid,
        role: profile.role,
        name: profile.full_name,
        email: profile.email,
        practitioner_status: profile.practitioner_status,
      });

      return { ok: true };
    } catch (e) {
      return { ok: false, message: e?.message || "Register failed" };
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      login,
      logout,
      guestLogin,
      register,
      setUser, // keep if you use it elsewhere
    }),
    [user, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
