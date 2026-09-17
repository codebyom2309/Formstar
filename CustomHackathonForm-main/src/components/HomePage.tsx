import React from "react";
import { HackXLogo } from "./HackXLogo";
import {
  Calendar,
  Clock,
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Layers,
  Laptop,
  Trophy,
  HelpCircle,
  IndianRupee,
  Flame,
} from "lucide-react";

interface HomePageProps {
  onNavigateRegister: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateRegister,
}) => {
  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#070D18] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-cyan-500/20 selection:text-cyan-600 dark:selection:text-cyan-400">
      {/* Top Navbar */}
      <header className="bg-white/90 dark:bg-[#0B132B]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HackXLogo size="sm" showTagline={false} />
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onNavigateRegister}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:py-20 border-b border-slate-200 dark:border-slate-800/80 bg-radial-[at_top_right] from-cyan-500/10 via-transparent to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Host Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs sm:text-sm font-bold">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Organised by TeleEra@PCE &bull; HackX 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Hackathon for Advanced Coding &amp; Knowledge eXchange
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Step into the forefront of technology, software craftsmanship, and multidisciplinary innovation. 
              Form your squad of 2 to 5 innovators, tackle blind venue problem statements, build your prototype, and pitch to industry judges for grand prizes and certificates.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Registration Fee
                </span>
                <span className="text-lg sm:text-xl font-black text-cyan-600 dark:text-cyan-400 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-0.5" /> 650.00
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Flat fee per squad
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Team Composition
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  2 &ndash; 5 Members
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Lead + up to 4 Teammates
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Registration Closes
                </span>
                <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                  Oct 1, 2026
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Midnight 00:00 IST
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Hackathon Dates
                </span>
                <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                  Oct 3 &ndash; 5, 2026
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  PCE Nagpur Campus
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onNavigateRegister}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Register Your Team Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#timeline"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-[#111A38] text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all"
              >
                <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Explore Timeline &amp; Rounds</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* =========================================================================
            SECTION 1: DETAILED ROUND TIMELINE & PHASES (CURRENT STATE HIGHLIGHTED)
           ========================================================================= */}
        <section id="timeline" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Roadmap &amp; Milestones</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Official Hackathon Timelines &amp; Rounds
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Current Status: Registration Phase Active</span>
            </div>
          </div>

          {/* Timeline Visual Cards */}
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
            {/* Phase 1: Team Registration (CURRENT STATE - HIGHLIGHTED) */}
            <div className="relative">
              {/* Highlight Marker Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-500/20">
                1
              </div>

              <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/50 dark:border-emerald-500/40 shadow-md shadow-emerald-500/5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      Current Phase
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Phase 1: Online Team Registration &amp; Verification
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700">
                    Deadline: 1st October 2026, 00:00 (Midnight)
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Teams must complete their multi-step registration through this official portal. Provide team information, Leader contact details, 1 to 4 member records, and pay the ₹650.00 team fee via the official UPI QR code with valid transaction ID / UTR verification.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-white dark:bg-[#070D18] rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">
                      Team Capacity
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      2 to 5 members per team across any accredited engineering college.
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#070D18] rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">
                      Registration Fee
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      ₹650 flat fee covering the full squad &amp; official merchandise/credentials.
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#070D18] rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">
                      Action Required
                    </span>
                    <button
                      type="button"
                      onClick={onNavigateRegister}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>Complete Registration</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2: Hackathon Commencement & Round 1 */}
            <div className="relative">
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                2
              </div>

              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Phase 2: Hackathon Commencement &amp; Round 1 Evaluation
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    October 3, 2026 &bull; In-Person Venue
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>
                    <strong className="text-slate-900 dark:text-white">Venue Problem Statement Reveal:</strong> The official problem statements will be revealed strictly on-spot at the venue to guarantee a level playing field and eliminate pre-coded advantages.
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Rapid Prototyping &amp; PPT:</strong> Teams will spend the initial hours architecting their prototype, setting up repos, and formulating their presentation deck.
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">3:00 PM &ndash; Round 1 Judging:</strong> The first evaluation round will commence sharply at 3:00 PM before the judging panel.
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Same-Day Shortlist Announcement:</strong> The shortlist results of Round 1 will be published on October 3rd itself.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 3: Deep Sprint — Full Sunday Workspace */}
            <div className="relative">
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                3
              </div>

              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Phase 3: Deep Sprint &amp; Final Product Build
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    October 4, 2026 (Sunday) &bull; Full Day Anywhere
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Shortlisted teams receive the <strong className="text-slate-900 dark:text-white">entire Sunday</strong> as an unconstrained, high-velocity engineering sprint. You are free to collaborate and build from anywhere &mdash; your personal workspace, hostel, college labs, or home &mdash; focusing on writing complete functional code, polishing UI/UX, and perfecting the final product presentation.
                </p>
              </div>
            </div>

            {/* Phase 4: Grand Finale & Final Judging */}
            <div className="relative">
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                4
              </div>

              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Phase 4: Grand Finale, Final Demo &amp; Award Ceremony
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    October 5, 2026 &bull; Final Defense &amp; Valedictory
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Teams assemble at the venue with their fully built, working solution ready for live demonstration. Each team will present to our jury panel, answering technical and architecture questions. Following the judging round, the Grand Winner, 1st Runner-Up, and theme commendations will be awarded in the valedictory ceremony.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: RULES, REGULATIONS & MANDATORY REQUIREMENTS
           ========================================================================= */}
        <section id="rules" className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Compliance &amp; Fair Play</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Rules &amp; Code of Conduct
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Team Composition Rules
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Teams must consist of 2 to 5 members with 1 designated Team Leader who serves as the official point of contact. Inter-department and inter-college team formations are welcomed.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                On-Venue Problem Statement Reveal
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Problem statements will strictly be unveiled on October 3 at the venue. Pre-written full codebases are strictly disqualified. Open-source libraries, frameworks, APIs, and boilerplate setups are permitted.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Attendance &amp; Verification
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                All registered members must carry valid college identity cards for verification at check-in on October 3. Physical presence during Round 1 and Final Round presentation is mandatory.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Evaluation Criteria
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Projects will be graded on Innovation (25%), Technical Depth &amp; Architecture (25%), Working Prototype (25%), Viability &amp; Scalability (15%), and Presentation Delivery (10%).
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: ORGANIZER CONTACTS & ENQUIRY
           ========================================================================= */}
        <section id="contact" className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Get In Touch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Organizing Committee &amp; Helpdesk
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Have queries about themes, team eligibility, registration payment, or schedule? Reach out directly to our organizers:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organizer 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Ujjwal Barange
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Organizer &bull; TeleEra@PCE
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-bold border border-cyan-500/20">
                  Organizer
                </span>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <a
                  href="mailto:ujjwall.barange@gmail.com"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span className="truncate">ujjwall.barange@gmail.com</span>
                </a>

                <a
                  href="tel:+917987494482"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>+91 7987494482</span>
                </a>
              </div>
            </div>

            {/* Organizer 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Om Satange
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Organizer &bull; TeleEra@PCE
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-500/20">
                  Organizer
                </span>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <a
                  href="mailto:omsatange5788@gmail.com"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span className="truncate">omsatange5788@gmail.com</span>
                </a>

                <a
                  href="tel:+917249346921"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>+91 7249346921</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BOTTOM CALL TO ACTION
           ========================================================================= */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-cyan-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-200">
              Registration Closing October 1, 2026
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Ready to Shape the Next Breakthrough?
            </h3>
            <p className="text-xs sm:text-sm text-cyan-100 max-w-xl">
              Enroll your team today. Multi-step registration takes less than 2 minutes with instant verification and team confirmation.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateRegister}
            className="shrink-0 px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-sm shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <span>Apply Now &bull; Register Team</span>
            <ArrowRight className="w-4 h-4 text-cyan-600" />
          </button>
        </section>
      </main>
    </div>
  );
};
