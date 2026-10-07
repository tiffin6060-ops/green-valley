"use client";

import Image, { getImageProps } from "next/image";
import {
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import type { HeroSlide } from "@/data/content";
import type { Locale } from "@/i18n/routing";
import { formatNumber } from "@/lib/format";
import { canOptimize } from "@/lib/mediaUrl";
import HeroContacts from "./HeroContacts";

/** A slide with its alt text already resolved for the current locale. */
export type ResolvedSlide = Omit<HeroSlide, "alt"> & { alt: string };

const INTERVAL_MS = 6000;
const SWIPE_PX = 40;

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function subscribeVisibility(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}
const getHidden = () => document.hidden;
const serverFalse = () => false;

/** Current slide + which slides have ever been needed (their <img> stays mounted). */
type SlideState = { index: number; seen: number[] };
function slideReducer(state: SlideState, action: { to: number; n: number }): SlideState {
  const index = ((action.to % action.n) + action.n) % action.n;
  return { index, seen: state.seen.includes(index) ? state.seen : [...state.seen, index] };
}

/**
 * A poster (`bare`) slide: the wide artwork on desktop, and the tablet/phone versions on smaller
 * screens via <picture>, so each device downloads only its own file. On desktop the wide artwork
 * fills the hero edge to edge like the photos (object-cover; `objectPosition` keeps its text in
 * view); the small-screen versions are made to fit their frame. A missing small-screen version
 * falls back to the wide artwork shown whole (object-contain) over a blurred copy of itself.
 */
function PosterImage({ slide, first }: { slide: ResolvedSlide; first: boolean }) {
  const base = { alt: slide.alt, sizes: "100vw", quality: 75, priority: first };
  const pick = (src: string, width: number, height: number) =>
    getImageProps({ ...base, src, width, height, unoptimized: !canOptimize(src) }).props;

  const wide = pick(slide.src, 1600, 804);
  const tablet = slide.tabletSrc ? pick(slide.tabletSrc, 1600, 1250) : null;
  const mobile = slide.mobileSrc ? pick(slide.mobileSrc, 1080, 1350) : null;
  // The <img> itself carries the smallest version that exists; <source>s cover larger screens.
  const img = mobile ?? tablet ?? wide;

  // Fit per breakpoint: cover where a made-to-fit version exists, contain (show whole) otherwise.
  const fit = `${mobile ? "object-cover" : "object-contain"} ${
    tablet ? "min-[601px]:object-cover" : "min-[601px]:object-contain"
  } min-[1024px]:object-cover`;
  // The blurred backdrop is only needed (and only downloaded) where the artwork is contained.
  const backdrop = `${mobile ? "hidden" : "block"} ${tablet ? "min-[601px]:hidden" : "min-[601px]:block"} min-[1024px]:hidden`;

  return (
    <>
      <Image
        src={slide.src}
        alt=""
        aria-hidden="true"
        fill
        sizes="10vw"
        quality={40}
        loading="lazy"
        unoptimized={!canOptimize(slide.src)}
        className={`${backdrop} scale-110 object-cover blur-2xl brightness-90`}
      />
      <picture>
        <source media="(min-width: 1024px)" srcSet={wide.srcSet ?? wide.src} sizes="100vw" />
        {tablet && <source media="(min-width: 601px)" srcSet={tablet.srcSet ?? tablet.src} sizes="100vw" />}
        <img
          {...img}
          alt={slide.alt}
          className={`absolute inset-0 size-full ${fit}`}
          style={{ ...img.style, objectPosition: slide.objectPosition }}
        />
      </picture>
    </>
  );
}

function SlideImage({ slide, first }: { slide: ResolvedSlide; first: boolean }) {
  if (slide.bare) return <PosterImage slide={slide} first={first} />;
  return (
    <Image
      src={slide.src}
      alt={slide.alt}
      fill
      sizes="100vw"
      quality={75}
      // First slide is the LCP element: preload it (Next 15: priority).
      // Other slides are only mounted when needed (see `mounted` below), so they load eagerly then.
      priority={first}
      loading={first ? undefined : "eager"}
      unoptimized={!canOptimize(slide.src)}
      className={slide.bare ? "object-contain" : "object-cover"}
      style={slide.objectPosition ? { objectPosition: slide.objectPosition } : undefined}
    />
  );
}

type Props = {
  slides: ResolvedSlide[];
  /** aria-label for the hero <section>. */
  label: string;
  /** Classes for the hero <section> (layout + fallback gradient). */
  className: string;
  /** Optional overlay rendered above photo slides (never above posters). */
  overlay?: ReactNode;
  /** Hero buttons (the button bar), shown on every slide. */
  children: ReactNode;
};

/**
 * Dependency-free crossfading hero slider (WAI-ARIA APG carousel pattern).
 *
 * - Autoplays every 6s. Starts paused when the visitor prefers reduced motion (Play still
 *   works, with an instant swap instead of a fade).
 * - The Play/Pause toggle is sticky: a manual pause stays until Play is pressed.
 * - Temporary holds: a mouse over the slider controls or a hero CTA, or keyboard focus inside the hero,
 *   pause rotation and release on leave. A resting pointer elsewhere on the full-bleed photo
 *   does not pause it, and neither does a mouse click (only :focus-visible counts), so the
 *   slider never looks "stuck". Pressing Play overrides the holds until the pointer/focus
 *   leaves and comes back.
 * - Also pauses when the tab is hidden or the hero is scrolled off-screen.
 * - A slide with `bare: true` (the investor poster) is shown whole, with no overlay; on phones the
 *   hotline/WhatsApp buttons appear above the hero buttons while it is showing.
 * - Hidden slides are `inert`, so links inside them can't be focused.
 */
export default function HeroSlider({ slides, label, className, overlay, children }: Props) {
  const n = slides.length;
  const t = useTranslations("slider");
  const locale = useLocale() as Locale;
  const num = (v: number) => formatNumber(v, locale);
  const sectionRef = useRef<HTMLElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const [{ index, seen }, dispatch] = useReducer(slideReducer, { index: 0, seen: [0] });
  const [hoverHold, setHoverHold] = useState(false);
  const [focusHold, setFocusHold] = useState(false);
  const [holdsOverridden, setHoldsOverridden] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  /** null = visitor hasn't chosen; fall back to the reduced-motion default. */
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, serverFalse);
  const pageHidden = useSyncExternalStore(subscribeVisibility, getHidden, serverFalse);

  const paused = userPaused ?? reducedMotion;
  const held = !holdsOverridden && (hoverHold || focusHold);
  const rotating = n > 1 && !paused && !held && !pageHidden && onScreen;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || n < 2) return;
    // threshold 0: any visible pixel counts, so a hero taller than the viewport still "intersects".
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [n]);

  // Re-armed on every index change, so manual navigation restarts the 6s timer.
  useEffect(() => {
    if (!rotating) return;
    const t = window.setTimeout(() => dispatch({ to: index + 1, n }), INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [rotating, index, n]);

  const go = (to: number) => dispatch({ to, n });

  if (n === 1) {
    return (
      <section ref={sectionRef} aria-label={label} className={className}>
        <div className="absolute inset-0">
          <SlideImage slide={slides[0]} first />
        </div>
        {!slides[0].bare && overlay}
        <div className="relative z-[2] w-full min-[601px]:w-auto">
          {slides[0].bare && <HeroContacts className="mb-2 min-[601px]:hidden" />}
          {children}
        </div>
      </section>
    );
  }

  // Images mount for the first slide, the current and next slide, and any slide shown before.
  const next = (index + 1) % n;
  const mounted = (i: number) => i === 0 || i === index || i === next || seen.includes(i);
  const bareNow = Boolean(slides[index]?.bare);

  const holdOn = (e: PointerEvent) => {
    if (e.pointerType === "mouse") setHoverHold(true);
  };
  // Over the copy, only the CTA links/buttons hold (not the headline/paragraph, which on
  // medium screens covers most of the hero).
  const holdOnInteractive = (e: PointerEvent) => {
    if (e.pointerType === "mouse") setHoverHold(Boolean((e.target as Element).closest("a, button")));
  };
  const holdOff = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    setHoverHold(false);
    if (!focusHold) setHoldsOverridden(false);
  };

  const onFocus = (e: FocusEvent) => {
    // Keyboard focus only: a mouse click on a control must not freeze the slider.
    if ((e.target as HTMLElement).matches(":focus-visible")) setFocusHold(true);
  };
  const onBlur = (e: FocusEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setFocusHold(false);
    if (!hoverHold) setHoldsOverridden(false);
  };

  const togglePlay = () => {
    if (paused) {
      setUserPaused(false);
      setHoldsOverridden(true); // explicit Play wins over hover/focus holds
    } else {
      setUserPaused(true);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
  };

  const ctrl =
    "grid h-10 min-w-10 cursor-pointer place-items-center border border-white/60 bg-black/35 px-2 text-lg leading-none text-white backdrop-blur-sm hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <section
      ref={sectionRef}
      aria-label={label}
      // pan-y: keep native vertical scrolling, let the carousel own horizontal swipes
      // (also stops browsers treating a swipe as history back/forward).
      className={`${className} touch-pan-y`}
      onFocus={onFocus}
      onBlur={onBlur}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={t("region")}
        className="absolute inset-0"
        onKeyDown={onKeyDown}
      >
        <div className="absolute inset-0 z-0" aria-live={paused ? "polite" : "off"} aria-atomic="false">
          {slides.map((s, i) => (
            <div
              key={s.src}
              role="group"
              aria-roledescription="slide"
              aria-label={t("slide", { n: num(i + 1), total: num(n) })}
              aria-hidden={i !== index}
              inert={i !== index}
              className={`absolute inset-0 ${s.bare ? "bg-[#eaf3e4]" : ""} ${
                reducedMotion ? "" : "transition-opacity duration-700 ease-in-out"
              } ${i === index ? "opacity-100" : "opacity-0"}`}
            >
              {mounted(i) && <SlideImage slide={s} first={i === 0} />}
            </div>
          ))}
        </div>

        {!bareNow && overlay}

        <div
          className="absolute top-3 right-3 z-[3] flex items-center gap-2 min-[601px]:top-[3vw] min-[601px]:right-[3vw] min-[1024px]:top-auto min-[1024px]:right-[5vw] min-[1024px]:bottom-[29px]"
          onPointerEnter={holdOn}
          onPointerLeave={holdOff}
        >
          <button
            type="button"
            className={`${ctrl} gap-1.5 text-xs font-bold tracking-[0.5px] max-[600px]:h-7 max-[600px]:min-w-7 max-[600px]:px-1 min-[601px]:flex min-[601px]:px-3`}
            onClick={togglePlay}
            aria-label={t("pauseLabel")}
            aria-pressed={paused}
            title={paused ? t("playTitle") : t("pauseTitle")}
          >
            <span aria-hidden="true" className="text-sm">
              {paused ? "▶" : "❚❚"}
            </span>
            <span aria-hidden="true" className="hidden min-[601px]:inline">
              {paused ? t("play") : t("pause")}
            </span>
          </button>
          <button type="button" className={`${ctrl} max-[1023px]:hidden`} onClick={() => go(index - 1)} aria-label={t("prev")}>
            <span aria-hidden="true">‹</span>
          </button>
          {/* Phones: a small position indicator (swipe to change slides) keeps the poster artwork clear. */}
          <div aria-hidden="true" className="flex items-center gap-1 rounded-full bg-black/35 px-2 py-2 min-[601px]:hidden">
            {slides.map((s, i) => (
              <span
                key={s.src}
                className={`block h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
              />
            ))}
          </div>
          <div className="flex items-center max-[600px]:hidden">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => go(i)}
                aria-label={t("show", { n: num(i + 1), total: num(n) })}
                aria-current={i === index ? "true" : undefined}
                className="grid size-6 cursor-pointer place-items-center focus-visible:outline-2 focus-visible:outline-white"
              >
                <span
                  aria-hidden="true"
                  className={`block size-2 rounded-full border border-white transition-colors ${
                    i === index ? "bg-white" : "bg-transparent"
                  }`}
                />
              </button>
            ))}
          </div>
          <button type="button" className={`${ctrl} max-[1023px]:hidden`} onClick={() => go(index + 1)} aria-label={t("next")}>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      {/* Hovering a button pauses (the visitor is about to act); the photo itself does not. */}
      <div
        className="relative z-[2] w-full min-[601px]:w-auto"
        onPointerOver={holdOnInteractive}
        onPointerLeave={holdOff}
      >
        {bareNow && <HeroContacts className="mb-2 min-[601px]:hidden" />}
        {children}
      </div>
    </section>
  );
}