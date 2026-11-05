/* eslint-disable @next/next/no-img-element */
import s from "./ui.module.css";

/** Logo that swaps artwork between light and dark themes. */
export function ThemedLogo({ name, light, dark, className }: { name: string; light: string; dark?: string; className?: string }) {
  if (!dark || dark === light) return <img src={light} alt={name} loading="lazy" className={className} />;
  return (
    <>
      <img src={light} alt={name} loading="lazy" className={`logo-light ${className ?? ""}`.trim()} />
      <img src={dark} alt="" aria-hidden="true" loading="lazy" className={`logo-dark ${className ?? ""}`} />
    </>
  );
}

export default function LogoTile({
  name, light, dark, caption, href, variant = "wide",
}: {
  name: string;
  light: string;
  dark?: string;
  caption?: string;
  href?: string;
  variant?: "wide" | "square";
}) {
  const body = (
    <>
      <span className={`${s.logoMedia} ${variant === "square" ? s.logoSquare : ""}`}>
        {/* The visible caption already names the company, so the image alt stays empty there. */}
        <ThemedLogo name={caption !== undefined ? "" : name} light={light} dark={dark} />
      </span>
      {caption !== undefined && (
        <span className={s.logoCaption}>
          <strong>{name}</strong>
          {caption && <span>{caption}</span>}
        </span>
      )}
    </>
  );
  return href ? (
    <a className={s.logoTile} href={href} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <div className={s.logoTile}>{body}</div>
  );
}
