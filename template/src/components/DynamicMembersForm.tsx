import React, { useState } from "react";
import { RegistrationFormData, MemberRole, ROLE_OPTIONS, GOOGLE_FORM_MAPPING } from "../types";
import { UserPlus, Mail, Phone, Building2, Check, ArrowRight, ArrowLeft, Github, AlertCircle } from "lucide-react";
import {
  validateStep,
  isMemberComplete,
  focusAndHighlightField,
  normalizeEmail,
  normalizePhone,
  normalizeGithub,
} from "../lib/stepValidation";

interface DynamicMembersFormProps {
  data: RegistrationFormData;
  onChange: (updates: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DynamicMembersForm: React.FC<DynamicMembersFormProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const [activeMemberTab, setActiveMemberTab] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const teamSizeNum = parseInt(data.teamSize.match(/\d+/)?.[0] || "4", 10);
  // Dynamic Tab Calculation: Team of N yields exactly N - 1 teammate tabs
  const totalNeeded = Math.min(
    Math.max(1, teamSizeNum - 1),
    GOOGLE_FORM_MAPPING.members.length
  );

  const updateMember = (index: number, field: string, value: any) => {
    let normalizedValue = value;
    if (field === "email") {
      normalizedValue = normalizeEmail(value);
    } else if (field === "phone") {
      normalizedValue = normalizePhone(value);
    } else if (field === "github") {
      normalizedValue = normalizeGithub(value);
    }

    const updated = [...data.members];
    if (!updated[index]) {
      updated[index] = {
        name: "",
        email: "",
        phone: "",
        college: data.leader.college || "",
        roles: ["Frontend"],
      };
    }
    (updated[index] as any)[field] = normalizedValue;
    setErrorMessage(null);
    onChange({ members: updated });
  };

  const toggleRole = (index: number, role: MemberRole) => {
    const member = data.members[index];
    if (!member) return;
    const currentRoles = member.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    // Ensure at least one role is selected
    if (newRoles.length === 0) return;

    updateMember(index, "roles", newRoles);
  };

  const handleProceed = () => {
    const validation = validateStep(3, data);
    if (!validation.isValid) {
      setErrorMessage(validation.message || "Please complete all required member details.");
      if (validation.errorMemberIndex !== undefined) {
        setActiveMemberTab(validation.errorMemberIndex);
      }
      setTimeout(() => {
        if (validation.firstErrorFieldId) {
          focusAndHighlightField(validation.firstErrorFieldId);
        }
      }, 50);
      return;
    }
    setErrorMessage(null);
    onNext();
  };

  // Get active member, autofilling college from leader if empty
  const rawMember = data.members[activeMemberTab];
  const activeMember = {
    name: rawMember?.name || "",
    email: rawMember?.email || "",
    phone: rawMember?.phone || "",
    college: rawMember?.college !== undefined && rawMember?.college !== "" 
      ? rawMember.college 
      : (data.leader.college || ""),
    roles: rawMember?.roles || ["Frontend"],
    github: rawMember?.github || "",
  };

  const activeMapping = GOOGLE_FORM_MAPPING.members[activeMemberTab];

  return (
    <div id="members-form-card" className="w-full bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/90 p-6 sm:p-8 shadow-xs transition-colors">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold mb-2.5 border border-cyan-200 dark:border-cyan-800/70">
              <UserPlus className="w-3.5 h-3.5 text-cyan-500" />
              Team Members ({totalNeeded} Teammates)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Step 3: Member Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter details for each member. Member 1 is the Team Leader recorded in Step 2.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800/70">
              Active: Member {activeMemberTab + 2} of {teamSizeNum}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Floating Sub-Bar for Member Navigation (Pinned below stepper) */}
      <div className="sticky top-28 sm:top-32 z-15 backdrop-blur-md bg-white/95 dark:bg-[#0F172A]/95 py-3 -mx-2 px-2 border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {Array.from({ length: totalNeeded }).map((_, idx) => {
            const memberNum = idx + 2;
            const memberData = data.members[idx];
            const isCompleted = isMemberComplete(memberData);
            const isSelected = activeMemberTab === idx;

            return (
              <button
                type="button"
                key={idx}
                id={`member-tab-${memberNum}`}
                onClick={() => {
                  setActiveMemberTab(idx);
                  setErrorMessage(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 active:scale-[0.98] ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-sm ring-2 ring-cyan-500/20"
                    : isCompleted
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
                    : "bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {/* Real-time status badge */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected
                      ? "bg-white/25 text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : memberNum}
                </div>

                <span>
                  Member {memberNum}
                  {memberData?.name ? `: ${memberData.name.split(" ")[0]}` : ""}
                </span>

                {/* Incomplete dot indicator if unselected and not yet filled */}
                {!isCompleted && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="Required fields incomplete" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Member Form Card */}
      <div className="mt-5">
        <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 text-cyan-500 font-bold text-sm shadow-xs">
              M{activeMemberTab + 2}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Member {activeMemberTab + 2} Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Teammate profile &bull; College defaults to Leader's institution
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 2-Col: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`member-${activeMemberTab}-name`} className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id={`member-${activeMemberTab}-name`}
                  placeholder="e.g. Jane Doe"
                  value={activeMember.name}
                  onChange={(e) => updateMember(activeMemberTab, "name", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor={`member-${activeMemberTab}-email`} className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    id={`member-${activeMemberTab}-email`}
                    placeholder="teammate@example.com"
                    value={activeMember.email}
                    onChange={(e) => updateMember(activeMemberTab, "email", e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 2-Col: Phone & College */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`member-${activeMemberTab}-phone`} className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                  <span className="ml-1 text-[11px] font-normal text-slate-400">(10 digits)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    id={`member-${activeMemberTab}-phone`}
                    maxLength={10}
                    placeholder="e.g. 9876543211"
                    value={activeMember.phone}
                    onChange={(e) => updateMember(activeMemberTab, "phone", e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor={`member-${activeMemberTab}-college`} className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    College / Institute <span className="text-rose-500">*</span>
                  </label>
                  {data.leader.college && (
                    <button
                      type="button"
                      onClick={() => updateMember(activeMemberTab, "college", data.leader.college)}
                      className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium active:scale-[0.98]"
                    >
                      Reset to Leader's College
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    id={`member-${activeMemberTab}-college`}
                    placeholder={data.leader.college || "e.g. VNIT / PCE / IIIT"}
                    value={activeMember.college}
                    onChange={(e) => updateMember(activeMemberTab, "college", e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Optional GitHub Profile if supported for this slot (e.g. Member 2) */}
            {activeMapping?.github && (
              <div>
                <label htmlFor={`member-${activeMemberTab}-github`} className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  GitHub Username (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Github className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    id={`member-${activeMemberTab}-github`}
                    placeholder="username (without @ or URL)"
                    value={activeMember.github || ""}
                    onChange={(e) => updateMember(activeMemberTab, "github", e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Technical Roles */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Technical Roles &amp; Focus Domains <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((role) => {
                  const isRoleSelected = activeMember.roles.includes(role);
                  return (
                    <button
                      type="button"
                      key={role}
                      id={`member-role-${role.toLowerCase().replace(/\s+|\//g, "-")}`}
                      onClick={() => toggleRole(activeMemberTab, role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all active:scale-[0.98] ${
                        isRoleSelected
                          ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/40 ring-1 ring-cyan-500/20 font-semibold"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
        <button
          type="button"
          id="back-to-step-2-btn"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Leader Details
        </button>

        <button
          type="button"
          id="proceed-to-step-4-btn"
          onClick={handleProceed}
          className="px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white shadow-md shadow-cyan-500/20"
        >
          <span>Payment &amp; Verify</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
