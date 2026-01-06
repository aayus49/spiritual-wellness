// AdminDashboard.jsx
import React, { useMemo, useState } from "react";
import { LS_KEYS, lsGet, lsSet } from "../../lib/localStorage";

export default function AdminDashboard() {
  const [tick, setTick] = useState(0);

  const practitioners = useMemo(() => lsGet(LS_KEYS.PRACTITIONERS, []), [tick]);

  const setVerified = (userId, verified) => {
    const next = practitioners.map(p => p.userId === userId ? { ...p, verified } : p);
    lsSet(LS_KEYS.PRACTITIONERS, next);
    setTick(t => t + 1);
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
                  <button onClick={() => setVerified(p.userId, false)} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm">Revoke</button>
                ) : (
                  <button onClick={() => setVerified(p.userId, true)} className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm">Approve</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
