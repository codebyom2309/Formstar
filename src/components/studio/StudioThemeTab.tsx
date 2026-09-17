import React from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { Palette, Image as ImageIcon, Type, Sparkles, Check, Layout } from "lucide-react";

const COLOR_PRESETS = [
  { name: "Electric Violet", hex: "#7c3aed" },
  { name: "Ocean Blue", hex: "#2563eb" },
  { name: "Emerald Pine", hex: "#059669" },
  { name: "Sunset Coral", hex: "#e11d48" },
  { name: "Amber Flame", hex: "#d97706" },
  { name: "Indigo Deep", hex: "#4f46e5" },
  { name: "Obsidian Noir", hex: "#0f172a" },
];

const BANNER_PRESETS = [
  {
    name: "Hackathon Stage",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Cyber Neon Code",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Abstract Gradient",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Creative Modern Mesh",
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
  },
];

const LOGO_PRESETS = [
  {
    name: "Trophy Badge",
    url: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "Tech Shield",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&auto=format&fit=crop&q=80",
  },
];

export const StudioThemeTab: React.FC = () => {
  const { currentStudioForm, updateCurrentStudioForm } = useDashboardStore();

  if (!currentStudioForm || !currentStudioForm.jsonConfig) return null;

  const theme = currentStudioForm.jsonConfig.theme || {
    primaryColor: "#7c3aed",
    backgroundColor: "#ffffff",
    borderRadius: "rounded-xl",
    fontFamily: "Inter",
  };

  const meta = currentStudioForm.jsonConfig.meta || {
    title: "",
    description: "",
    targetActionUrl: "",
  };

  const handleUpdateTheme = (patch: Partial<typeof theme>) => {
    updateCurrentStudioForm((draft) => {
      draft.jsonConfig.theme = { ...draft.jsonConfig.theme, ...patch };
      return draft;
    });
  };

  const handleUpdateMeta = (patch: Partial<typeof meta>) => {
    updateCurrentStudioForm((draft) => {
      draft.jsonConfig.meta = { ...draft.jsonConfig.meta, ...patch };
      return draft;
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Brand Accent Color */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Palette className="w-4 h-4 text-purple-600" />
          <span>Brand Primary Color</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {COLOR_PRESETS.map((c) => {
            const isSelected = theme.primaryColor === c.hex;
            return (
              <button
                key={c.hex}
                onClick={() => handleUpdateTheme({ primaryColor: c.hex })}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-purple-600 ring-2 ring-purple-100 bg-purple-50/50"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full shadow-2xs shrink-0 flex items-center justify-center text-white"
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{c.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{c.hex}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <label className="text-xs font-semibold text-slate-600">Custom Hex:</label>
          <input
            type="color"
            value={theme.primaryColor}
            onChange={(e) => handleUpdateTheme({ primaryColor: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
          />
          <input
            type="text"
            value={theme.primaryColor}
            onChange={(e) => handleUpdateTheme({ primaryColor: e.target.value })}
            className="font-mono text-xs text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 w-28 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Typography & Geometry */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Type className="w-4 h-4 text-purple-600" />
          <span>Typography &amp; Border Radius</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Font Family</label>
            <select
              value={theme.fontFamily}
              onChange={(e) => handleUpdateTheme({ fontFamily: e.target.value })}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="Inter">Inter (Clean &amp; Modern)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (High-End SaaS)</option>
              <option value="Outfit">Outfit (Geometric &amp; Friendly)</option>
              <option value="DM Sans">DM Sans (Humanist Tech)</option>
              <option value="Playfair Display">Playfair Display (Editorial)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Corner Radius</label>
            <select
              value={theme.borderRadius}
              onChange={(e) => handleUpdateTheme({ borderRadius: e.target.value as any })}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="rounded-md">Subtle (6px)</option>
              <option value="rounded-lg">Modern (8px)</option>
              <option value="rounded-xl">Smooth (12px - Recommended)</option>
              <option value="rounded-2xl">Pill Smooth (16px)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banner & Logo Media */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
          <ImageIcon className="w-4 h-4 text-purple-600" />
          <span>Form Header Banner &amp; Logo</span>
        </div>

        {/* Banner */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Banner Image URL</label>
            {meta.bannerImageUrl && (
              <button
                type="button"
                onClick={() => handleUpdateMeta({ bannerImageUrl: "" })}
                className="text-[11px] text-red-600 hover:underline"
              >
                Remove Banner
              </button>
            )}
          </div>
          <input
            type="text"
            value={meta.bannerImageUrl || ""}
            onChange={(e) => handleUpdateMeta({ bannerImageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-mono"
          />

          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
            <span className="text-[11px] text-slate-400 shrink-0 font-medium">Presets:</span>
            {BANNER_PRESETS.map((b, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUpdateMeta({ bannerImageUrl: b.url })}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-lg shrink-0 transition-colors"
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Form Logo / Avatar URL</label>
            {meta.logoUrl && (
              <button
                type="button"
                onClick={() => handleUpdateMeta({ logoUrl: "" })}
                className="text-[11px] text-red-600 hover:underline"
              >
                Remove Logo
              </button>
            )}
          </div>
          <input
            type="text"
            value={meta.logoUrl || ""}
            onChange={(e) => handleUpdateMeta({ logoUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>
      </div>
    </div>
  );
};
