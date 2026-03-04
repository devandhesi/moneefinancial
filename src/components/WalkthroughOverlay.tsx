import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWalkthrough } from "@/hooks/use-walkthrough";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, MousePointerClick } from "lucide-react";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function WalkthroughOverlay() {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour } = useWalkthrough();
  const navigate = useNavigate();
  const location = useLocation();
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [ready, setReady] = useState(false);
  const retryRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isCenter = step?.position === "center";
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const hasAdvanceOn = !!step?.advanceOn;

  // Responsive tooltip width
  const tooltipWidth = Math.min(340, window.innerWidth - 32);

  // Navigate to the correct route if needed
  useEffect(() => {
    if (!isActive || !step?.route) return;
    if (location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [isActive, currentStep, step?.route, location.pathname, navigate]);

  // Compute centered position (pixel-based, no transform)
  const getCenteredStyle = useCallback((): React.CSSProperties => {
    const tooltipHeight = 220;
    return {
      top: Math.max(16, (window.innerHeight - tooltipHeight) / 2),
      left: Math.max(16, (window.innerWidth - tooltipWidth) / 2),
    };
  }, [tooltipWidth]);

  // Find, scroll to, and measure the target element
  const measure = useCallback(() => {
    if (!isActive || !step) return;

    if (isCenter) {
      setRect(null);
      setTooltipStyle(getCenteredStyle());
      setReady(true);
      return;
    }

    const el = document.querySelector(`[data-tour-id="${step.targetId}"]`) as HTMLElement;
    if (!el) {
      retryCountRef.current++;
      if (retryCountRef.current < 15) {
        retryRef.current = setTimeout(measure, 250);
      } else {
        setRect(null);
        setTooltipStyle(getCenteredStyle());
        setReady(true);
      }
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    setTimeout(() => {
      const r = el.getBoundingClientRect();
      const padding = 10;
      const spotlight: SpotlightRect = {
        top: r.top - padding,
        left: r.left - padding,
        width: r.width + padding * 2,
        height: r.height + padding * 2,
      };
      setRect(spotlight);

      const tooltipHeight = 200;
      const gap = 20;
      let style: React.CSSProperties = {};
      const pos = step.position || "bottom";

      if (pos === "bottom") {
        style = {
          top: spotlight.top + spotlight.height + gap,
          left: Math.max(16, Math.min(spotlight.left + spotlight.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
        };
      } else if (pos === "top") {
        style = {
          top: Math.max(16, spotlight.top - tooltipHeight - gap),
          left: Math.max(16, Math.min(spotlight.left + spotlight.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
        };
      } else if (pos === "right") {
        // On narrow screens, fall back to bottom positioning
        if (spotlight.left + spotlight.width + gap + tooltipWidth > window.innerWidth - 16) {
          style = {
            top: spotlight.top + spotlight.height + gap,
            left: Math.max(16, Math.min(spotlight.left + spotlight.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
          };
        } else {
          style = {
            top: Math.max(16, spotlight.top + spotlight.height / 2 - tooltipHeight / 2),
            left: Math.min(window.innerWidth - tooltipWidth - 16, spotlight.left + spotlight.width + gap),
          };
        }
      } else if (pos === "left") {
        // On narrow screens, fall back to bottom positioning
        if (spotlight.left - gap - tooltipWidth < 16) {
          style = {
            top: spotlight.top + spotlight.height + gap,
            left: Math.max(16, Math.min(spotlight.left + spotlight.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
          };
        } else {
          style = {
            top: Math.max(16, spotlight.top + spotlight.height / 2 - tooltipHeight / 2),
            left: Math.max(16, spotlight.left - tooltipWidth - gap),
          };
        }
      }

      setTooltipStyle(style);
      setReady(true);
    }, 400);
  }, [isActive, step, currentStep, isCenter, tooltipWidth, getCenteredStyle]);

  useEffect(() => {
    setReady(false);
    retryCountRef.current = 0;
    clearTimeout(retryRef.current);
    const timeout = setTimeout(measure, 350);
    return () => {
      clearTimeout(timeout);
      clearTimeout(retryRef.current);
    };
  }, [measure]);

  // Re-measure on resize
  useEffect(() => {
    if (!isActive) return;
    const handler = () => measure();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [isActive, measure]);

  // Reactive advancement: listen for advanceOn events on the target element
  // Also apply a highlight class to make the element visually pop
  useEffect(() => {
    if (!isActive || !step?.advanceOn || !ready) return;

    const selector = step.advanceOn.selector || `[data-tour-id="${step.targetId}"]`;
    const eventType = step.advanceOn.event;
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;

    // Add highlight class and ensure it's clickable above the overlay
    el.classList.add("tour-highlight-target");

    const handler = () => {
      setTimeout(() => nextStep(), 400);
    };

    el.addEventListener(eventType, handler, { capture: true, once: true });
    return () => {
      el.removeEventListener(eventType, handler, { capture: true });
      el.classList.remove("tour-highlight-target");
    };
  }, [isActive, step, ready, nextStep]);

  if (!isActive) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="walkthrough-overlay"
        className="fixed inset-0 z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Backdrop with spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left}
                  y={rect.top}
                  width={rect.width}
                  height={rect.height}
                  rx="16"
                  ry="16"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0" y="0"
            width="100%" height="100%"
            fill="rgba(0,0,0,0.55)"
            mask="url(#spotlight-mask)"
            style={{ pointerEvents: "auto" }}
            onClick={(e) => e.stopPropagation()}
          />
        </svg>

        {/* Animated spotlight ring */}
        {rect && ready && (
          <motion.div
            className="absolute pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            style={{
              top: rect.top - 3,
              left: rect.left - 3,
              width: rect.width + 6,
              height: rect.height + 6,
            }}
          >
            <div className="absolute inset-0 rounded-2xl border-2 border-primary/50" />
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-primary/30"
              animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}

        {/* Tooltip Card */}
        {ready && (
          <motion.div
            ref={tooltipRef}
            className="absolute z-[10002]"
            style={{ ...tooltipStyle, width: tooltipWidth }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 380, delay: 0.15 }}
            key={currentStep}
          >
            <div className="rounded-2xl border border-border/40 bg-background/90 backdrop-blur-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
              {/* Continuous progress bar */}
              <div className="h-1 bg-muted/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-r-full"
                  initial={{ width: `${((currentStep) / steps.length) * 100}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              <div className="p-5">
                {/* Header with M icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCenter
                      ? "bg-gradient-to-br from-primary/20 to-primary/5"
                      : "bg-primary/10"
                  }`}>
                    <span className="text-lg font-bold text-primary tracking-tighter">m</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold tracking-tight leading-tight">{step.title}</h3>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                  </div>
                </div>

                <p className="text-[13px] text-muted-foreground leading-relaxed">{step.description}</p>

                {/* Action hint for reactive steps */}
                {hasAdvanceOn && step.actionHint && (
                  <motion.div
                    className="mt-3 flex items-center gap-2 text-[12px] text-primary/80 font-medium"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <MousePointerClick size={14} />
                    <span>{step.actionHint}</span>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="mt-5 flex items-center justify-between">
                  <button
                    onClick={skipTour}
                    className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors duration-200"
                  >
                    Skip tour
                  </button>
                  <div className="flex items-center gap-1.5">
                    {!isFirst && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={prevStep}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/80 text-foreground transition-colors hover:bg-secondary"
                      >
                        <ArrowLeft size={14} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={nextStep}
                      className={`flex h-8 items-center gap-1.5 rounded-xl px-4 text-[13px] font-medium transition-colors ${
                        hasAdvanceOn
                          ? "bg-secondary/80 text-foreground hover:bg-secondary"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {isLast ? "Finish" : hasAdvanceOn ? "Skip" : "Next"}
                      {!isLast && <ArrowRight size={12} />}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
