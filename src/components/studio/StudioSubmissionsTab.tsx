import React, { useEffect, useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { FormSubmissionRecord } from "../../types";
import {
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  RefreshCw,
  ExternalLink,
  Eye,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  X,
  Calendar,
  User,
  Mail,
  Hash,
} from "lucide-react";

export const StudioSubmissionsTab: React.FC = () => {
  const {
    currentStudioForm,
    submissions,
    isLoadingSubmissions,
    fetchSubmissions,
    updateSubmissionStatus,
    deleteSubmission,
    exportSubmissionsCsv,
  } = useDashboardStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending" | "flagged">("all");
  const [inspectingSubmission, setInspectingSubmission] = useState<FormSubmissionRecord | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (currentStudioForm?.id) {
      fetchSubmissions(currentStudioForm.id);
    }
  }, [currentStudioForm?.id, fetchSubmissions]);

  if (!currentStudioForm) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Build field label lookup from current form config
  const fieldLabelMap = new Map<string, string>();
  if (currentStudioForm.jsonConfig?.steps) {
    for (const step of currentStudioForm.jsonConfig.steps) {
      for (const card of step.cards || []) {
        for (const field of card.fields || []) {
          fieldLabelMap.set(field.id, field.label);
          if (field.entryCode) {
            fieldLabelMap.set(field.entryCode, field.label);
          }
        }
      }
    }
  }

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter !== "all" && sub.status !== statusFilter) {
      return false;
    }
    if (!search.trim()) return true;

    const q = search.toLowerCase();
    const nameMatch = (sub.respondentName || "").toLowerCase().includes(q);
    const emailMatch = (sub.respondentEmail || "").toLowerCase().includes(q);
    const codeMatch = (sub.submissionCode || "").toLowerCase().includes(q);
    const responsesMatch = JSON.stringify(sub.responses || {}).toLowerCase().includes(q);

    return nameMatch || emailMatch || codeMatch || responsesMatch;
  });

  const verifiedCount = submissions.filter((s) => s.status === "verified").length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const flaggedCount = submissions.filter((s) => s.status === "flagged").length;

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Submissions &amp; Responses</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
              {submissions.length} Total
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Durable responses saved directly in TiDB Cloud with real-time export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-submissions"
            onClick={() => fetchSubmissions(currentStudioForm.id)}
            disabled={isLoadingSubmissions}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingSubmissions ? "animate-spin text-purple-600" : ""}`} />
          </button>

          <button
            id="btn-export-csv"
            onClick={() => exportSubmissionsCsv(currentStudioForm.id)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{submissions.length}</div>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Verified</span>
          <div className="text-xl font-bold text-emerald-800 mt-0.5">{verifiedCount}</div>
        </div>
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pending</span>
          <div className="text-xl font-bold text-amber-800 mt-0.5">{pendingCount}</div>
        </div>
        <div className="bg-rose-50/50 border border-rose-200/80 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Flagged</span>
          <div className="text-xl font-bold text-rose-800 mt-0.5">{flaggedCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search respondent, code, answer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(["all", "verified", "pending", "flagged"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List / Data Grid */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Submissions Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {search || statusFilter !== "all"
              ? "No responses match your filter criteria. Clear filters to see all entries."
              : "Responses submitted through the hosted link or interactive preview will be recorded here in TiDB."}
          </p>
          {(search || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-3 text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Confirmation</th>
                  <th className="py-2.5 px-3">Respondent</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Submitted At</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-purple-700">
                        <span>{sub.submissionCode}</span>
                        <button
                          onClick={() => handleCopy(sub.submissionCode)}
                          className="text-slate-400 hover:text-slate-700"
                          title="Copy Confirmation Code"
                        >
                          {copiedCode === sub.submissionCode ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                        {sub.respondentName || "Anonymous"}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {sub.respondentEmail || "No email provided"}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <select
                        value={sub.status}
                        onChange={(e) =>
                          updateSubmissionStatus(
                            sub.id,
                            e.target.value as "verified" | "pending" | "flagged"
                          )
                        }
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer ${
                          sub.status === "verified"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : sub.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="flagged">Flagged</option>
                      </select>
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingSubmission(sub)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        <button
                          onClick={() => {
                            if (deleteConfirmId === sub.id) {
                              deleteSubmission(sub.id);
                              setDeleteConfirmId(null);
                            } else {
                              setDeleteConfirmId(sub.id);
                              setTimeout(() => setDeleteConfirmId(null), 3000);
                            }
                          }}
                          className={`p-1 rounded-lg transition-colors ${
                            deleteConfirmId === sub.id
                              ? "bg-rose-600 text-white"
                              : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          }`}
                          title={deleteConfirmId === sub.id ? "Click again to confirm delete" : "Delete submission"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Submission Drawer / Modal */}
      {inspectingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Submission {inspectingSubmission.submissionCode}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>
                      {new Date(inspectingSubmission.createdAt).toLocaleString()}
                    </span>
                    <span>&bull;</span>
                    <span className="capitalize font-semibold text-purple-600">
                      {inspectingSubmission.status}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectingSubmission(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Question and Answer breakdown */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Respondent Info Card */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Respondent
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {inspectingSubmission.respondentName || "Anonymous"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Email
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {inspectingSubmission.respondentEmail || "N/A"}
                  </div>
                </div>
              </div>

              {/* Answers Grid */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Recorded Responses
                </h5>

                {Object.keys(inspectingSubmission.responses || {}).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No answers logged.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(inspectingSubmission.responses).map(([key, val]) => {
                      const label = fieldLabelMap.get(key) || key;
                      const isImage = typeof val === "string" && (val.startsWith("http") && (val.includes("cloudinary") || val.includes("image") || val.endsWith(".png") || val.endsWith(".jpg") || val.endsWith(".jpeg")));
                      const isUtr = typeof val === "string" && (val.toUpperCase().startsWith("UTR") || /^[0-9]{12}$/.test(val));

                      return (
                        <div
                          key={key}
                          className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all"
                        >
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {label}
                          </div>

                          {isImage ? (
                            <div className="space-y-2 mt-1">
                              <a
                                href={val}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block relative group rounded-lg overflow-hidden border border-slate-200 max-w-xs"
                              >
                                <img
                                  src={val}
                                  alt="Upload receipt"
                                  referrerPolicy="no-referrer"
                                  className="max-h-40 w-auto object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>View Original</span>
                                </div>
                              </a>
                            </div>
                          ) : isUtr ? (
                            <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-fit">
                              <span>{String(val)}</span>
                              <button
                                onClick={() => handleCopy(String(val))}
                                className="text-emerald-500 hover:text-emerald-800"
                              >
                                {copiedCode === String(val) ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : Array.isArray(val) ? (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {val.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold"
                                >
                                  {String(item)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs font-medium text-slate-900 whitespace-pre-wrap">
                              {String(val)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Technical Audit Trail */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                <div>Client IP: {inspectingSubmission.ipAddress || "127.0.0.1"}</div>
                <div className="truncate">User Agent: {inspectingSubmission.userAgent || "NextForm"}</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Change Status:</span>
                <select
                  value={inspectingSubmission.status}
                  onChange={(e) => {
                    const nextSt = e.target.value as "verified" | "pending" | "flagged";
                    updateSubmissionStatus(inspectingSubmission.id, nextSt);
                    setInspectingSubmission({ ...inspectingSubmission, status: nextSt });
                  }}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>

              <button
                onClick={() => setInspectingSubmission(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
