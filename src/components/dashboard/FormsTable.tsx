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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            id="input-search-forms"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or slug..."
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto bg-slate-200/70 p-1 rounded-xl">
          {(["all", "active", "paused"] as const).map((filter) => (
            <button
              key={filter}
              id={`filter-tab-${filter}`}
              onClick={() => setStatusFilter(filter)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === filter
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Empty State */}
      {isLoading ? (
        <div className="text-center py-20 px-6">
          <Loader2 className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-700">Connecting to TiDB Cloud (deform)...</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Fetching your saved forms directly from the database</p>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            {searchQuery ? <Filter className="w-7 h-7" /> : <Database className="w-7 h-7" />}
          </div>
          <h4 className="text-base font-bold text-slate-900">
            {searchQuery ? "No matching forms found" : "No forms in TiDB database yet"}
          </h4>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? `No forms match "${searchQuery}". Try a different keyword or reset filters.`
              : "Your TiDB 'deform' database is connected and active. Click 'Create Form' to insert your first Google Form record."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Form in Database</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Cards View (sm:hidden) */}
          <div className="divide-y divide-slate-100 block md:hidden">
            {filteredForms.map((f: FormRecord) => (
              <div key={f.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button
                      onClick={() => openStudio(f)}
                      className="font-bold text-slate-900 text-sm hover:text-blue-600 text-left transition-colors break-words"
                    >
                      {f.title}
                    </button>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <button
                        onClick={() => openRunner(f.hostedSlug)}
                        className="font-mono text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors"
                      >
                        /f/{f.hostedSlug}
                      </button>
                      <button
                        id={`btn-copy-mobile-${f.id}`}
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
                    </div>
                  </div>

                  {f.status === "active" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Paused
                    </span>
                  )}
                </div>

                {/* AI Badge & Stats */}
                <div className="flex items-center justify-between text-xs text-slate-500 gap-2 flex-wrap pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {f.aiExperience?.aiMetadata && (
                      <div className="flex items-center gap-1 text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md text-indigo-700">
                        <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span>{f.aiExperience.aiMetadata.model}</span>
                        <span className="text-indigo-300">•</span>
                        <span className="text-emerald-700">{f.aiExperience.aiMetadata.latencyMs}ms</span>
                      </div>
                    )}
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Eye className="w-3 h-3 text-slate-400" />
                      {f.viewsCount.toLocaleString()} views
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleStatus(f.id)}
                      className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                        f.status === "active"
                          ? "text-amber-600 hover:bg-amber-50"
                          : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                      title={f.status === "active" ? "Pause" : "Resume"}
                    >
                      {f.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openStudio(f)}
                      className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteForm(f.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden on md and smaller) */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Form Title &amp; Slug</th>
                <th className="py-3.5 px-6">Google Form Source</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Hosted Views</th>
                <th className="py-3.5 px-6">Created</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredForms.map((f: FormRecord) => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Title & Slug */}
                  <td className="py-4 px-6">
                    <button
                      onClick={() => openStudio(f)}
                      className="font-bold text-slate-900 text-sm hover:text-purple-600 text-left transition-colors"
                      title="Open in Visual Studio"
                    >
                      {f.title}
                    </button>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <button
                        onClick={() => openRunner(f.hostedSlug)}
                        className="font-mono text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 transition-colors"
                        title="Open Live Hosted Form Runner"
                      >
                        /f/{f.hostedSlug}
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

                      {/* AI Intelligence Metadata Badge */}
                      {f.aiExperience?.aiMetadata && (
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md text-indigo-700">
                          <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          <span>{f.aiExperience.aiMetadata.model}</span>
                          <span className="text-indigo-300">•</span>
                          <span className="text-emerald-700">{f.aiExperience.aiMetadata.latencyMs} ms</span>
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
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline max-w-[220px] truncate"
                      title={f.originalGoogleUrl}
                    >
                      <span className="truncate">View on Google Forms</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    {f.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Paused
                      </span>
                    )}
                  </td>

                  {/* Hosted Views */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{f.viewsCount.toLocaleString()} views</span>
                    </div>
                  </td>

                  {/* Created */}
                  <td className="py-4 px-6 text-xs text-slate-500">
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
                    <div className="flex items-center justify-end gap-1">
                      {/* Pause / Resume Button */}
                      <button
                        id={`btn-toggle-${f.id}`}
                        onClick={() => toggleStatus(f.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          f.status === "active"
                            ? "text-amber-600 hover:bg-amber-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={f.status === "active" ? "Pause Form Submissions" : "Resume Form Submissions"}
                      >
                        {f.status === "active" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>

                      {/* Edit in Studio */}
                      <button
                        id={`btn-studio-${f.id}`}
                        onClick={() => openStudio(f)}
                        className="p-2 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="Customize in Visual Studio"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        id={`btn-delete-${f.id}`}
                        onClick={() => deleteForm(f.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Form"
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
