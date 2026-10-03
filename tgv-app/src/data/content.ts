/**
 * Site DATA (keys, numbers, flags, media paths, contact details).
 * All visible COPY lives in messages/en.json and messages/bn.json, looked up by the keys here.
 *
 * Anything marked TODO needs confirmation from the client before (or soon after)
 * launch. Unverified items are hidden by default — flip the flags / fill the
 * fields here once the client confirms; no component changes needed.
 */
import type { Locale } from "@/i18n/routing";

/** Per-locale free text that isn't a fixed UI string (e.g. photo alt text, video captions). */
export type Localized = Record<Locale, string>;

/** English, used server-side (email to staff, legal pages, defaults). Visible copy: messages/*.json. */
export const site = {
  name: "Trishal Green Valley",
  // TODO(client): confirm the Bangla spelling of the brand name: "ত্রিশাল গ্রীন ভ্যালি" (messages/bn.json).
  // Used for canonical URLs, sitemap and OpenGraph. Set NEXT_PUBLIC_SITE_URL in Vercel;
  // falls back to Vercel's production domain, then localhost.
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    "http://localhost:3000"
  ).replace(/\/$/, ""),
};

export type Banner = { src: string; href: string; alt: Localized };

export const banner: Banner = {
  src: "/hero/banner.jpg",
  href: "#investment", // where a click goes; use "" for no link
  alt: {
    en: "Trishal Green Valley Agro Farm — Farm Builder investment plans",
    bn: "ত্রিশাল গ্রীন ভ্যালি এগ্রো ফার্ম — ফার্ম বিল্ডার ইনভেস্টমেন্ট প্ল্যান",
  },
};

/* ------------------------------------------------------------------ */
/* Hero slider. Files go in /public/hero (or use absolute https URLs on NEXT_PUBLIC_MEDIA_HOST).
 * Slides whose local file is missing are skipped at build time; with none, the hero shows
 * the green gradient. `objectPosition` (CSS, e.g. "50% 30%") controls the crop focus.
 * `alt` is optional; without it the generic "hero.slideAlt" message is used.
 * TODO(client): add a short real description (en + bn) for each photo. */
export type HeroSlide = { src: string; alt?: Localized; objectPosition?: string; bare?: boolean };

export const heroSlides: HeroSlide[] = [
  {
    src: "/hero/banner.jpg",
    alt: {
      en: "Trishal Green Valley Agro Farm — Farm Builder investment plans",
      bn: "ত্রিশাল গ্রীন ভ্যালি এগ্রো ফার্ম — ফার্ম বিল্ডার ইনভেস্টমেন্ট প্ল্যান",
    },
  },
  { src: "/hero/slide-1.jpg" },
  { src: "/hero/slide-2.jpg" },
  { src: "/hero/slide-3.jpg" },
  { src: "/hero/slide-4.jpg" },
  { src: "/hero/slide-5.jpg" },
];
/* ------------------------------------------------------------------ */
/* Stats — only `verified: true` entries are rendered. Label: messages "stats.<key>".
 * `value` is a number (formatted per locale, e.g. ৩২) or a message key (e.g. "live"). */
export type Stat = { key: "area" | "horizon" | "categories" | "monitoring"; value: number | "live"; suffix?: string; verified: boolean };

export const stats: Stat[] = [
  { key: "area", value: 32, suffix: "+", verified: false }, // TODO(client): confirm project area (bigha)
  { key: "horizon", value: 20, verified: false }, // TODO(client): confirm operating horizon (years)
  { key: "categories", value: 10, suffix: "+", verified: true },
  { key: "monitoring", value: "live", verified: false }, // TODO(client): confirm monitoring plans
];

/* ------------------------------------------------------------------ */
/* Ecosystem. Names: messages "ecosystem.categories.<key>". */
export const categories = [
  { key: "cattle", icon: "🐄" },
  { key: "dairy", icon: "🥛" },
  { key: "fisheries", icon: "🐟" },
  { key: "poultry", icon: "🐓" },
  { key: "goat", icon: "🐐" },
  { key: "rabbit", icon: "🐇" },
  { key: "peacock", icon: "🦚" },
  { key: "orchard", icon: "🌳" },
  { key: "fields", icon: "🌾" },
  { key: "agroTourism", icon: "🏡" },
] as const;

