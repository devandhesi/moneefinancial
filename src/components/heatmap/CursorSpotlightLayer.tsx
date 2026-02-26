import { useRef, useEffect, useCallback, useState } from "react";

interface Props {
  containerRef: React.RefObject<HTMLDivElement>;
}

const CursorSpotlightLayer = ({ containerRef }: Props) => {
  const spotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200 });
  const targetRef = useRef({ x: -200, y: -200 });
  const animRef = useRef<number>();
  const [isActive, setIsActive] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();

  // Smooth interpolation loop
  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      posRef.current.x = lerp(posRef.current.x, targetRef.current.x, 0.12);
      posRef.current.y = lerp(posRef.current.y, targetRef.current.y, 0.12);
      if (spotRef.current) {
        spotRef.current.style.background = `radial-gradient(500px circle at ${posRef.current.x}px ${posRef.current.y}px, hsl(var(--foreground) / 0.04), transparent 60%)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // Idle auto-orbit
  useEffect(() => {
    if (isActive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const r = Math.min(cx, cy) * 0.35;
    let a = 0;
    const step = () => {
      a += 0.006;
      targetRef.current.x = cx + Math.cos(a) * r;
      targetRef.current.y = cy + Math.sin(a) * r * 0.5;
    };
    const id = setInterval(step, 16);
    return () => clearInterval(id);
  }, [isActive, containerRef]);

  const handleMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetRef.current.x = e.clientX - rect.left;
    targetRef.current.y = e.clientY - rect.top;
    setIsActive(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsActive(false), 3000);
  }, [containerRef]);

  const handleLeave = useCallback(() => {
    targetRef.current.x = -200;
    targetRef.current.y = -200;
    setIsActive(false);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [containerRef, handleMove, handleLeave]);

  return <div ref={spotRef} className="pointer-events-none absolute inset-0 z-10" />;
};

export default CursorSpotlightLayer;
