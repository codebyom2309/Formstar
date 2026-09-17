import React from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useDashboardStore } from "../../store/useDashboardStore";
import { Database, LogOut, LogIn, Sparkles, Code2 } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, loginWithGoogle, logout } = useAuthStore();
  const { setIsSqlModalOpen, setIsInspectorModalOpen } = useDashboardStore();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            SX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base tracking-tight">
                NextForm Studio
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                Phase 2 Ingestion Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Headless Google Form Engine for Next.js &amp; MySQL
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Live TiDB Database Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TiDB Cloud: deform</span>
          </div>

          {/* Groq AI Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Groq AI Ready</span>
          </div>

          {/* Schema Inspector Button */}
          <button
            id="btn-open-schema-inspector"
            onClick={() => setIsInspectorModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-800 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            title="Inspect Google Form FB_PUBLIC_LOAD_DATA_ Extraction"
          >
            <Code2 className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Schema Inspector</span>
            <span className="sm:hidden">Inspect</span>
          </button>

          {/* SQL Schema Button */}
          <button
            id="btn-view-sql-schema"
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors"
            title="View & Copy MySQL / TiDB Schema Queries"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">MySQL Queries</span>
            <span className="sm:hidden">SQL</span>
          </button>

          {/* User Account / Auth */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  {user.email}
                </div>
              </div>

              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                  {user.name?.[0] || "U"}
                </div>
              )}

              <button
                id="btn-signout"
                onClick={() => logout()}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-signin-google"
              onClick={() => loginWithGoogle()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
