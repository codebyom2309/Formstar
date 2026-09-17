import React, { useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { FormRecord } from "../../types";
import {
  ExternalLink,
  Edit3,
  Trash2,
  Pause,
  Play,
  Copy,
  Check,
  Eye,
  Send,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  Loader2,
  Database,
  Plus,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";

export const FormsTable: React.FC = () => {
  const {
    forms,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    toggleStatus,
    deleteForm,
    setSelectedFormForStudio,
    setIsCreateModalOpen,
    openStudio,
    openRunner,
  } = useDashboardStore();

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopy = (slug: string) => {
    const fullUrl = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredForms = forms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.hostedSlug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white/75 backdrop-blur-xl border border-white/90 rounded-2xl sm:rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-white/40 flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            id="input-search-forms"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forms or slug..."
            className="w-full pl-9 pr-3.5 py-2 bg-white/90 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all shadow-2xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 shadow-2xs">
            {(["all", "active", "paused"] as const).map((filter) => (
              <button
                key={filter}
                id={`filter-tab-${filter}`}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === filter
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-bold text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/60 shrink-0">
            {filteredForms.length} {filteredForms.length === 1 ? "Form" : "Forms"}
          </span>
        </div>
      </div>

      {/* Table / Empty State */}
      {isLoading ? (
        <div className="text-center py-20 px-6">
          <Loader2 className="w-8 h-8 mx-auto text-indigo-600 animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-800">Connecting to TiDB Cloud (deform)...</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Fetching saved forms directly from the database</p>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
            {searchQuery ? <Filter className="w-7 h-7" /> : <Database className="w-7 h-7" />}
          </div>
          <h4 className="text-base font-extrabold text-slate-900">
            {searchQuery ? "No matching forms found" : "No forms in TiDB database yet"}
          </h4>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
            {searchQuery
              ? `No forms match "${searchQuery}". Try a different keyword or reset filters.`
              : "Your TiDB 'deform' database is connected. Click 'New Form' to transform your first Google Form."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Form in Database</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile / Narrow Screen Cards View (md:hidden) */}
          <div className="p-3.5 sm:p-4 space-y-3.5 block md:hidden">
            {filteredForms.map((f: FormRecord) => (
              <div
                key={f.id}
                className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-3.5 shadow-2xs hover:shadow-md hover:border-indigo-300/80 transition-all group relative overflow-hidden"
              >
                {/* Subtle top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                {/* Title & Status */}
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => openStudio(f)}
                    className="font-extrabold text-slate-900 text-sm hover:text-indigo-600 text-left transition-colors break-words leading-snug"
                  >
                    {f.title}
                  </button>

                  {f.status === "active" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-800 border border-amber-500/30 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Paused
                    </span>
                  )}
                </div>

                {/* Hosted Slug & Launch Bar */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50/90 border border-slate-200/70">
                  <button
                    onClick={() => openRunner(f.hostedSlug)}
                    className="font-mono text-xs text-indigo-700 hover:text-indigo-900 font-bold truncate flex items-center gap-1.5"
                    title="Open Live Hosted Form"
                  >
                    <span className="truncate">/f/{f.hostedSlug}</span>
                    <ExternalLink className="w-3 h-3 text-indigo-500 shrink-0" />
                  </button>
                  <button
                    id={`btn-copy-mobile-${f.id}`}
                    onClick={() => handleCopy(f.hostedSlug)}
                    className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                    title="Copy hosted URL"
                  >
                    {copiedSlug === f.hostedSlug ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Intelligence Metadata & Metrics */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                  {f.aiExperience?.aiMetadata && (
                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold bg-indigo-50/90 border border-indigo-200/80 px-2 py-0.5 rounded-md text-indigo-700">
                      <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                      <span>{f.aiExperience.aiMetadata.model}</span>
                      <span className="text-indigo-300">•</span>
                      <span className="text-emerald-700">{f.aiExperience.aiMetadata.latencyMs}ms</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 px-2 py-0.5 rounded-md bg-slate-100/80 border border-slate-200/60">
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>{f.viewsCount.toLocaleString()} views</span>
                  </span>
                  {f.submissionsCount > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 px-2 py-0.5 rounded-md bg-emerald-50/80 border border-emerald-200/60">
                      <Send className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{f.submissionsCount} submissions</span>
                    </span>
                  )}
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openStudio(f)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold transition-all shadow-2xs active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Visual Studio</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleStatus(f.id)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
                        f.status === "active"
                          ? "text-amber-700 bg-amber-50/80 hover:bg-amber-100 border-amber-200/80"
                          : "text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 border-emerald-200/80"
                      }`}
                      title={f.status === "active" ? "Pause form" : "Resume form"}
                    >
                      {f.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteForm(f.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                      title="Delete form"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden on mobile) */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Form Title &amp; Slug</th>
                  <th className="py-4 px-6">Google Form Source</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Hosted Views</th>
                  <th className="py-4 px-6">Created</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredForms.map((f: FormRecord) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Title & Slug */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => openStudio(f)}
                        className="font-extrabold text-slate-900 text-sm hover:text-indigo-600 text-left transition-colors block"
                        title="Open in Visual Studio"
                      >
                        {f.title}
                      </button>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <button
                          onClick={() => openRunner(f.hostedSlug)}
                          className="font-mono text-xs text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200/70 transition-colors flex items-center gap-1"
                          title="Open Live Hosted Form Runner"
                        >
                          <span>/f/{f.hostedSlug}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                        <button
                          id={`btn-copy-${f.id}`}
                          onClick={() => handleCopy(f.hostedSlug)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                          title="Copy hosted URL"
                        >
                          {copiedSlug === f.hostedSlug ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* AI Metadata Badge */}
                        {f.aiExperience?.aiMetadata && (
                          <div className="flex items-center gap-1 text-[10px] font-mono font-bold bg-indigo-50/90 border border-indigo-200/80 px-2 py-0.5 rounded-md text-indigo-700">
                            <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                            <span>{f.aiExperience.aiMetadata.model}</span>
                            <span className="text-indigo-300">•</span>
                            <span className="text-emerald-700">{f.aiExperience.aiMetadata.latencyMs}ms</span>
                          </div>
                        )}

                        {f.aiExperience?.form?.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {f.aiExperience.form.category}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Google Form URL */}
                    <td className="py-4 px-6">
                      <a
                        href={f.originalGoogleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline max-w-[200px] truncate"
                        title={f.originalGoogleUrl}
                      >
                        <span className="truncate">Google Form Link</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {f.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Paused
                        </span>
                      )}
                    </td>

                    {/* Hosted Views */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{f.viewsCount.toLocaleString()} views</span>
                      </div>
                    </td>

                    {/* Created */}
                    <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(f.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-toggle-${f.id}`}
                          onClick={() => toggleStatus(f.id)}
                          className={`p-2 rounded-xl transition-all border shadow-2xs ${
                            f.status === "active"
                              ? "text-amber-700 bg-amber-50/80 hover:bg-amber-100 border-amber-200/80"
                              : "text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 border-emerald-200/80"
                          }`}
                          title={f.status === "active" ? "Pause form" : "Resume form"}
                        >
                          {f.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        <button
                          id={`btn-studio-${f.id}`}
                          onClick={() => openStudio(f)}
                          className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 transition-colors shadow-2xs"
                          title="Open Visual Studio"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          id={`btn-delete-${f.id}`}
                          onClick={() => deleteForm(f.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                          title="Delete form"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
