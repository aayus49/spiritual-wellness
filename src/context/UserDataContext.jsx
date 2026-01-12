// src/context/UserDataContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { useAuth } from "./AuthContext";

const UserDataContext = createContext(null);

function makeId(prefix = "id") {
  try {
    return `${prefix}_${crypto.randomUUID()}`;
  } catch {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  }
}

function normalizePractitioner(p) {
  const services = Array.isArray(p.services) ? p.services : [];
  const safePrice = Number(p.priceGBP || 50);

  // If no services exist, create a default one (so BookingModal isn't empty)
  const normalizedServices =
    services.length > 0
      ? services
      : [
          {
            id: `svc_${p.userId || p.id || "p"}_1`,
            type: "General",
            title: "Initial Consultation",
            description: "A first session to understand your needs and provide guidance.",
            durationMin: 30,
            priceGBP: safePrice,
          },
        ];

  return {
    ...p,
    services: normalizedServices,
    priceGBP: safePrice,
    verified: !!p.verified,
    specialties: Array.isArray(p.specialties) ? p.specialties : [],
    bio: p.bio || "Professional practitioner specializing in astrology and tarot.",
  };
}

export function UserDataProvider({ children }) {
  const { user } = useAuth();

  const [readings, setReadings] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [activity, setActivity] = useState([]);

  const refreshUserData = useCallback(async (uid) => {
    if (!uid) return;

    // 1) Load practitioner directory (all approved practitioners)
    // You can use either verified=true OR practitioner_status="approved"
    // (keep both if you want extra safety)
    const profilesSnap = await getDocs(collection(db, "profiles"));
    const pracList = profilesSnap.docs
      .map((d) => {
        const data = d.data();
        return {
          userId: d.id,
          id: d.id,
          name: data.full_name || data.email?.split("@")?.[0] || "Practitioner",
          email: data.email || null,
          verified: data.verified ?? true,
          practitioner_status: data.practitioner_status || "approved",
          bio: data.bio || "",
          specialties: data.specialties || [],
          priceGBP: data.priceGBP || 50,
          services: data.services || [],
          role: data.role || "client",
        };
      })
      .filter((p) => p.role === "practitioner" && p.practitioner_status === "approved")
      .map((p) => normalizePractitioner(p));

    setPractitioners(pracList);

    // 2) Readings for current user
    // If you want guest to see nothing, that's handled by not calling refresh for guest.
    const readingsQ = query(collection(db, "readings"), where("userId", "==", uid));
    const readingsSnap = await getDocs(readingsQ);
    const readingsList = readingsSnap.docs.map((d) => {
      const r = d.data();
      return {
        id: d.id,
        userId: r.userId,
        type: r.type,
        title: r.title,
        summary: r.summary || "",
        payload: r.payload || null,
        createdAt: r.createdAt?.toDate ? r.createdAt.toDate().toISOString() : null,
      };
    });
    setReadings(
      readingsList.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    );

    // 3) Appointments:
    // Firestore doesn't support OR in a single query easily without extra indexing/structure.
    // So we do 2 queries and merge.
    const clientQ = query(collection(db, "appointments"), where("clientId", "==", uid));
    const practitionerQ = query(collection(db, "appointments"), where("practitionerId", "==", uid));

    const [clientSnap, pracApptSnap] = await Promise.all([getDocs(clientQ), getDocs(practitionerQ)]);

    const mergedMap = new Map();

    clientSnap.docs.forEach((d) => mergedMap.set(d.id, { id: d.id, ...d.data() }));
    pracApptSnap.docs.forEach((d) => mergedMap.set(d.id, { id: d.id, ...d.data() }));

    const merged = Array.from(mergedMap.values())
      .map((a) => ({
        id: a.id,
        clientId: a.clientId,
        clientName: a.clientName,
        practitionerId: a.practitionerId,
        practitionerName: a.practitionerName,
        serviceId: a.serviceId || null,
        serviceTitle: a.serviceTitle || "",
        serviceType: a.serviceType || "",
        durationMin: Number(a.durationMin || 0),
        dateISO: a.dateISO || "",
        timeLabel: a.timeLabel || "",
        priceGBP: Number(a.priceGBP || 0),
        sessionType: a.sessionType || "video",
        note: a.note || "",
        status: a.status || "pending",
        createdAt: a.createdAt?.toDate ? a.createdAt.toDate().toISOString() : null,
      }))
      .sort((x, y) => (y.createdAt || "").localeCompare(x.createdAt || ""));

    setAppointments(merged);
  }, []);

  // ✅ Keep ONLY this auth listener useEffect.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setReadings([]);
        setAppointments([]);
        return;
      }
      try {
        await refreshUserData(firebaseUser.uid);
      } catch (e) {
        console.error("User data fetch error:", e);
      }
    });

    return () => unsub();
  }, [refreshUserData]);

  // -----------------------------
  // CRUD
  // -----------------------------

  async function saveReading({ type, title, summary, payload }) {
    if (!user?.id || user.id === "guest") throw new Error("Login required to save.");

    const docRef = await addDoc(collection(db, "readings"), {
      userId: user.id, // must be Firebase Auth UID
      type: type || "Tarot",
      title: title || "Reading",
      summary: summary || "",
      payload: payload || null,
      createdAt: serverTimestamp(),
    });

    // optimistic UI (optional)
    setReadings((prev) => [
      {
        id: docRef.id,
        userId: user.id,
        type: type || "Tarot",
        title: title || "Reading",
        summary: summary || "",
        payload: payload || null,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setActivity((prev) => [
      { id: makeId("act"), type: "reading_saved", label: `Saved ${title}`, ts: new Date().toISOString() },
      ...prev,
    ]);

    return { id: docRef.id };
  }

  async function deleteReading(id) {
    if (!user?.id || user.id === "guest") throw new Error("Login required.");
    if (!id) return;

    await deleteDoc(doc(db, "readings", id));
    setReadings((prev) => prev.filter((r) => r.id !== id));
  }

  async function createAppointment({
    practitionerId,
    practitionerName,
    serviceId,
    serviceTitle,
    serviceType,
    durationMin,
    dateISO,
    timeLabel,
    priceGBP,
    sessionType,
    note,
  }) {
    if (!user?.id || user.id === "guest") throw new Error("Login required to book.");

    const docRef = await addDoc(collection(db, "appointments"), {
      clientId: user.id, // Auth UID
      clientName: user.name || "Client",
      practitionerId, // Auth UID of practitioner
      practitionerName: practitionerName || "Practitioner",
      serviceId: serviceId || null,
      serviceTitle: serviceTitle || "Service",
      serviceType: serviceType || "General",
      durationMin: Number(durationMin || 0),
      dateISO: dateISO || "",
      timeLabel: timeLabel || "",
      priceGBP: Number(priceGBP || 0),
      sessionType: sessionType || "video",
      note: note || "",
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // optimistic UI
    setAppointments((prev) => [
      {
        id: docRef.id,
        clientId: user.id,
        clientName: user.name || "Client",
        practitionerId,
        practitionerName: practitionerName || "Practitioner",
        serviceId: serviceId || null,
        serviceTitle: serviceTitle || "Service",
        serviceType: serviceType || "General",
        durationMin: Number(durationMin || 0),
        dateISO: dateISO || "",
        timeLabel: timeLabel || "",
        priceGBP: Number(priceGBP || 0),
        sessionType: sessionType || "video",
        note: note || "",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setActivity((prev) => [
      {
        id: makeId("act"),
        type: "booking_created",
        label: `Booked ${practitionerName} (${serviceTitle})`,
        ts: new Date().toISOString(),
      },
      ...prev,
    ]);

    return { id: docRef.id };
  }

  async function updateAppointmentStatus(appointmentId, status) {
    if (!user?.id || user.id === "guest") throw new Error("Login required.");

    const ref = doc(db, "appointments", appointmentId);
    await updateDoc(ref, { status });

    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, status } : a)));

    setActivity((prev) => [
      { id: makeId("act"), type: "appointment_status", label: `Appointment ${status}`, ts: new Date().toISOString() },
      ...prev,
    ]);
  }

  function getPractitionerByUserId(practitionerUserId) {
    return (practitioners || []).find((p) => p.userId === practitionerUserId) || null;
  }

  async function updateMyPractitionerServices(services) {
    if (!user?.id || user.id === "guest") throw new Error("Login required.");
    if (user.role !== "practitioner") throw new Error("Not allowed.");

    // Update profile doc: profiles/{uid}
    const ref = doc(db, "profiles", user.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Practitioner profile missing in Firestore. Create profiles/{UID} first.");

    // Optional: also keep a base price from the first service
    const basePrice = Array.isArray(services) && services.length > 0 ? Number(services[0].priceGBP || 0) : 0;

    await updateDoc(ref, {
      services: Array.isArray(services) ? services : [],
      priceGBP: basePrice,
      updatedAt: serverTimestamp(),
    });

    // Update local practitioner list
    setPractitioners((prev) =>
      prev.map((p) => (p.userId === user.id ? normalizePractitioner({ ...p, services, priceGBP: basePrice }) : p))
    );
  }

  const value = useMemo(
    () => ({
      readings,
      appointments,
      activity,
      practitioners,
      refreshUserData, // exposed for manual refresh if needed
      saveReading,
      deleteReading,
      createAppointment,
      updateAppointmentStatus,
      getPractitionerByUserId,
      updateMyPractitionerServices,
    }),
    [readings, appointments, activity, practitioners, refreshUserData]
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used within UserDataProvider");
  return ctx;
}
