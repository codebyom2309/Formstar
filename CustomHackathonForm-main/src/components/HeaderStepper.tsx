import React from "react";
import { Users, UserCheck, UserPlus, ShieldCheck, Check, Lock } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";

interface HeaderStepperProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  teamSize: string;
  canNavigateToStep?: (targetStep: number) => boolean;
  onAttemptBlockedStep?: (targetStep: number) => void;
}

export const HeaderStepper: React.FC<HeaderStepperProps> = ({
  currentStep,
  onSelectStep,
  canNavigateToStep,
  onAttemptBlockedStep,
}) => {
  // Continuous hardware-accelerated scroll tracking via Framer Motion / Motion
  // Zero React re-renders during active scrolling - updates directly on GPU compositor layer
  const { scrollY } = useScroll();

  // Dead-zone buffer [0px - 15px] prevents micro-wiggles / accidental taps from re-triggering
  // Smooth transition corridor [15px - 75px] guarantees continuous partial states without binary jumping
  const collapseProgress = useTransform(scrollY, [15, 75], [0, 1], { clamp: true });

  // Continuous interpolation of padding (15px -> 8px)
  const paddingY = useTransform(collapseProgress, [0, 1], [15, 8]);

  // Hardware-accelerated GPU scale for badge circles (1.0 -> 0.82)
  const badgeScale = useTransform(collapseProgress, [0, 1], [1, 0.82]);

  // Continuous opacity & position for labels (smoothly fade and translate upward without snap)
  const labelOpacity = useTransform(collapseProgress, [0, 0.7], [1, 0], { clamp: true });
  const labelHeight = useTransform(collapseProgress, [0, 1], ["2rem", "0rem"]);
  const labelY = useTransform(collapseProgress, [0, 1], [0, -6]);
  const labelScale = useTransform(collapseProgress, [0, 1], [1, 0.92]);
  const labelPointerEvents = useTransform(collapseProgress, (v) => (v >= 0.8 ? "none" : "auto"));

  // Continuous vertical adjustment for connecting line to stay centered behind scaling circles
  const lineY = useTransform(collapseProgress, [0, 1], [0, -4]);

  // Subtle elevation shadow fades in as header enters compact sticky state
  const boxShadow = useTransform(
    collapseProgress,
    [0, 1],
    ["0 1px 2px 0 rgba(0, 0, 0, 0)", "0 1px 3px 0 rgba(0, 0, 0, 0.06)"]
  );

  const steps = [
    { id: 1, label: "Team Basics", sublabel: "Name & Theme", icon: Users },
    { id: 2, label: "Leader Details", sublabel: "Lead Contact", icon: UserCheck },
    { id: 3, label: "Members", sublabel: "Teammates", icon: UserPlus },
    { id: 4, label: "Payment & Verify", sublabel: "UPI & Submit", icon: ShieldCheck },
  ];

  const handleStepClick = (targetStep: number) => {
    // Backward navigation is always permitted
    if (targetStep <= currentStep) {
      onSelectStep(targetStep);
      return;
    }

    // Forward navigation requires gating check
    if (canNavigateToStep && !canNavigateToStep(targetStep)) {
      if (onAttemptBlockedStep) {
        onAttemptBlockedStep(targetStep);
      }
      return;
    }

    onSelectStep(targetStep);
  };

  return (
    <motion.div
      id="header-stepper-container"
      style={{
        contain: "paint layout",
        paddingTop: paddingY,
        paddingBottom: paddingY,
        boxShadow,
      }}
      className="w-full sticky top-16 z-20 transform-gpu will-change-transform backdrop-blur-md bg-white/90 dark:bg-[#0B132B]/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between relative">
          {/* Connecting line between badges */}
          <motion.div
            style={{ y: lineY }}
            className="absolute left-8 right-8 top-5 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0 hidden sm:block will-change-transform"
          />

          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isPassed = currentStep > step.id;
            const isLocked =
              !isPassed && !isActive && canNavigateToStep && !canNavigateToStep(step.id);

            return (
              <button
                key={step.id}
                type="button"
                id={`stepper-button-step-${step.id}`}
                onClick={() => handleStepClick(step.id)}
                className={`group relative z-10 flex flex-col items-center focus:outline-hidden transition-all duration-150 ${
                  isLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer active:scale-[0.98]"
                }`}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${step.label} (${
                  isPassed ? "Completed" : isActive ? "Current" : isLocked ? "Locked" : "Upcoming"
                })`}
              >
                {/* Step Badge Circle: GPU hardware-accelerated scale interpolation */}
                <motion.div
                  style={{ scale: badgeScale }}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-xs border will-change-transform ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 ring-3 ring-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                      : isPassed
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-500"
                      : isLocked
                      ? "bg-slate-100 dark:bg-slate-900/80 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800"
                      : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-700 group-hover:border-cyan-500/60 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                  }`}
                >
                  {isPassed ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : isLocked ? (
                    <div className="relative flex items-center justify-center">
                      <Icon className="w-4 h-4 opacity-40" />
                      <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-slate-400 dark:text-slate-500" />
                    </div>
                  ) : (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </motion.div>

                {/* Step Labels: Hardware-accelerated continuous opacity, scale, and height transition */}
                <motion.div
                  style={{
                    opacity: labelOpacity,
                    scale: labelScale,
                    y: labelY,
                    height: labelHeight,
                    pointerEvents: labelPointerEvents,
                  }}
                  className="mt-1.5 sm:mt-2 text-center overflow-hidden origin-top will-change-transform"
                >
                  <span
                    className={`block text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap ${
                      isActive
                        ? "text-cyan-600 dark:text-cyan-400"
                        : isPassed
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="hidden sm:block text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {step.sublabel}
                  </span>
                </motion.div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
