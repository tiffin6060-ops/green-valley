"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { contact } from "@/data/content";
import { planGroups, planWhatsapp, type PlanKey } from "@/data/plans";
import { localePath, type Locale } from "@/i18n/routing";
import { formatNumber } from "@/lib/format";
import {
  countWords, MAX_MESSAGE_CHARS, MAX_MESSAGE_WORDS, planFieldErrors, planRequestSchema, type PlanFieldErrors,
} from "@/lib/planSchema";

type Status = "idle" | "sending" | "success" | "error";

/** Server error codes returned by /api/plan-request (see route.ts). */
const SERVER_CODES = new Set(["invalid", "rateLimited", "checkFields", "sendFailed"]);
const SECURITY = ["land", "bank", "stamp"] as const;

const inputCls =
  "mb-3 w-full border border-white/35 bg-white/[.08] p-4 text-inherit outline-none placeholder:text-white/70 focus:border-white aria-invalid:border-[#f2b8a8] autofill:shadow-[inset_0_0_0_1000px_#5d7462] autofill:[-webkit-text-fill-color:#fff]";

function Field({ id, error, children }: { id: string; error?: string; children: ReactNode }) {
  return (
    <div>
      {children}
      {error && (
        <p id={`${id}-error`} className="-mt-1.5 mb-3 text-xs text-[#ffd9cf]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function InvestmentPlans() {
  const t = useTranslations("plans");
  const locale = useLocale() as Locale;
  const [plan, setPlan] = useState<PlanKey | "">("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<PlanFieldErrors>({});
  const [words, setWords] = useState(0);
  const formRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const errorText = (k: keyof PlanFieldErrors) => (errors[k] ? t(`form.errors.${errors[k]}`) : undefined);
  const err = (k: keyof PlanFieldErrors) =>
    errors[k] ? { "aria-invalid": true as const, "aria-describedby": `plan-${k}-error` } : {};

  function choose(key: PlanKey) {
    setPlan(key);
    setErrors((e) => ({ ...e, plan: undefined }));
    if (status !== "sending") {
      setStatus("idle");
      setMessage("");
    }
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    nameRef.current?.focus({ preventScroll: true });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = { ...(Object.fromEntries(new FormData(form)) as Record<string, string>), locale };

    const parsed = planRequestSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(planFieldErrors(parsed.error));
      setStatus("error");
      setMessage(t("form.checkFields"));
      return;
    }

    setErrors({});
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/plan-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string; fieldErrors?: PlanFieldErrors };
      if (res.ok && json.ok) {
        setStatus("success");
        setMessage(t("form.success"));
        form.reset();
        setPlan("");
        setWords(0);
      } else {
        setErrors(json.fieldErrors ?? {});
        setStatus("error");
        setMessage(json.code && SERVER_CODES.has(json.code) ? t(`form.${json.code}`) : t("form.genericError"));
      }
    } catch {
      setStatus("error");
      setMessage(t("form.networkError"));
    }
  }

  return (
    <main>
      <section className="section bg-surface">
        <div className="mb-[50px] max-w-[760px]">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="display text-[clamp(40px,5vw,65px)]">{t("title")}</h1>
          <p className="leading-[1.7] text-muted">{t("intro")}</p>
        </div>

        <div className="grid grid-cols-1 gap-[18px] min-[1001px]:grid-cols-2">
          {planGroups.map((g) => (
            <article key={g.key} className="flex flex-col border border-line bg-card p-[30px]">
              <span className="text-[10px] font-bold tracking-[1.5px] text-brand">{t(`${g.key}.tagline`)}</span>
              <h2 className="mt-3 mb-2 font-display text-[clamp(26px,3vw,34px)] leading-tight">{t(`${g.key}.name`)}</h2>
              <p className="mt-0 mb-5 text-sm font-semibold text-accent">{t(`${g.key}.highlight`)}</p>

              <ul className="flex flex-col gap-3">
                {g.packages.map((p) => {
                  const selected = plan === p.key;
                  return (
                    <li
                      key={p.key}
                      className={`grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border p-4 transition-colors ${
                        selected ? "border-brand bg-surface-2" : "border-line"
                      }`}
                    >
                      <div>
                        <p className="m-0 font-bold">{t(`packages.${p.key}.name`)}</p>
                        <p className="m-0 text-sm text-muted">
                          {t(`packages.${p.key}.detail`)} · <span className="font-semibold text-ink">{t(`packages.${p.key}.value`)}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`btn ${selected ? "btn-outline-dark" : "btn-dark"} min-w-[96px] px-4 py-3`}
                        aria-pressed={selected}
                        onClick={() => choose(p.key)}
                      >
                        {selected ? t("chosen") : t("choose")}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-auto mb-0 border-t border-line pt-[18px] text-[12px] text-muted">{t(`${g.key}.footnote`)}</p>
            </article>
          ))}
        </div>

        <div className="mt-[18px] border border-line bg-card p-[24px]">
          <p className="m-0 mb-3 text-[11px] font-bold tracking-[2px] text-brand">{t("security.title")}</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {SECURITY.map((k) => (
              <li key={k} className="flex items-center gap-2 font-semibold">
                <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-brand" />
                {t(`security.${k}`)}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-[12px] text-muted">
          {t.rich("note", {
            link: (chunks) => (
              <Link className="underline" href={localePath(locale, "/risk-disclosure")}>
                {chunks}
              </Link>
            ),
          })}
        </p>
      </section>

      <section
        ref={formRef}
        id="request"
        className="grid scroll-mt-[82px] grid-cols-1 gap-[9vw] bg-sec-visit px-[6vw] py-[75px] text-white min-[901px]:grid-cols-[.8fr_1.2fr] min-[901px]:px-[8vw] min-[901px]:py-[100px]"
      >
        <div>
          <p className="eyebrow text-[#e3ece3]">{t("form.eyebrow")}</p>
          <h2 className="display mb-[26px] text-[clamp(38px,4.5vw,58px)]">{t("form.title")}</h2>
          <p className="leading-[1.7] text-[#dce5dd]">{t("form.intro")}</p>
          <p className="text-sm leading-[1.7] text-[#dce5dd]">{t("contact", { hotline: contact.phone, whatsapp: planWhatsapp })}</p>
        </div>

        <form noValidate onSubmit={onSubmit} aria-label={t("form.label")}>
          {/* Honeypot — hidden from people, tempting to bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="plan-company">Company</label>
            <input id="plan-company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          <Field id="plan-plan" error={errorText("plan")}>
            <label htmlFor="plan-plan" className="mb-1 block text-xs text-[#dce5dd]">{t("form.package")}</label>
            <select
              id="plan-plan"
              name="plan"
              required
              value={plan}
              onChange={(e) => setPlan(e.target.value as PlanKey | "")}
              className={`${inputCls} [&>optgroup]:bg-bg [&>optgroup]:text-ink [&_option]:bg-bg [&_option]:text-ink`}
              {...err("plan")}
            >
              <option value="" disabled>
                {t("form.packagePlaceholder")}
              </option>
              {planGroups.map((g) => (
                <optgroup key={g.key} label={t(`${g.key}.name`)}>
                  {g.packages.map((p) => (
                    <option key={p.key} value={p.key}>
                      {t(`packages.${p.key}.name`)} — {t(`packages.${p.key}.detail`)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>

          <Field id="plan-name" error={errorText("name")}>
            <label htmlFor="plan-name" className="sr-only">{t("form.name")}</label>
            <input ref={nameRef} id="plan-name" name="name" required autoComplete="name" placeholder={t("form.namePlaceholder")} maxLength={100} className={inputCls} {...err("name")} />
          </Field>

          <div className="grid grid-cols-1 gap-x-3 min-[601px]:grid-cols-2">
            <Field id="plan-email" error={errorText("email")}>
              <label htmlFor="plan-email" className="sr-only">{t("form.email")}</label>
              <input id="plan-email" name="email" type="email" required autoComplete="email" placeholder={t("form.emailPlaceholder")} maxLength={200} className={inputCls} {...err("email")} />
            </Field>
            <Field id="plan-phone" error={errorText("phone")}>
              <label htmlFor="plan-phone" className="sr-only">{t("form.phone")}</label>
              <input id="plan-phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder={t("form.phonePlaceholder")} maxLength={20} className={inputCls} {...err("phone")} />
            </Field>
          </div>

          <Field id="plan-message" error={errorText("message")}>
            <label htmlFor="plan-message" className="sr-only">{t("form.message")}</label>
            <textarea
              id="plan-message"
              name="message"
              maxLength={MAX_MESSAGE_CHARS}
              placeholder={t("form.messagePlaceholder")}
              className={`${inputCls} h-[130px] resize-y`}
              onChange={(e) => setWords(countWords(e.target.value))}
              {...err("message")}
            />
          </Field>
          <p className={`-mt-2 mb-3 text-right text-[11px] ${words > MAX_MESSAGE_WORDS ? "text-[#ffd9cf]" : "text-[#dce5dd]"}`}>
            {t("form.wordCounter", { count: formatNumber(words, locale), max: formatNumber(MAX_MESSAGE_WORDS, locale) })}
          </p>

          <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
            {status === "sending" ? t("form.sending") : t("form.submit")}
          </button>
          <p
            role={status === "error" ? "alert" : "status"}
            className={`mt-3 min-h-[1.5em] text-sm ${status === "error" ? "text-[#ffd9cf]" : "text-white"}`}
          >
            {message}
          </p>
          <p className="text-[11px] text-[#dce5dd]">
            {t.rich("form.privacy", {
              link: (chunks) => (
                <Link className="underline" href={localePath(locale, "/privacy")}>
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </form>
      </section>
    </main>
  );
}
