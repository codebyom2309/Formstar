import React, { useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Code,
  QrCode,
  Sparkles,
  Eye,
  Send,
  TrendingUp,
} from "lucide-react";

export const StudioShareTab: React.FC = () => {
  const { currentStudioForm, openRunner } = useDashboardStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!currentStudioForm) return null;

  const publicUrl = `${window.location.origin}?f=${currentStudioForm.hostedSlug}`;
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="800" frameborder="0" style="border:0; border-radius: 16px; overflow: hidden;" allow="camera; microphone"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const views = currentStudioForm.viewsCount || 0;
  const submissions = currentStudioForm.submissionsCount || 0;
  const conversionRate = views > 0 ? ((submissions / views) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 pb-20">
      {/* Live Form URL Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Share2 className="w-4 h-4 text-purple-600" />
          <span>Public Hosted Link</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Your headless form is live and accessible at this URL. Share it directly with participants or link it in your hackathon website buttons.
        </p>

        <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="flex-1 px-3 py-1.5 text-xs font-mono text-slate-800 bg-transparent focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Copied" : "Copy URL"}</span>
          </button>
          <button
            onClick={() => openRunner(currentStudioForm.hostedSlug)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Open Hosted Form"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
            <Code className="w-4 h-4 text-purple-600" />
            <span>Embed on Your Website</span>
          </div>
          <button
            onClick={handleCopyEmbed}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEmbed ? "Copied Embed" : "Copy IFrame"}</span>
          </button>
        </div>

        <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
          {embedCode}
        </pre>
      </div>

      {/* Metrics Snapshot */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span>Real-time TiDB Performance</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Eye className="w-3.5 h-3.5" />
              <span>Impressions</span>
            </div>
            <p className="text-xl font-black text-slate-900">{views}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 text-xs mb-1">
              <Send className="w-3.5 h-3.5" />
              <span>Submissions</span>
            </div>
            <p className="text-xl font-black text-purple-900">{submissions}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conversion</span>
            </div>
            <p className="text-xl font-black text-emerald-900">{conversionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
