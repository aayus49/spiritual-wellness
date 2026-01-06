import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LS_KEYS, lsGet, lsSet, uid, pushActivity } from "../lib/localStorage";
import { useAuth } from "./AuthContext";

const UserDataContext = createContext(null);

export function UserDataProvider({ children }) {
  const { user } = useAuth();

  const [readings, setReadings] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [practitioners, setPractitioners] = useState([]);

  useEffect(() => {
    setPractitioners(lsGet(LS_KEYS.PRACTITIONERS, []));
  }, []);

  useEffect(() => {
    const allReadings = lsGet(LS_KEYS.READINGS, []);
    const allAppointments = lsGet(LS_KEYS.APPOINTMENTS, []);
    const allActivity = lsGet(LS_KEYS.ACTIVITY, []);
    const allPractitioners = lsGet(LS_KEYS.PRACTITIONERS, []);

    setPractitioners(allPractitioners);

    if (user?.id && user.id !== "guest") {
      setReadings(allReadings.filter(r => r.userId === user.id));
      setAppointments(
        allAppointments.filter(
          a => a.clientId === user.id || a.practitionerId === user.id
        )
      );
      setActivity(allActivity.filter(x => x.userId === user.id).slice(0, 20));
    } else {
      setReadings([]);
      setAppointments([]);
      setActivity([]);
    }
  }, [user]);

  function saveReading({ type, title, summary, payload }) {
    if (!user?.id || user.id === "guest") throw new Error("Login required to save.");
    const now = new Date();
    const item = {
      id: uid("reading"),
      userId: user.id,
      type,
      title,
      summary: summary || "",
      payload,
      createdAt: now.toISOString(),
      createdAtLabel: now.toLocaleString(),
    };
    const all = lsGet(LS_KEYS.READINGS, []);
    const next = [item, ...all];
    lsSet(LS_KEYS.READINGS, next);
    setReadings(prev => [item, ...prev]);

    const act = pushActivity(user.id, {
      type: "reading_saved",
      label: `Saved ${title}`,
      ts: now.toISOString(),
    });
    setActivity(act.filter(x => x.userId === user.id).slice(0, 20));

    return item;
  }

  function deleteReading(id) {
    const all = lsGet(LS_KEYS.READINGS, []);
    const next = all.filter(r => r.id !== id);
    lsSet(LS_KEYS.READINGS, next);
    setReadings(prev => prev.filter(r => r.id !== id));
  }

  function createAppointment({ practitionerId, practitionerName, serviceId, serviceTitle, serviceType, durationMin, dateISO, timeLabel, priceGBP }) {
    if (!user?.id || user.id === "guest") throw new Error("Login required to book.");

    const now = new Date();
    const appt = {
      id: uid("appt"),
      clientId: user.id,
      clientName: user.name,
      practitionerId,
      practitionerName,
      serviceId,
      serviceTitle,
      serviceType,
      durationMin,
      dateISO,
      timeLabel,
      priceGBP,
      status: "pending",
      createdAt: now.toISOString(),
    };

    const all = lsGet(LS_KEYS.APPOINTMENTS, []);
    const next = [appt, ...all];
    lsSet(LS_KEYS.APPOINTMENTS, next);
    setAppointments(prev => [appt, ...prev]);

    const act = pushActivity(user.id, {
      type: "booking_created",
      label: `Booked ${practitionerName} (${serviceTitle})`,
      ts: now.toISOString(),
    });
    setActivity(act.filter(x => x.userId === user.id).slice(0, 20));

    return appt;
  }

  function updateAppointmentStatus(appointmentId, status) {
    if (!user?.id || user.id === "guest") throw new Error("Login required.");

    const all = lsGet(LS_KEYS.APPOINTMENTS, []);
    const target = all.find(a => a.id === appointmentId);
    if (!target) return;

    // basic role permissions
    const isClient = user.role === "client" && target.clientId === user.id;
    const isPractitioner = user.role === "practitioner" && target.practitionerId === user.id;
    const isAdmin = user.role === "admin";

    const allowed =
      isAdmin ||
      (isClient && status === "cancelled") ||
      (isPractitioner && ["confirmed", "completed", "cancelled"].includes(status));

    if (!allowed) throw new Error("Not allowed.");

    const next = all.map(a => (a.id === appointmentId ? { ...a, status } : a));
    lsSet(LS_KEYS.APPOINTMENTS, next);
    setAppointments(prev => prev.map(a => (a.id === appointmentId ? { ...a, status } : a)));

    // activity for acting user
    const now = new Date();
    const act = pushActivity(user.id, {
      type: "appointment_status",
      label: `Appointment ${status}`,
      ts: now.toISOString(),
    });
    setActivity(act.filter(x => x.userId === user.id).slice(0, 20));
  }

  function getPractitionerByUserId(practitionerUserId) {
    const all = lsGet(LS_KEYS.PRACTITIONERS, []);
    return all.find(p => p.userId === practitionerUserId) || null;
  }

  function updateMyPractitionerServices(services) {
    if (user.role !== "practitioner") throw new Error("Not allowed.");

    const all = lsGet(LS_KEYS.PRACTITIONERS, []);
    const next = all.map(p => (p.userId === user.id ? { ...p, services } : p));
    lsSet(LS_KEYS.PRACTITIONERS, next);
    setPractitioners(next);
  }

  const value = useMemo(
    () => ({
      readings,
      appointments,
      activity,
      practitioners,
      saveReading,
      deleteReading,
      createAppointment,
      updateAppointmentStatus,
      getPractitionerByUserId,
      updateMyPractitionerServices,
    }),
    [readings, appointments, activity, practitioners, user]
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used within UserDataProvider");
  return ctx;
}
