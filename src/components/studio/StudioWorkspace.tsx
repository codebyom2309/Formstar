import React from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { StudioHeader } from "./StudioHeader";
import { StudioBuilderTab } from "./StudioBuilderTab";
import { StudioThemeTab } from "./StudioThemeTab";
import { StudioOverviewCanvasTab } from "./StudioOverviewCanvasTab";
import { StudioLogicTab } from "./StudioLogicTab";
import { StudioIntegrationsTab } from "./StudioIntegrationsTab";
import { StudioSettingsTab } from "./StudioSettingsTab";
import { StudioShareTab } from "./StudioShareTab";
import { FormRunner } from "../runner/FormRunner";
import {
  Layers,
  Palette,
  BookOpen,
  GitBranch,
  CreditCard,
  Settings,
  Share2,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";

export const StudioWorkspace: React.FC = () => {
  const {
    currentStudioForm,
    activeStudioTab,
    setActiveStudioTab,
    previewViewport,
  } = useDashboardStore();

  const [mobilePane, setMobilePane] = React.useState<"editor" | "preview">("editor");

  if (!currentStudioForm) return null;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      <StudioHeader />

      {/* Mobile Top View Switcher (lg:hidden) */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full max-w-xs">
          <button
            type="button"
            onClick={() => setMobilePane("editor")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
              mobilePane === "editor"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Studio Editor
          </button>
          <button
            type="button"
            onClick={() => setMobilePane("preview")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
              mobilePane === "preview"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Main Studio Body: 2 Columns on Desktop */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Editor Controls & Tabs */}
        <div
          className={`w-full lg:w-[48%] xl:w-[46%] flex flex-col border-r border-slate-200 bg-white overflow-y-auto max-h-[calc(100vh-57px)] ${
            mobilePane === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Sub-tabs header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            <button
              id="tab-builder"
              onClick={() => setActiveStudioTab("builder")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeStudioTab === "builder"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Stepper</span>
            </button>

            <button
              id="tab-theme"
              onClick={() => setActiveStudioTab("theme")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeStudioTab === "theme"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span>Theme</span>
            </button>

            <button
              id="tab-overview"
              onClick={() => setActiveStudioTab("overview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeStudioTab === "overview"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Overview &amp; Rules</span>
            </button>

            <button
              id="tab-logic"
              onClick={() => setActiveStudioTab("logic")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeStudioTab === "logic"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-600" />
              <span>Logic</span>
            </button>

            <button
              id="tab-integrations"
              onClick={() => setActiveStudioTab("integrations")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeStudioTab === "integrations"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              <span>UPI &amp; Alerts</span>
            </button>

            <button
              id="tab-settings"
              onClick={() => setActiveStudioTab("settings")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeStudioTab === "settings"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-purple-600" />
              <span>Settings</span>
            </button>

            <button
              id="tab-share"
              onClick={() => setActiveStudioTab("share")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeStudioTab === "share"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Share</span>
            </button>
          </div>

          {/* Active Tab Content Area */}
          <div className="p-4 md:p-6 flex-1">
            {activeStudioTab === "builder" && <StudioBuilderTab />}
            {activeStudioTab === "theme" && <StudioThemeTab />}
            {activeStudioTab === "overview" && <StudioOverviewCanvasTab />}
            {activeStudioTab === "logic" && <StudioLogicTab />}
            {activeStudioTab === "integrations" && <StudioIntegrationsTab />}
            {activeStudioTab === "settings" && <StudioSettingsTab />}
            {activeStudioTab === "share" && <StudioShareTab />}
          </div>
        </div>

        {/* Right Column: Live Interactive Sandbox Preview */}
        <div
          className={`w-full lg:w-[52%] xl:w-[55%] bg-slate-100 flex flex-col overflow-y-auto max-h-[calc(100vh-57px)] p-3 sm:p-4 md:p-8 ${
            mobilePane === "editor" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Preview Header Banner */}
          <div className="flex items-center justify-between mb-4 bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-xl px-4 py-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Interactive Live Preview Sandbox</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Auto-updating &bull; TiDB ready
            </span>
          </div>

          {/* Viewport Frame Container */}
          <div className="flex-1 flex items-start justify-center">
            <div
              className={`w-full transition-all duration-300 ${
                previewViewport === "mobile"
                  ? "max-w-[400px] my-4 p-3 bg-slate-900 rounded-[36px] shadow-2xl border-4 border-slate-800 ring-1 ring-slate-950"
                  : previewViewport === "tablet"
                  ? "max-w-[768px] my-4 p-4 bg-slate-800 rounded-[28px] shadow-2xl border-2 border-slate-700"
                  : "max-w-3xl"
              }`}
            >
              {/* Device Bezel Top details */}
              {previewViewport === "mobile" && (
                <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-3" />
              )}

              <div
                className={`overflow-y-auto ${
                  previewViewport === "mobile"
                    ? "bg-slate-50 rounded-[26px] p-4 max-h-[720px] scrollbar-thin"
                    : previewViewport === "tablet"
                    ? "bg-slate-50 rounded-[20px] p-6 max-h-[820px] scrollbar-thin"
                    : ""
                }`}
              >
                <FormRunner
                  config={currentStudioForm.jsonConfig}
                  hostedSlug={currentStudioForm.hostedSlug}
                  isSandbox={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
