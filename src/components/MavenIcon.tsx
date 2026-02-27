interface MavenIconProps {
  size?: number;
  className?: string;
}

const MavenIcon = ({ size = 24, className = "" }: MavenIconProps) => (
  <span
    className={`inline-flex items-center justify-center font-bold italic tracking-tighter leading-none select-none rounded-lg ${className}`}
    style={{
      fontSize: size * 0.7,
      width: size,
      height: size,
      background: "var(--glass-bg)",
      backdropFilter: "blur(var(--glass-blur))",
      WebkitBackdropFilter: "blur(var(--glass-blur))",
      border: "1px solid var(--glass-border)",
      boxShadow: "var(--glass-shadow), inset 0 1px 1px rgba(255,255,255,0.15)",
    }}
    aria-hidden="true"
  >
    m
  </span>
);

export default MavenIcon;
