import React, { useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import {
  CreditCard,
  QrCode,
  Bell,
  Webhook,
  Send,
  Check,
  Loader2,
  Copy,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export const StudioIntegrationsTab: React.FC = () => {
  const { currentStudioForm, updateCurrentStudioForm } = useDashboardStore();
  const [testingDiscord, setTestingDiscord] = useState(false);
  const [discordTestSuccess, setDiscordTestSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!currentStudioForm) return null;

  const paymentConfig = currentStudioForm.jsonConfig?.payment || { enabled: false };
  const integrationsConfig = currentStudioForm.jsonConfig?.integrations || {};

  const handleUpdatePayment = (patch: Partial<typeof paymentConfig>) => {
    updateCurrentStudioForm((draft) => {
      if (!draft.jsonConfig.payment) {
        draft.jsonConfig.payment = { enabled: false };
      }
      draft.jsonConfig.payment = { ...draft.jsonConfig.payment, ...patch };
      return draft;
    });
  };

  const handleUpdateIntegrations = (patch: Partial<typeof integrationsConfig>) => {
    updateCurrentStudioForm((draft) => {
      if (!draft.jsonConfig.integrations) {
        draft.jsonConfig.integrations = {};
      }
      draft.jsonConfig.integrations = { ...draft.jsonConfig.integrations, ...patch };
      return draft;
    });
  };

  const testDiscordWebhook = async () => {
    if (!integrationsConfig.discordWebhookUrl) return;
    setTestingDiscord(true);
    try {
      await fetch(integrationsConfig.discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "🔔 NextForm Webhook Test Alert",
              description: `Successfully connected to form **${currentStudioForm.title}**!\nYou will receive instant notification embeds here whenever a respondent completes this form.`,
              color: 9332219, // purple
              timestamp: new Date().toISOString(),
              footer: { text: "NextForm Production Engine" },
            },
          ],
        }),
      });
      setDiscordTestSuccess(true);
      setTimeout(() => setDiscordTestSuccess(false), 3000);
    } catch (e) {
      console.warn("Discord ping error:", e);
    }
    setTestingDiscord(false);
  };

  // Generate UPI URI
  const upiId = paymentConfig.upiId || "hackathon@upi";
  const payeeName = paymentConfig.payeeName || "NextGen Hackathon";
  const amount = paymentConfig.amount || 500;
  const note = paymentConfig.note || "Hackathon Registration Fee";
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-purple-600" />
          <span>Payments &amp; Webhook Integrations</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Enable UPI payment verification and configure real-time notifications for every incoming response.
        </p>
      </div>

      {/* Section 1: UPI & Payment Gateway Module */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                UPI Payment &amp; UTR Verification
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Display a dynamic UPI QR code on the runner with copyable VPA, UTR transaction reference capture, and screenshot upload.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={!!paymentConfig.enabled}
              onChange={(e) => handleUpdatePayment({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {paymentConfig.enabled && (
          <div className="pt-4 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
            {/* Left: Settings Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={paymentConfig.upiId || ""}
                  onChange={(e) => handleUpdatePayment({ upiId: e.target.value })}
                  placeholder="e.g. hackathon@okaxis"
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payee / Organization Name
                </label>
                <input
                  type="text"
                  value={paymentConfig.payeeName || ""}
                  onChange={(e) => handleUpdatePayment({ payeeName: e.target.value })}
                  placeholder="e.g. NextGen Tech Club"
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={paymentConfig.amount ?? 500}
                    onChange={(e) => handleUpdatePayment({ amount: parseFloat(e.target.value) || 0 })}
                    placeholder="500"
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Transaction Note
                  </label>
                  <input
                    type="text"
                    value={paymentConfig.note || ""}
                    onChange={(e) => handleUpdatePayment({ note: e.target.value })}
                    placeholder="Team Pass"
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Right: Live Dynamic UPI QR Preview */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Live UPI QR Code Preview
              </span>
              <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs mb-3">
                <img
                  src={upiQrUrl}
                  alt="UPI QR Code"
                  referrerPolicy="no-referrer"
                  className="w-36 h-36 object-contain rounded-lg"
                />
              </div>

              <div className="text-xs font-bold text-slate-900">
                ₹{amount} to {payeeName}
              </div>
              <div className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mt-1">
                {upiId}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Real-time Webhooks (Discord, Slack, Custom) */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Instant Webhook Notifications
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Receive live alerts in your Discord or Slack channel whenever a user submits.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {/* Discord Webhook */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Discord Webhook URL</span>
              </label>

              {integrationsConfig.discordWebhookUrl && (
                <button
                  type="button"
                  onClick={testDiscordWebhook}
                  disabled={testingDiscord}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {testingDiscord ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : discordTestSuccess ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                  <span>{discordTestSuccess ? "Ping Sent!" : "Send Test Ping"}</span>
                </button>
              )}
            </div>

            <input
              type="url"
              value={integrationsConfig.discordWebhookUrl || ""}
              onChange={(e) => handleUpdateIntegrations({ discordWebhookUrl: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Slack Webhook */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Slack Webhook URL</span>
            </label>
            <input
              type="url"
              value={integrationsConfig.slackWebhookUrl || ""}
              onChange={(e) => handleUpdateIntegrations({ slackWebhookUrl: e.target.value })}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Custom HTTP Webhook */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Custom HTTP POST Webhook (JSON payload)</span>
            </label>
            <input
              type="url"
              value={integrationsConfig.customWebhookUrl || ""}
              onChange={(e) => handleUpdateIntegrations({ customWebhookUrl: e.target.value })}
              placeholder="https://api.yourdomain.com/webhooks/form-response"
              className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
