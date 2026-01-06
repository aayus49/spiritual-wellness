import React, { createContext, useContext, useMemo, useState } from "react";
import { LS_KEYS, lsGet, lsSet, uid } from "../lib/localStorage";
import { format } from "date-fns";

const UserDataContext = createContext(null);
export const useUserData = () => useContext(UserDataContext);

export function UserDataProvider({ children }) {
  const [readings, setReadings] = useState(() => lsGet(LS_KEYS.READINGS, []));
  const [appointments, setAppointments] = useState(() => lsGet(LS_KEYS.APPOINTMENTS, []));

  const saveReading = (reading) => {
    const next = [{ id: uid("r"), createdAt: new Date().toISOString(), createdAtLabel: format(new Date(), "PPpp"), ...reading }, ...readings];
    setReadings(next);
    lsSet(LS_KEYS.READINGS, next);
  };

  const deleteReading = (id) => {
    const next = readings.filter(r => r.id !== id);
    setReadings(next);
    lsSet(LS_KEYS.READINGS, next);
  };

  const bookAppointment = (appt) => {
    const next = [{ id: uid("a"), status: "pending", createdAt: new Date().toISOString(), ...appt }, ...appointments];
    setAppointments(next);
    lsSet(LS_KEYS.APPOINTMENTS, next);
  };

  const updateAppointmentStatus = (id, status) => {
    const next = appointments.map(a => (a.id === id ? { ...a, status } : a));
    setAppointments(next);
    lsSet(LS_KEYS.APPOINTMENTS, next);
  };

  const value = useMemo(
    () => ({ readings, appointments, saveReading, deleteReading, bookAppointment, updateAppointmentStatus }),
    [readings, appointments]
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}
