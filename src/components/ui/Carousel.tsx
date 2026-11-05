"use client";

import { Children, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import s from "./carousel.module.css";

export default function Carousel({
  children, label, perView = 3, dark = false, prevLabel = "Previous", nextLabel = "Next",
}: {
  children: React.ReactNode;
  label: string;
  perView?: number;
  dark?: boolean;
  prevLabel?: string;
  nextLabel?: string;
}) {
  const swiper = useRef<SwiperType | null>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const items = Children.toArray(children);

  const sync = (sw: SwiperType) => setEdge({ start: sw.isBeginning, end: sw.isEnd });

  return (
    <div className={`${s.wrap} ${dark ? s.dark : ""}`}>
      <div className={s.controls}>
        <button type="button" aria-label={prevLabel} disabled={edge.start} onClick={() => swiper.current?.slidePrev()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </button>
        <button type="button" aria-label={nextLabel} disabled={edge.end} onClick={() => swiper.current?.slideNext()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <Swiper
        modules={[Navigation, Keyboard, A11y]}
        onSwiper={(sw) => {
          swiper.current = sw;
          sync(sw);
        }}
        onSlideChange={sync}
        onResize={sync}
        keyboard={{ enabled: true }}
        a11y={{ containerMessage: label }}
        spaceBetween={18}
        slidesPerView={1.12}
        breakpoints={{ 640: { slidesPerView: Math.min(2, perView) }, 1000: { slidesPerView: Math.min(3, perView) }, 1280: { slidesPerView: perView } }}
        className={s.swiper}
      >
        {items.map((child, i) => (
          <SwiperSlide key={i} className={s.slide}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
