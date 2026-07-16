interface GlyphIconProps {
  d: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/** Inline stroke icon — reproduces the prototype's hand-drawn SVG glyphs (24x24 viewBox). */
export function GlyphIcon({
  d,
  size = 17,
  strokeWidth = 1.9,
  className,
}: GlyphIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
