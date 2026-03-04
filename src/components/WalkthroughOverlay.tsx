import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWalkthrough } from "@/hooks/use-walkthrough";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

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

  const step = steps[currentStep];
  const isCenter = step?.position === "center";
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  // Navigate to the correct route if needed
  useEffect(() => {
    if (!isActive || !step?.route) return;
    if (location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [isActive, currentStep, step?.route, location.pathname, navigate]);

  // Find and measure the target element
  const measure = useCallback(() => {
    if (!isActive || !step) return;

    if (isCenter) {
      setRect(null);
      setTooltipStyle({
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      setReady(true);
      return;
    }

    const el = document.querySelector(`[data-tour-id="${step.targetId}"]`) as HTMLElement;
    if (!el) {
      // Retry — element might not be rendered yet after navigation
      retryRef.current = setTimeout(measure, 200);
      return;
    }

    const r = el.getBoundingClientRect();
    const padding = 8;
    const spotlight: SpotlightRect = {
      top: r.top - padding,
      left: r.left - padding,
      width: r.width + padding * 2,
      height: r.height + padding * 2,
    };
    setRect(spotlight);

    // Position tooltip relative to spotlight
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    const gap = 16;
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
      style = {
        top: Math.max(16, spotlight.top + spotlight.height / 2 - tooltipHeight / 2),
        left: Math.min(window.innerWidth - tooltipWidth - 16, spotlight.left + spotlight.width + gap),
      };
    } else if (pos === "left") {
      style = {
        top: Math.max(16, spotlight.top + spotlight.height / 2 - tooltipHeight / 2),
        left: Math.max(16, spotlight.left - tooltipWidth - gap),
      };
    }

    setTooltipStyle(style);
    setReady(true);
  }, [isActive, step, currentStep, isCenter]);

  useEffect(() => {
    setReady(false);
    clearTimeout(retryRef.current);
    // Small delay to let navigation complete
    const timeout = setTimeout(measure, 300);
    return () => {
      clearTimeout(timeout);
      clearTimeout(retryRef.current);
    };
  }, [measure]);

  // Re-measure on resize/scroll
  useEffect(() => {
    if (!isActive) return;
    const handler = () => measure();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [isActive, measure]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="walkthrough-overlay"
        className="fixed inset-0 z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Dark overlay with spotlight cutout */}
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
                  rx="12"
                  ry="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0" y="0"
            width="100%" height="100%"
            fill="rgba(0,0,0,0.65)"
            mask="url(#spotlight-mask)"
            style={{ pointerEvents: "auto" }}
            onClick={(e) => e.stopPropagation()}
          />
        </svg>

        {/* Spotlight ring highlight */}
        {rect && ready && (
          <motion.div
            className="absolute rounded-xl border-2 border-primary/60 shadow-[0_0_24px_rgba(var(--primary),0.15)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              pointerEvents: "none",
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Tooltip */}
        {ready && (
          <motion.div
            className="absolute z-[10000] w-[320px] rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl p-5 shadow-2xl"
            style={tooltipStyle}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 350, delay: 0.1 }}
            key={currentStep}
          >
            {/* Progress bar */}
            <div className="flex gap-1 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Icon for center steps */}
            {isCenter && (
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles size={24} className="text-primary" />
                </div>
              </div>
            )}

            <h3 className="text-base font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>

            {/* Navigation */}
            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={skipTour}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    onClick={prevStep}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-secondary/80"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {isLast ? "Finish" : "Next"}
                  {!isLast && <ArrowRight size={14} />}
                </button>
              </div>
            </div>

            <p className="mt-3 text-center text-[10px] text-muted-foreground/60">
              {currentStep + 1} of {steps.length}
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
