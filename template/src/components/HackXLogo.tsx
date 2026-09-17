import React from "react";

interface HackXLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  subtitle?: string;
  href?: string;
  target?: string;
  onClick?: () => void;
}

export const HackXLogo: React.FC<HackXLogoProps> = ({
  size = "md",
  showTagline = false,
  subtitle,
  href,
  target,
  onClick,
}) => {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const content = (
    <div className="flex items-center gap-3">
      {/* Visual Emblem */}
      <div
        className={`relative rounded-2xl flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-[#0B0F19] via-[#0E1527] to-[#141B34] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)] ${
          isSm ? "w-10 h-10" : isLg ? "w-16 h-16" : "w-12 h-12"
        }`}
      >
        {/* Ambient neon ring */}
        <div className="absolute inset-0 rounded-2xl border border-cyan-400/40 pointer-events-none" />
        <svg
          viewBox="0 0 100 100"
          className={isSm ? "w-7 h-7" : isLg ? "w-12 h-12" : "w-9 h-9"}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle glow hint */}
          <circle cx="50" cy="50" r="46" stroke="url(#ringGrad)" strokeWidth="2.5" opacity="0.8" />
          {/* H */}
          <path d="M20 38 V62 M32 38 V62 M20 50 H32" stroke="white" strokeWidth="4" strokeLinecap="round" />
          {/* A with triangle cut */}
          <path d="M38 62 L44 38 L50 62" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <polygon points="44,48 41,56 47,56" fill="#00E5FF" />
          {/* C with circuit node */}
          <path d="M60 42 C56 38 49 40 49 50 C49 60 56 62 60 58" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <circle cx="58" cy="50" r="2.5" fill="#00E5FF" />
          {/* X with neon gradient and pixel fragments */}
          <path d="M68 40 L84 62" stroke="url(#xGrad)" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M84 40 L68 62" stroke="url(#xGrad)" strokeWidth="5.5" strokeLinecap="round" />
          {/* Digital pixel squares */}
          <rect x="85" y="34" width="3.5" height="3.5" fill="#00E5FF" opacity="0.9" />
          <rect x="89" y="38" width="3.5" height="3.5" fill="#6366F1" opacity="0.9" />
          <rect x="83" y="30" width="3" height="3" fill="#38BDF8" opacity="0.75" />

          <defs>
            <linearGradient id="ringGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E5FF" />
              <stop offset="0.5" stopColor="#3B82F6" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="xGrad" x1="68" y1="40" x2="84" y2="62" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E5FF" />
              <stop offset="1" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-black tracking-wider text-base sm:text-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent drop-shadow-xs">
            HACKX
          </span>
          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/20">
            2026
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
          {subtitle || (showTagline ? "Hackathon for Advanced Coding & Knowledge eXchange" : "Official Registration Portal")}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        onClick={onClick}
        className="hover:opacity-90 transition-opacity focus:outline-hidden"
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-left hover:opacity-90 transition-opacity focus:outline-hidden"
      >
        {content}
      </button>
    );
  }

  return content;
};
