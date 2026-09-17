import React from "react";
import { HackXLogo } from "./HackXLogo";
import {
  Mail,
  Phone,
  Calendar,
  Users,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

interface FooterProps {
  onNavigateHome?: () => void;
  onNavigateRegister?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateRegister,
}) => {
  return (
    <footer className="mt-auto bg-slate-200/90 dark:bg-[#030712] border-t-2 border-slate-300/90 dark:border-cyan-500/30 text-slate-700 dark:text-slate-300 transition-colors relative">
      {/* Subtle top ambient glow gradient for depth */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 dark:via-cyan-400/30 to-transparent" />

      {/* Upper Footer Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Host Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <a
                href="/?view=home"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 hover:opacity-95 transition-opacity"
                title="Open HackX 2026 Overview in a new tab"
              >
                <HackXLogo size="sm" />
              </a>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/25 text-cyan-800 dark:text-cyan-300 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Organised by TeleEra@PCE</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              HackX 2026 is the flagship annual hackathon driving coding innovation, rapid prototyping, and collaborative knowledge exchange at Priyadarshini College of Engineering (PCE).
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>Priyadarshini College of Engineering (PCE), Nagpur</span>
            </div>

            <div className="pt-2">
              <a
                href="/?view=home"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors group"
              >
                <span>Explore HackX 2026 Home & Guidelines</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Key Timelines & Highlights */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Key Schedule & Highlights
            </h3>

            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="p-3.5 rounded-xl bg-white dark:bg-[#070E1C] border border-slate-200 dark:border-slate-800/90 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>Registration Deadline</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-500/30">
                    Live Now
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Closes on October 1st, 2026 at 00:00 (Midnight)
                </p>
              </li>

              <li className="p-3.5 rounded-xl bg-white dark:bg-[#070E1C] border border-slate-200 dark:border-slate-800/90 shadow-2xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  Hackathon Commencement
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  October 3rd &ndash; 5th, 2026 &bull; On-Campus Problem Reveal & Prototype Sprints
                </p>
              </li>

              <li className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  Team Size: 2 to 5 Members
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹650.00 / Team
                </span>
              </li>
            </ul>
          </div>

          {/* Organizers & Contact Column */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Organizing Committee & Contacts
            </h3>

            <div className="space-y-3">
              {/* Organizer 1: Ujjwal Barange */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#070E1C] border border-slate-200 dark:border-slate-800/90 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    Ujjwal Barange
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/25">
                    Organizer
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <a
                    href="mailto:ujjwall.barange@gmail.com"
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span>ujjwall.barange@gmail.com</span>
                  </a>
                  <a
                    href="tel:+917987494482"
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span>+91 7987494482</span>
                  </a>
                </div>
              </div>

              {/* Organizer 2: Om Satange */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#070E1C] border border-slate-200 dark:border-slate-800/90 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    Om Satange
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/25">
                    Organizer
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <a
                    href="mailto:omsatange5788@gmail.com"
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span>omsatange5788@gmail.com</span>
                  </a>
                  <a
                    href="tel:+917249346921"
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span>+91 7249346921</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="border-t border-slate-300/80 dark:border-slate-800/90 bg-slate-300/70 dark:bg-[#010205] py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>&copy; 2026 HackX. All rights reserved.</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Organised by TeleEra@PCE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/?view=home"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 font-semibold"
            >
              <span>HackX 2026 Rules & Guidelines</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {onNavigateRegister && (
              <button
                type="button"
                onClick={onNavigateRegister}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-semibold"
              >
                Register Portal
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