/** Approved aerial masterplan image (e.g. "/masterplan.jpg"). Leave empty to hide the block. TODO(client) */
export const masterplan = { src: "" };

/* ------------------------------------------------------------------ */
/* Opportunities. Copy: messages "opportunities.items.<key>" and "opportunities.tags.<tag>". */
export const opportunities = [
  { key: "cattle", tag: "category" },
  { key: "fisheries", tag: "cycle" },
  { key: "dairy", tag: "longTerm" },
  { key: "poultry", tag: "cycle" },
  { key: "goat", tag: "category" },
  { key: "agroTourism", tag: "project" },
] as const;

/* ------------------------------------------------------------------ */
/* Progress updates now come from the database (Admin → Updates). The video below is optional. */

/** Progress video. When it resolves it is shown at the top of the Progress section.
 *
 * provider "youtube" (default): paste an unlisted YouTube link in `youtubeUrl` (watch, youtu.be, embed,
 *   shorts or a bare 11-char ID). Nothing loads from YouTube until the visitor clicks play.
 *   Invalid or empty => the video block is hidden. `poster` (optional local file) overrides the
 *   YouTube thumbnail.
 * provider "file": optional self-hosted MP4 fallback (`src` in /public/progress or an https URL).
 *
 * title / caption: TODO(client) — leave empty until the client supplies real, factual text.
 * captions: optional .vtt per locale ("file" provider only; YouTube has its own captions). */
export type ProgressVideo = {
  provider: "youtube" | "file";
  youtubeUrl: string;
  src: string;
  poster: string;
  title: Localized;
  caption: Localized;
  date: string;
  captions?: Partial<Localized>;
};

export const progressVideo: ProgressVideo = {
  provider: "youtube",
  // TODO(client): paste the unlisted YouTube link here. PROGRESS_YOUTUBE_URL (env) overrides it, so a
  // Vercel setting can change it without a code edit (also used by the e2e tests).
  youtubeUrl: process.env.PROGRESS_YOUTUBE_URL ?? "https://youtu.be/dNvOPPLy1Lk",
  src: "/progress/valley.mp4",
  poster: "/progress/valley-poster.jpg",
  title: { en: "", bn: "" },
  caption: { en: "", bn: "" },
  date: "",
};

/* ------------------------------------------------------------------ */
/* Transparency — everything is PLANNED, not live. Copy: messages "transparency.items.<key>". */
export const transparencyItems = ["monitoring", "updates", "reporting", "documents"] as const;

/* ------------------------------------------------------------------ */
/* About / operating model. Copy: messages "about.roles.<key>".
 * TODO(client): supply approved wording for FNF Corporation and Tiffin. Do not invent. */
export const operatingModel = ["fnf", "tiffin"] as const;

/* ------------------------------------------------------------------ */
/* Visit form. Values are sent/stored in English; labels: messages "visit.interests.<value>". */
export const interestOptions = ["Cattle", "Fisheries", "Dairy", "Poultry", "Other"] as const;

/* ------------------------------------------------------------------ */
/* Contact — TODO(client): supply real details. Empty strings are hidden.
 * The postal address is localized: messages "footer.address". */
export const contact = {
  phone: "", // TODO(client) e.g. "+880 1XXX-XXXXXX"
  email: "", // TODO(client) e.g. "info@trishalgreenvalley.com"
};

/* ------------------------------------------------------------------ */
/* Legal pages — English drafts pending legal review (not translated; /bn shows a notice). */
export const legalLastUpdated = "1 October 2026";

export const legalTodos: string[] = [
  "TODO: Legal entity name, registration number and registered address of the site operator.",
  "TODO: Confirm the relationship between FNF Corporation, Tiffin and Trishal Green Valley.",
  "TODO: Confirm data retention period for visit requests.",
  "TODO: Confirm governing law / dispute venue wording.",
  "TODO: Confirm whether any securities / investment regulations (e.g. BSEC) apply and the required disclosures.",
  "TODO: Provide a contact email for privacy requests.",
  "TODO: Have a qualified Bangladeshi lawyer review /privacy, /terms and /risk-disclosure.",
  "TODO: Bangla versions of the legal pages — to be produced by a qualified translator AFTER legal review (do not machine-translate).",
];
