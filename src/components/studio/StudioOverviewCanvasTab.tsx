import React, { useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { OverviewRulesConfig } from "../../types";
import { OverviewDrawer } from "../runner/OverviewDrawer";
import {
  BookOpen,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  ShieldCheck,
  Plus,
  Trash2,
  Phone,
  Mail,
  ExternalLink,
  Eye,
  GitBranch,
  Layers,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Sliders,
  Play,
  RotateCcw,
} from "lucide-react";

const PRESETS: { name: string; description: string; data: OverviewRulesConfig }[] = [
  {
    name: "Hackathon & Sprint (Default)",
    description: "Multi-round hackathon with team rules, prototype sprints & helpdesk",
    data: {
      title: "HackX 2026",
      organization: "TeleEra@PCE",
      badge: "Official Portal",
      location: "Priyadarshini College of Engineering (PCE), Nagpur",
      deadline: "Closes on October 1st, 2026 at 00:00 (Midnight)",
      commencement: "October 3rd – 5th, 2026 • On-Campus Problem Reveal & Prototype Sprints",
      teamSize: "2 to 5 Members per Team",
      fee: "₹650.00 / Team",
      guidelines: [
        "All team members must carry valid College / University ID cards during on-campus rounds.",
        "Only original work and repositories initialized during the 36-hour sprint will be evaluated.",
        "Cross-department and inter-collegiate teams are welcome and encouraged.",
        "Leader is responsible for team communications and submitting official GitHub/Demo links.",
        "Zero-tolerance policy for plagiarism; verified external APIs and open libraries are permitted.",
      ],
      rounds: [
        {
          name: "Round 1: Registration & Problem Statements",
          date: "Sep 20 – Oct 1, 2026",
          details: "Fill registration, select problem track, and verify leader contact credentials.",
        },
        {
          name: "Round 2: On-Campus Prototype Sprint",
          date: "Oct 3 – Oct 4, 2026",
          details: "36-hour nonstop sprint at PCE Innovation Wing with mentor checkpoints.",
        },
        {
          name: "Round 3: Grand Jury Finale & Demos",
          date: "Oct 5, 2026 (2:00 PM)",
          details: "Top 10 teams present working prototypes live to industry leaders and investors.",
        },
      ],
      contacts: [
        {
          role: "Lead Organizer",
          name: "Ujjwal Barange",
          phone: "+91 7987494482",
          email: "ujjwal.barange@gmail.com",
        },
        {
          role: "Technical Coordinator",
          name: "Om Satange",
          phone: "+91 7249346921",
          email: "omsatange5788@gmail.com",
        },
      ],
    },
  },
  {
    name: "Tech Symposium & Paper Meet",
    description: "Academic competition with track presentation rules and faculty desks",
    data: {
      title: "TechnoQuest Symposium 2026",
      organization: "Dept of Computer Science & Engineering",
      badge: "IEEE Student Chapter",
      location: "Main Auditorium, Science Block",
      deadline: "Closes on October 15th, 2026 at 11:59 PM",
      commencement: "October 20th – 21st, 2026 • Paper Presentations & Poster Exhibits",
      teamSize: "1 to 3 Authors per Paper",
      fee: "₹400.00 / Paper",
      guidelines: [
        "Abstracts must adhere strictly to the two-column IEEE conference paper template.",
        "At least one co-author must be present physically for the presentation Q&A session.",
        "Presentations are allotted 10 minutes (7 min presentation + 3 min jury viva).",
        "Selected papers will be archived in the annual peer-reviewed proceedings repository.",
      ],
      rounds: [
        {
          name: "Phase 1: Abstract & Draft Review",
          date: "Through Oct 15, 2026",
          details: "Peer review of submitted abstracts and paper manuscripts by review panel.",
        },
        {
          name: "Phase 2: Live Podium Presentation",
          date: "Oct 20, 2026 (9:30 AM)",
          details: "Oral presentation in respective subject tracks before the department jury.",
        },
      ],
      contacts: [
        {
          role: "Faculty In-Charge",
          name: "Dr. R. K. Sharma",
          phone: "+91 9823100000",
          email: "rksharma@pce.edu",
        },
      ],
    },
  },
  {
    name: "Design Sprint & Workshop",
    description: "Hands-on UI/UX sprint with workshop prerequisites and mentor desks",
    data: {
      title: "UI/UX Design Jam 2026",
      organization: "Creative Tech Society",
      badge: "Hands-on Sprint",
      location: "Design Studio & Virtual Discord",
      deadline: "Closes on November 5th, 2026",
      commencement: "November 8th, 2026 • 10:00 AM to 6:00 PM IST",
      teamSize: "Solo or Duo (1-2 Designers)",
      fee: "₹250.00 / Participant",
      guidelines: [
        "Figma or Penpot files must be submitted with full component variants and auto-layout.",
        "Interactive prototypes must be clickable on both mobile (390px) and desktop views.",
        "Participants must bring their own laptops with Figma installed or active web browser.",
      ],
      rounds: [
        {
          name: "Design Brief Release",
          date: "Nov 8, 2026 (10:00 AM)",
          details: "Secret problem statement revealed with design persona and constraint guidelines.",
        },
        {
          name: "Prototype Submission & Critique",
          date: "Nov 8, 2026 (5:00 PM)",
          details: "Final Figma link submission followed by peer critique and mentor grading.",
        },
      ],
      contacts: [
        {
          role: "Design Mentor",
          name: "Priya Deshmukh",
          phone: "+91 8800112233",
          email: "priya.ux@creativetech.org",
        },
      ],
    },
  },
];

export const StudioOverviewCanvasTab: React.FC = () => {
  const { currentStudioForm, updateCurrentStudioForm } = useDashboardStore();

  const [activeViewMode, setActiveViewMode] = useState<"canvas" | "editor" | "architecture">("canvas");
  const [isTestDrawerOpen, setIsTestDrawerOpen] = useState(false);
  const [newGuideline, setNewGuideline] = useState("");
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!currentStudioForm || !currentStudioForm.jsonConfig) return null;

  const jsonConfig = currentStudioForm.jsonConfig;
  const overview: OverviewRulesConfig = jsonConfig.overviewRules || {};
  const meta = jsonConfig.meta || { title: currentStudioForm.title, description: "" };
  const payment = jsonConfig.payment;
  const logic = jsonConfig.logic;
  const steps = jsonConfig.steps || [];

  // Fallback values for display
  const title = overview.title || meta.title || "Form Event Overview";
  const organization = overview.organization || "TeleEra@PCE";
  const badge = overview.badge || "Official Portal";
  const location = overview.location || "Priyadarshini College of Engineering (PCE), Nagpur";
  const deadline = overview.deadline || "Closes on October 1st, 2026 at 00:00 (Midnight)";
  const commencement = overview.commencement || "October 3rd – 5th, 2026 • On-Campus Problem Reveal";
  const teamSize = overview.teamSize || "2 to 5 Members per Team";
  const fee = overview.fee || (payment?.amount ? `₹${payment.amount}.00 / Team` : "₹650.00 / Team");
  const guidelines = overview.guidelines && overview.guidelines.length > 0 ? overview.guidelines : [
    "All participants must carry valid institutional ID cards.",
    "Only original solutions created during the event will be eligible for awards.",
    "Inter-disciplinary and cross-college teams are welcome.",
    "Respect organizers, mentors, and fellow attendees at all times.",
  ];
  const rounds = overview.rounds && overview.rounds.length > 0 ? overview.rounds : [
    {
      name: "Phase 1: Online Registration",
      date: "Active Now",
      details: "Submit team details and verify leader credentials.",
    },
    {
      name: "Phase 2: On-Campus Rounds",
      date: "October 3rd – 5th, 2026",
      details: "Live problem solving, prototyping, and evaluation.",
    },
  ];
  const contacts = overview.contacts && overview.contacts.length > 0 ? overview.contacts : [
    {
      role: "Lead Organizer",
      name: "Ujjwal Barange",
      phone: "+91 7987494482",
      email: "ujjwal.barange@gmail.com",
    },
  ];

  const updateOverview = (patch: Partial<OverviewRulesConfig>) => {
    updateCurrentStudioForm((draft) => {
      draft.jsonConfig.overviewRules = {
        ...(draft.jsonConfig.overviewRules || {}),
        ...patch,
      };
      return draft;
    });
  };

  const applyPreset = (presetData: OverviewRulesConfig) => {
    updateCurrentStudioForm((draft) => {
      draft.jsonConfig.overviewRules = { ...presetData };
      return draft;
    });
  };

  const handleAddGuideline = () => {
    if (!newGuideline.trim()) return;
    const current = [...guidelines, newGuideline.trim()];
    updateOverview({ guidelines: current });
    setNewGuideline("");
  };

  const handleRemoveGuideline = (idx: number) => {
    const current = guidelines.filter((_, i) => i !== idx);
    updateOverview({ guidelines: current });
  };

  const handleAddRound = () => {
    const newRound = {
      name: `Round ${rounds.length + 1}: Finale & Demo`,
      date: "October 2026",
      details: "Prototype showcase and presentation.",
    };
    updateOverview({ rounds: [...rounds, newRound] });
  };

  const handleUpdateRound = (idx: number, patch: Partial<{ name: string; date: string; details: string }>) => {
    const updated = rounds.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    updateOverview({ rounds: updated });
  };

  const handleRemoveRound = (idx: number) => {
    const updated = rounds.filter((_, i) => i !== idx);
    updateOverview({ rounds: updated });
  };

  const handleAddContact = () => {
    const newContact = {
      role: "Coordinator",
      name: "Student Lead",
      phone: "+91 9999999999",
      email: "help@college.edu",
    };
    updateOverview({ contacts: [...contacts, newContact] });
  };

  const handleUpdateContact = (idx: number, patch: Partial<{ role: string; name: string; phone: string; email: string }>) => {
    const updated = contacts.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    updateOverview({ contacts: updated });
  };

  const handleRemoveContact = (idx: number) => {
    const updated = contacts.filter((_, i) => i !== idx);
    updateOverview({ contacts: updated });
  };

  const handleCopySummary = () => {
    const text = `📋 ${title} (${badge})\n🏛️ Organized by: ${organization}\n📍 Venue: ${location}\n⏰ Deadline: ${deadline}\n🚀 Commencement: ${commencement}\n👥 Team Size: ${teamSize}\n💳 Registration Fee: ${fee}\n\n📜 Key Rules:\n${guidelines.map((g, i) => `${i + 1}. ${g}`).join("\n")}\n\n📞 Help Desk:\n${contacts.map(c => `${c.role}: ${c.name} (${c.phone})`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-purple-50 rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Overview &amp; Rules Sandbox
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                  Beside Theme
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure event guidelines, schedule milestones, and inspect the rules canvas in real-time.
              </p>
            </div>
          </div>

          {/* Quick Actions: Test in Modal + Copy Summary */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsTestDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              title="Launch Participant Drawer Preview"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Test Drawer</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all"
              title="Copy Summary to Clipboard"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedSummary ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* View Mode Nav Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveViewMode("canvas")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeViewMode === "canvas"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-sky-500" />
            <span>Interactive Canvas</span>
          </button>

          <button
            onClick={() => setActiveViewMode("editor")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeViewMode === "editor"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-500" />
            <span>Rules &amp; Details Editor</span>
          </button>

          <button
            onClick={() => setActiveViewMode("architecture")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeViewMode === "architecture"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
            <span>Rules &amp; Flow Graph</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Presets */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>1-Click Overview Presets</span>
          </span>
          <span className="text-[11px] text-slate-400">Load sample templates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p.data)}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                {p.name}
              </div>
              <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                {p.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* TAB VIEW 1: INTERACTIVE VISUAL CANVAS */}
      {activeViewMode === "canvas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Live Sandbox Preview (Click elements to test)
            </span>
            <button
              onClick={() => setIsTestDrawerOpen(true)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Launch Modal</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Canvas Card Sandbox */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
            {/* Header & Badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-extrabold tracking-wider uppercase rounded-lg">
                  {title}
                </span>
                <span className="px-2.5 py-1 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{badge}</span>
                </span>
                <span className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold rounded-lg">
                  Organised by {organization}
                </span>
              </div>

              {meta.description && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {meta.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100/70 px-3.5 py-2 rounded-xl border border-slate-200/50">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{location}</span>
              </div>
            </div>

            {/* Key Schedule Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                    Registration Deadline
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Active
                  </span>
                </div>
                <p className="text-xs font-extrabold text-amber-950 mt-1">{deadline}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200/70 space-y-1">
                <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider block">
                  Commencement
                </span>
                <p className="text-xs font-extrabold text-sky-950 mt-1">{commencement}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Team Composition
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">{teamSize}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Entry Fee
                  </span>
                </div>
                <p className="text-xs font-extrabold text-emerald-700">{fee}</p>
              </div>
            </div>

            {/* Event Rounds & Milestones Timeline */}
            {rounds.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  <span>Timeline &amp; Rounds</span>
                </h4>

                <div className="space-y-2 border-l-2 border-sky-200 pl-3.5 ml-1.5">
                  {rounds.map((r, rIdx) => (
                    <div key={rIdx} className="relative space-y-0.5">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-white" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{r.name}</span>
                        <span className="text-[11px] font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                          {r.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{r.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Guidelines List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                <span>Official Guidelines &amp; Code of Conduct ({guidelines.length} Rules)</span>
              </h4>

              <div className="space-y-1.5">
                {guidelines.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1 leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Desk Contacts */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Organizing Help Desk</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {contacts.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{c.name}</span>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                        {c.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {c.phone}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB VIEW 2: RULES & DETAILS CONFIGURATOR */}
      {activeViewMode === "editor" && (
        <div className="space-y-5">
          {/* Section 1: Event Identity & Meta */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-500" />
              <span>Event Branding &amp; Venue</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Event / Portal Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => updateOverview({ title: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  placeholder="e.g. HackX 2026"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Host Organization
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => updateOverview({ organization: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  placeholder="e.g. TeleEra@PCE"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => updateOverview({ badge: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  placeholder="e.g. Official Portal"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => updateOverview({ location: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  placeholder="e.g. Priyadarshini College of Engineering, Nagpur"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Key Dates, Team Size, and Fee */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Schedule, Team Constraints &amp; Fee</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Registration Deadline
                </label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => updateOverview({ deadline: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  placeholder="e.g. Closes on October 1st, 2026 at 00:00"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Commencement Date / Time
                </label>
                <input
                  type="text"
                  value={commencement}
                  onChange={(e) => updateOverview({ commencement: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  placeholder="e.g. October 3rd – 5th, 2026"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Team Composition Rule
                </label>
                <input
                  type="text"
                  value={teamSize}
                  onChange={(e) => updateOverview({ teamSize: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  placeholder="e.g. 2 to 5 Members per Team"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Entry / Registration Fee
                </label>
                <input
                  type="text"
                  value={fee}
                  onChange={(e) => updateOverview({ fee: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  placeholder="e.g. ₹650.00 / Team"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Guidelines Editor */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                <span>Guidelines &amp; Rules ({guidelines.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400">Displayed as checklist in runner</span>
            </div>

            {/* Add guideline input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newGuideline}
                onChange={(e) => setNewGuideline(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddGuideline();
                  }
                }}
                className="flex-1 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                placeholder="Type a new guideline or rule and press Enter..."
              />
              <button
                type="button"
                onClick={handleAddGuideline}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List of guidelines */}
            <div className="space-y-2">
              {guidelines.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 group"
                >
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => {
                      const updated = [...guidelines];
                      updated[idx] = e.target.value;
                      updateOverview({ guidelines: updated });
                    }}
                    className="flex-1 text-xs font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGuideline(idx)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Timeline Rounds Editor */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>Timeline Rounds &amp; Milestones ({rounds.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddRound}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Round</span>
              </button>
            </div>

            <div className="space-y-3">
              {rounds.map((round, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={round.name}
                      onChange={(e) => handleUpdateRound(idx, { name: e.target.value })}
                      className="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 focus:border-sky-500 flex-1"
                      placeholder="Round Title..."
                    />
                    <input
                      type="text"
                      value={round.date}
                      onChange={(e) => handleUpdateRound(idx, { date: e.target.value })}
                      className="text-xs font-medium text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200 w-32 sm:w-40"
                      placeholder="Date/Time..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRound(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={round.details}
                    onChange={(e) => handleUpdateRound(idx, { details: e.target.value })}
                    className="w-full text-xs text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 focus:border-sky-500"
                    placeholder="Details or deliverables for this phase..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Organizing Help Desk Contacts */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Help Desk &amp; Contacts ({contacts.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddContact}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Contact</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => handleUpdateContact(idx, { name: e.target.value })}
                      className="text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200 flex-1"
                      placeholder="Contact Name"
                    />
                    <input
                      type="text"
                      value={contact.role}
                      onChange={(e) => handleUpdateContact(idx, { role: e.target.value })}
                      className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200 w-28"
                      placeholder="Role"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={contact.phone}
                      onChange={(e) => handleUpdateContact(idx, { phone: e.target.value })}
                      className="text-xs text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200"
                      placeholder="Phone"
                    />
                    <input
                      type="text"
                      value={contact.email}
                      onChange={(e) => handleUpdateContact(idx, { email: e.target.value })}
                      className="text-xs text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200"
                      placeholder="Email"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB VIEW 3: ARCHITECTURE & RULES GRAPH */}
      {activeViewMode === "architecture" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-emerald-500" />
              <span>Full Form &amp; Rules Topology Map</span>
            </h4>
            <p className="text-xs text-slate-500">
              Visual map showing how Overview &amp; Rules connect to Stepper stages, dynamic branch rules, and payment gateways.
            </p>
          </div>

          {/* Node 1: Event Identity & Overview */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>Node 0: Overview &amp; Rules Policy</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-sky-700 border border-sky-200">
                Drawer &amp; Header
              </span>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <div><strong>Event:</strong> {title} ({organization})</div>
              <div><strong>Guidelines:</strong> {guidelines.length} active rules enforced</div>
              <div><strong>Team Constraint:</strong> {teamSize}</div>
            </div>
          </div>

          {/* Node connector */}
          <div className="w-0.5 h-5 bg-slate-300 mx-auto" />

          {/* Node 2: Stepper Steps */}
          <div className="space-y-3">
            {steps.map((step, sIdx) => {
              const cardCount = step.cards?.length || 0;
              const fieldCount = step.cards?.reduce((acc, c) => acc + (c.fields?.length || 0), 0) || 0;

              return (
                <div key={step.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                        {sIdx + 1}
                      </span>
                      <span>{step.title}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {cardCount} card{cardCount === 1 ? "" : "s"} &bull; {fieldCount} fields
                    </span>
                  </div>

                  {/* Cards inside this step */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {step.cards?.map((card) => {
                      // Check if controlled by quantity logic
                      const isQuantityCard = logic?.quantityLogicEnabled &&
                        logic?.quantityCardMappings &&
                        Object.values(logic.quantityCardMappings).some((list) => Array.isArray(list) && list.includes(card.id));

                      return (
                        <div
                          key={card.id}
                          className={`p-2.5 rounded-xl border text-xs ${
                            isQuantityCard
                              ? "bg-purple-50/60 border-purple-200 text-purple-900"
                              : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>{card.title || "Card Section"}</span>
                            {isQuantityCard && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-purple-200 text-purple-800">
                                Quantity Rule
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {card.fields?.length || 0} fields
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Node connector */}
          <div className="w-0.5 h-5 bg-slate-300 mx-auto" />

          {/* Node 3: Payment & Verification Gate */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Final Node: Verification &amp; Submit</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {payment?.enabled ? "UPI Payment Enforced" : "Standard Submission"}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {payment?.enabled
                ? `Collects ₹${payment.amount} fee with UTR verification matching Overview rules.`
                : "Standard direct response dispatch to TiDB and configured webhooks."}
            </p>
          </div>
        </div>
      )}

      {/* Real Participant Drawer Test Modal */}
      <OverviewDrawer
        isOpen={isTestDrawerOpen}
        onClose={() => setIsTestDrawerOpen(false)}
        config={jsonConfig}
      />
    </div>
  );
};
