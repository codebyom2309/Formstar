import React, { useEffect } from "react";
import { Navbar } from "./components/dashboard/Navbar";
import { DashboardView } from "./components/dashboard/DashboardView";
import { StudioWorkspace } from "./components/studio/StudioWorkspace";
import { HostedRunnerPage } from "./components/runner/HostedRunnerPage";
import { useDashboardStore } from "./store/useDashboardStore";

export default function App() {
  const { activeView, activeRunnerSlug, openRunner } = useDashboardStore();

  // URL routing check on mount and popstate
  useEffect(() => {
    const checkUrlRoute = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const fSlug = urlParams.get("f");
      const path = window.location.pathname;

      if (fSlug) {
        openRunner(fSlug);
      } else if (path.startsWith("/f/")) {
        const slug = path.replace("/f/", "").split("/")[0];
        if (slug) {
          openRunner(slug);
        }
      }
    };

    checkUrlRoute();
    window.addEventListener("popstate", checkUrlRoute);
    return () => window.removeEventListener("popstate", checkUrlRoute);
  }, [openRunner]);

  if (activeView === "studio") {
    return <StudioWorkspace />;
  }

  if (activeView === "runner") {
    return <HostedRunnerPage slug={activeRunnerSlug || undefined} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900 relative overflow-x-hidden">
      {/* Ambient background glows for true glassmorphism refraction */}
      <div className="ambient-glow-top" />
      <div className="absolute top-40 right-[-100px] w-[500px] h-[500px] rounded-full bg-radial from-blue-400/10 via-indigo-400/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[600px] left-[-100px] w-[450px] h-[450px] rounded-full bg-radial from-purple-400/10 via-pink-400/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <Navbar />
        <DashboardView />
      </div>

      <footer className="relative z-10 border-t border-slate-200/80 bg-white/75 backdrop-blur-md py-6 mt-16 text-center text-xs text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">NextForm Studio</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-indigo-600 font-semibold">Headless Google Form Engine &amp; AI Generator</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TiDB Cloud Connected:</span>
            <span className="px-2 py-0.5 bg-indigo-50/80 text-indigo-700 rounded-md border border-indigo-200/70 font-bold">deform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

