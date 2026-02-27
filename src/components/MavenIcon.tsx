interface MavenIconProps {
  size?: number;
  className?: string;
}

const MavenIcon = ({ size = 24, className = "" }: MavenIconProps) => (
  <span
    className={`inline-flex items-center justify-center font-semibold tracking-tight leading-none select-none ${className}`}
    style={{ fontSize: size * 0.75, width: size, height: size }}
    aria-hidden="true"
  >
    m
  </span>
);

export default MavenIcon;
