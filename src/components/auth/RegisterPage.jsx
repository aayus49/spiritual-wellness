import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [err, setErr] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");
    const res = register(form);
    if (!res.ok) return setErr(res.message);
    nav("/dashboard");
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-gray-700">Full name</label>
            <input className="mt-1 w-full border rounded-xl px-3 py-2 outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input className="mt-1 w-full border rounded-xl px-3 py-2 outline-none" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-700">Password</label>
            <input type="password" className="mt-1 w-full border rounded-xl px-3 py-2 outline-none" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-700">Role</label>
            <select className="mt-1 w-full border rounded-xl px-3 py-2 outline-none" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="client">Client</option>
              <option value="practitioner">Practitioner</option>
            </select>
            {form.role === "practitioner" && (
              <p className="text-xs text-gray-500 mt-1">Practitioner accounts require admin approval before appearing in directory.</p>
            )}
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold">
            Register
          </button>

          <div className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-purple-700 font-medium hover:underline">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
