import React from "react";
import { Link, useLocation } from "react-router-dom";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm text-gray-600 hover:text-gray-900 transition"
    >
      {children}
    </Link>
  );
}

function FooterLinkDark({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm text-white/70 hover:text-white transition"
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  const { pathname } = useLocation();

  // Add more dark routes if needed:
  const isDark = pathname === "/tarot";

  if (isDark) {
    return (
      <footer className="border-t border-white/10 bg-gradient-to-b from-purple-950/60 via-indigo-950/60 to-black">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid gap-10 md:grid-cols-12">
            {/* Brand */}
            <div className="md:col-span-4">
              <div className="text-white font-semibold text-lg tracking-tight">InnerPath</div>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Tarot readings, birth charts with real locations, daily horoscopes, and verified practitioners you can book.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <a
                  href="#"
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white/80 text-xs hover:bg-white/15 transition"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white/80 text-xs hover:bg-white/15 transition"
                >
                  TikTok
                </a>
                <a
                  href="#"
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white/80 text-xs hover:bg-white/15 transition"
                >
                  YouTube
                </a>
              </div>
            </div>

            {/* Sitemap columns */}
            <div className="md:col-span-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-xs font-semibold text-white/90 uppercase tracking-wider">Explore</div>
                <div className="mt-4 space-y-3">
                  <FooterLinkDark to="/">Home</FooterLinkDark>
                  <FooterLinkDark to="/tarot">Tarot</FooterLinkDark>
                  <FooterLinkDark to="/birth-chart">Birth Chart</FooterLinkDark>
                  <FooterLinkDark to="/horoscope">Horoscope</FooterLinkDark>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-white/90 uppercase tracking-wider">Practitioners</div>
                <div className="mt-4 space-y-3">
                  <FooterLinkDark to="/practitioners">Directory</FooterLinkDark>
                  <FooterLinkDark to="/dashboard">My Dashboard</FooterLinkDark>
                  <FooterLinkDark to="/login">Login</FooterLinkDark>
                  <FooterLinkDark to="/register">Register</FooterLinkDark>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-white/90 uppercase tracking-wider">Support</div>
                <div className="mt-4 space-y-3">
                  <a className="text-sm text-white/70 hover:text-white transition" href="#">Help Center</a>
                  <a className="text-sm text-white/70 hover:text-white transition" href="#">Safety</a>
                  <a className="text-sm text-white/70 hover:text-white transition" href="#">Contact</a>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-white/90 uppercase tracking-wider">Legal</div>
                <div className="mt-4 space-y-3">
                  <a className="text-sm text-white/70 hover:text-white transition" href="#">Privacy</a>
                  <a className="text-sm text-white/70 hover:text-white transition" href="#">Terms</a>
                  <a className="text-sm text-white/70 hover:text-white transition" href="#">Disclaimer</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-white/60">© {new Date().getFullYear()} InnerPath. All rights reserved.</div>
            <div className="text-xs text-white/60">
              Entertainment & wellness guidance only — not medical/legal advice.
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Light footer
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="text-gray-900 font-semibold text-lg tracking-tight">InnerPath</div>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Tarot readings, birth charts with real locations, daily horoscopes, and verified practitioners you can book.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs hover:bg-gray-100 transition"
              >
                Instagram
              </a>
              <a
                href="#"
                className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs hover:bg-gray-100 transition"
              >
                TikTok
              </a>
              <a
                href="#"
                className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs hover:bg-gray-100 transition"
              >
                YouTube
              </a>
            </div>
          </div>

          {/* Sitemap columns */}
          <div className="md:col-span-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Explore</div>
              <div className="mt-4 space-y-3">
                <FooterLink to="/">Home</FooterLink>
                <FooterLink to="/tarot">Tarot</FooterLink>
                <FooterLink to="/birth-chart">Birth Chart</FooterLink>
                <FooterLink to="/horoscope">Horoscope</FooterLink>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Practitioners</div>
              <div className="mt-4 space-y-3">
                <FooterLink to="/practitioners">Directory</FooterLink>
                <FooterLink to="/dashboard">My Dashboard</FooterLink>
                <FooterLink to="/login">Login</FooterLink>
                <FooterLink to="/register">Register</FooterLink>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Support</div>
              <div className="mt-4 space-y-3">
                <a className="text-sm text-gray-600 hover:text-gray-900 transition" href="#">Help Center</a>
                <a className="text-sm text-gray-600 hover:text-gray-900 transition" href="#">Safety</a>
                <a className="text-sm text-gray-600 hover:text-gray-900 transition" href="#">Contact</a>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Legal</div>
              <div className="mt-4 space-y-3">
                <a className="text-sm text-gray-600 hover:text-gray-900 transition" href="#">Privacy</a>
                <a className="text-sm text-gray-600 hover:text-gray-900 transition" href="#">Terms</a>
                <a className="text-sm text-gray-600 hover:text-gray-900 transition" href="#">Disclaimer</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-500">© {new Date().getFullYear()} InnerPath. All rights reserved.</div>
          <div className="text-xs text-gray-500">
            Entertainment & wellness guidance only — not medical/legal advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
