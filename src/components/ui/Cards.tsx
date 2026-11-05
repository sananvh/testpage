/* eslint-disable @next/next/no-img-element */
import type { Locale } from "@/i18n/config";
import type { NewsItem, Product, Service } from "@/lib/content";
import { Link } from "../motion/ViewTransitions";
import Icon from "../Icon";
import s from "./ui.module.css";

export function formatDate(iso: string, locale: Locale) {
  const tag = { az: "az-Latn-AZ", en: "en-GB", ru: "ru-RU" }[locale];
  return new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export function ServiceCard({ service, locale, phaseLabel, more }: { service: Service; locale: Locale; phaseLabel: string; more: string }) {
  return (
    <Link href={`/${locale}/services/${service.slug}`} className={s.serviceCard}>
      <span className={s.serviceTop}>
        <span className={s.servicePhase}>{phaseLabel}</span>
        <span className={s.serviceIcon}>
          <Icon name={service.icon} />
        </span>
      </span>
      <h3 className="h3">{service.title}</h3>
      <p className={s.serviceText}>{service.short}</p>
      <span className={s.serviceMore}>
        {more} <Icon name="arrow" />
      </span>
    </Link>
  );
}

export function ProductCard({ product, locale, groupLabel }: { product: Product; locale: Locale; groupLabel: string }) {
  return (
    <Link href={`/${locale}/products/${product.slug}`} className={s.productCard}>
      <span className={s.productGroup}>{groupLabel}</span>
      <strong className={s.productName}>{product.name}</strong>
      <span className={s.productFull}>{product.full}</span>
      <span className={s.productDesc}>{product.desc}</span>
    </Link>
  );
}

export function NewsCard({ item, locale }: { item: NewsItem; locale: Locale }) {
  return (
    <Link href={`/${locale}/news/${item.slug}`} className={s.newsCard}>
      <span className={s.newsMedia}>{item.image && <img src={item.image} alt="" loading="lazy" />}</span>
      <time className={s.newsMeta} dateTime={item.date}>
        {formatDate(item.date, locale)}
      </time>
      <span className={s.newsTitle}>{item.title}</span>
    </Link>
  );
}

export function CtaPanel({ title, text, href, button }: { title: string; text: string; href: string; button: string }) {
  return (
    <div className={s.ctaPanel}>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <Link href={href} className="btn btn-light">
        {button}
        <span className="btn-icon">
          <Icon name="arrow" />
        </span>
      </Link>
    </div>
  );
}

export const ui = s;
