import { headers } from "next/headers";
import { isLocale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import Icon from "@/components/Icon";
import { Link } from "@/components/motion/ViewTransitions";

export default async function NotFound() {
  const path = (await headers()).get("x-pathname") ?? "";
  const seg = path.split("/")[1] ?? "";
  const locale = isLocale(seg) ? seg : defaultLocale;
  const t = getDictionary(locale).pages.notFound;
  return (
    <section className="section container" style={{ textAlign: "center" }}>
      <p className="eyebrow" style={{ justifyContent: "center" }}>404</p>
      <h1 className="display" style={{ marginTop: 18 }}>
        {t.title}
      </h1>
      <p className="lede" style={{ margin: "22px auto 36px" }}>
        {t.text}
      </p>
      <Link href={`/${locale}`} className="btn btn-primary">
        {t.home}
        <span className="btn-icon">
          <Icon name="arrow" />
        </span>
      </Link>
    </section>
  );
}
