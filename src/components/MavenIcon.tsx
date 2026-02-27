interface MavenIconProps {
  size?: number;
  className?: string;
}

const MavenIcon = ({ size = 24, className = "" }: MavenIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    {/* Main 4-point star */}
    <path
      d="M12 2C12 2 13.5 8.5 12 12C10.5 8.5 12 2 12 2Z"
      fill="currentColor"
    />
    <path
      d="M12 22C12 22 10.5 15.5 12 12C13.5 15.5 12 22 12 22Z"
      fill="currentColor"
    />
    <path
      d="M2 12C2 12 8.5 10.5 12 12C8.5 13.5 2 12 2 12Z"
      fill="currentColor"
    />
    <path
      d="M22 12C22 12 15.5 13.5 12 12C15.5 10.5 22 12 22 12Z"
      fill="currentColor"
    />
    {/* Diagonal arms */}
    <path
      d="M5 5C5 5 9.5 9 12 12C9 9.5 5 5 5 5Z"
      fill="currentColor"
    />
    <path
      d="M19 19C19 19 14.5 15 12 12C15 14.5 19 19 19 19Z"
      fill="currentColor"
    />
    <path
      d="M19 5C19 5 15 9.5 12 12C14.5 9 19 5 19 5Z"
      fill="currentColor"
    />
    <path
      d="M5 19C5 19 9 14.5 12 12C9.5 15 5 19 5 19Z"
      fill="currentColor"
    />
    {/* Small sparkle accent */}
    <circle cx="18.5" cy="4.5" r="1" fill="currentColor" opacity="0.6" />
  </svg>
);

export default MavenIcon;
