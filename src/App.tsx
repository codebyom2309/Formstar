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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-purple-100 selection:text-purple-900">
      <div>
        <Navbar />
        <DashboardView />
      </div>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">NextForm Studio</span>
            <span>&bull;</span>
            <span className="text-purple-600 font-semibold">Production Ready: Multi-Step Logic, UPI &amp; Webhook Engine Active</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            <span>TiDB Cloud Connected:</span>
            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100 font-bold">deform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

