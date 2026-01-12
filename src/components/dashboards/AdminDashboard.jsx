// AdminDashboard.jsx
import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { practitioners, refreshUserData } = useUserData();
  const [savingId, setSavingId] = useState(null);

  const setVerified = async (userId, verified) => {
    setSavingId(userId);
    try {
      await updateDoc(doc(db, "profiles", userId), {
        verified,
        practitioner_status: verified ? "approved" : "pending",
      });
      await refreshUserData(user?.id);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="text-gray-600 mt-1">Verify practitioners to show them in directory.</p>

      <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="text-lg font-semibold text-gray-900">Practitioner Verification</div>
        <div className="mt-4 space-y-3">
          {practitioners.map(p => (
            <div key={p.userId} className="border rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{p.name}</div>
                <div className="text-sm text-gray-600">{p.email}</div>
              </div>
              <div className="flex gap-2">
                {p.verified ? (
                  <button
                    onClick={() => setVerified(p.userId, false)}
                    disabled={savingId === p.userId}
                    className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-60"
                  >
                    Revoke
                  </button>
                ) : (
                  <button
                    onClick={() => setVerified(p.userId, true)}
                    disabled={savingId === p.userId}
                    className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm disabled:opacity-60"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
