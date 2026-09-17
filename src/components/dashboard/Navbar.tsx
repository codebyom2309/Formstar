import React from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useDashboardStore } from "../../store/useDashboardStore";
import { Database, LogOut, LogIn, Sparkles, Code2 } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, loginWithGoogle, logout } = useAuthStore();
  const { setIsSqlModalOpen, setIsInspectorModalOpen } = useDashboardStore();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm tracking-tight shadow-md shadow-indigo-500/20 ring-1 ring-white/60 shrink-0 transform hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base tracking-tight truncate">
                NextForm <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Studio</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50/90 text-indigo-700 border border-indigo-200/80 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                AI v3.1
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block truncate font-medium">
              Google Forms &rarr; Interactive Web Applications &amp; Ingestion Engine
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Live TiDB Database Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/80 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TiDB Cloud</span>
          </div>

          {/* Schema Inspector Button */}
          <button
            id="btn-open-schema-inspector"
            onClick={() => setIsInspectorModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-indigo-800 hover:text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100 rounded-xl border border-indigo-200/80 transition-all shadow-2xs active:scale-95"
            title="Inspect Google Form Extraction Data"
          >
            <Code2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="hidden sm:inline">Inspector</span>
          </button>

          {/* SQL Schema Button */}
          <button
            id="btn-view-sql-schema"
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-all shadow-2xs active:scale-95"
            title="View & Copy MySQL / TiDB Schema Queries"
          >
            <Database className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="hidden sm:inline">SQL Schema</span>
          </button>

          {/* User Account / Auth */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-1.5 sm:pl-2.5 border-l border-slate-200">
              <div className="text-right hidden xl:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                  {user.email}
                </div>
              </div>

              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white shadow-xs ring-1 ring-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  {user.name?.[0] || "U"}
                </div>
              )}

              <button
                id="btn-signout"
                onClick={() => logout()}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-signin-google"
              onClick={() => loginWithGoogle()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
