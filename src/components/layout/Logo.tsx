/* eslint-disable @next/next/no-img-element */

/**
 * Official Cyberpoint logo (vectorised from the brand artwork).
 * "auto" follows the theme; "reversed" is for navy/dark surfaces in either theme.
 */
export default function Logo({
  variant = "auto",
  slogan = false,
  className,
  height = 34,
}: {
  variant?: "auto" | "reversed";
  slogan?: boolean;
  className?: string;
  height?: number;
}) {
  const base = slogan ? "/brand/logo-slogan" : "/brand/logo";
  const ratio = slogan ? 3612 / 732 : 3612 / 561;
  const w = Math.round(height * ratio);
  if (variant === "reversed") {
    return <img src={`${base}-reversed.svg`} alt="Cyberpoint" width={w} height={height} className={className} />;
  }
  return (
    <span className={className} style={{ display: "inline-flex" }}>
      <img src={`${base}.svg`} alt="Cyberpoint" width={w} height={height} className="logo-light" />
      <img src={`${base}-reversed.svg`} alt="" aria-hidden="true" width={w} height={height} className="logo-dark" />
    </span>
  );
}
