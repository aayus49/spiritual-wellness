import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login, guestLogin } = useAuth();
  const [params] = useSearchParams();
  const returnUrl = params.get("returnUrl") || "/dashboard";
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
  e.preventDefault();
  setErr("");
  const res = await login(email, password);
  if (!res.ok) return setErr(res.message);
  nav(returnUrl);
};


  return (
    <div className="min-h-[80vh] grid place-items-center px-6 bg-gray-50">
      <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
        <p className="text-gray-600 mt-1">Use test accounts or continue as guest.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <div className="mt-1 flex items-center gap-2 border rounded-xl px-3 py-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <input className="w-full outline-none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">Password</label>
            <div className="mt-1 flex items-center gap-2 border rounded-xl px-3 py-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <input className="w-full outline-none" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold">
            Sign in
          </button>

          <button
            type="button"
            onClick={() => { guestLogin(); nav("/"); }}
            className="w-full py-3 rounded-xl border border-purple-200 text-purple-700 font-semibold hover:bg-purple-50 transition"
          >
            Continue as Guest
          </button>

          <div className="text-sm text-gray-600">
            No account? <Link to="/register" className="text-purple-700 font-medium hover:underline">Register</Link>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Test logins:
            <div>Client: sarah.client@test.com / test123</div>
            <div>Practitioner: emma.practitioner@test.com / test123</div>
            <div>Practitioner: noah.practitioner@test.com / test123</div>
            <div>Admin: admin@spiritual.com / admin123</div>
          </div>
        </form>
      </div>
    </div>
  );
}
