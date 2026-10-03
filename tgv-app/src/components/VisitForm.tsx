"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent, type ReactNode } from "react";
import { interestOptions } from "@/data/content";
import { localePath, type Locale } from "@/i18n/routing";
import { formatNumber } from "@/lib/format";
import { fieldErrors, visitSchema, type FieldErrors } from "@/lib/visitSchema";

type Status = "idle" | "sending" | "success" | "error";

/** Server error codes returned by /api/visit (see route.ts). */
const SERVER_CODES = new Set(["invalid", "rateLimited", "checkFields", "sendFailed"]);
const MAX_MESSAGE = 1000;

const inputCls =
  "mb-3 w-full border border-white/35 bg-white/[.08] p-4 text-inherit outline-none placeholder:text-white/70 focus:border-white aria-invalid:border-[#f2b8a8]";

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

export default function VisitForm() {
  const t = useTranslations("visit");
  const locale = useLocale() as Locale;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [msgLength, setMsgLength] = useState(0);

  /** Translated message for a field, from its error key. */
  const errorText = (k: keyof FieldErrors) => (errors[k] ? t(`errors.${errors[k]}`) : undefined);
  const err = (k: keyof FieldErrors) =>
    errors[k] ? { "aria-invalid": true as const, "aria-describedby": `${k}-error` } : {};

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = { ...(Object.fromEntries(new FormData(form)) as Record<string, string>), locale };

    const parsed = visitSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setStatus("error");
      setMessage(t("checkFields"));
      return;
    }

    setErrors({});
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the raw values plus the honeypot and page language; the server re-validates.
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string; fieldErrors?: FieldErrors };
      if (res.ok && json.ok) {
        setStatus("success");
        setMessage(t("success"));
        form.reset();
        setMsgLength(0);
      } else {
        setErrors(json.fieldErrors ?? {});
        setStatus("error");
        setMessage(json.code && SERVER_CODES.has(json.code) ? t(json.code) : t("genericError"));
      }
    } catch {
      setStatus("error");
      setMessage(t("networkError"));
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section
      id="visit"
      className="grid grid-cols-1 gap-[9vw] bg-sec-visit px-[6vw] py-[75px] text-white min-[901px]:grid-cols-[.8fr_1.2fr] min-[901px]:px-[8vw] min-[901px]:py-[100px]"
    >
      <div>
        {/* Lighter than the template #cbdacb, which is 4.1:1 on this green (AA needs 4.5:1). */}
        <p className="eyebrow text-[#e3ece3]">{t("eyebrow")}</p>
        <h2 className="display mb-[26px] text-[clamp(42px,5vw,64px)]">{t("title")}</h2>
        <p className="leading-[1.7] text-[#dce5dd]">{t("intro")}</p>
      </div>

      <form noValidate onSubmit={onSubmit} aria-label={t("formLabel")}>
        {/* Honeypot — hidden from people, tempting to bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div className="grid grid-cols-1 gap-x-3 min-[601px]:grid-cols-2">
          <Field id="name" error={errorText("name")}>
            <label htmlFor="name" className="sr-only">{t("name")}</label>
            <input id="name" name="name" required autoComplete="name" placeholder={t("namePlaceholder")} maxLength={100} className={inputCls} {...err("name")} />
          </Field>
          <Field id="phone" error={errorText("phone")}>
            <label htmlFor="phone" className="sr-only">{t("phone")}</label>
            <input id="phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder={t("phonePlaceholder")} maxLength={20} className={inputCls} {...err("phone")} />
          </Field>
          <Field id="email" error={errorText("email")}>
            <label htmlFor="email" className="sr-only">{t("email")}</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder={t("emailPlaceholder")} maxLength={200} className={inputCls} {...err("email")} />
          </Field>
          <Field id="organization" error={errorText("organization")}>
            <label htmlFor="organization" className="sr-only">{t("organization")}</label>
            <input id="organization" name="organization" autoComplete="organization" placeholder={t("organizationPlaceholder")} maxLength={150} className={inputCls} {...err("organization")} />
          </Field>
          <Field id="interest" error={errorText("interest")}>
            <label htmlFor="interest" className="sr-only">{t("interest")}</label>
            <select id="interest" name="interest" required defaultValue="" className={`${inputCls} [&>option]:bg-bg [&>option]:text-ink`} {...err("interest")}>
              <option value="" disabled>
                {t("interestPlaceholder")}
              </option>
              {interestOptions.map((o) => (
                <option key={o} value={o}>
                  {t(`interests.${o}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field id="preferredDate" error={errorText("preferredDate")}>
            <label htmlFor="preferredDate" className="mb-1 block text-xs text-[#dce5dd]">{t("date")}</label>
            <input id="preferredDate" name="preferredDate" type="date" min={today} className={`${inputCls} [color-scheme:dark]`} {...err("preferredDate")} />
          </Field>
          <Field id="guests" error={errorText("guests")}>
            <label htmlFor="guests" className="mb-1 block text-xs text-[#dce5dd]">{t("guests")}</label>
            <input id="guests" name="guests" type="number" min={1} max={50} defaultValue={1} required className={inputCls} {...err("guests")} />
          </Field>
        </div>

        <Field id="message" error={errorText("message")}>
          <label htmlFor="message" className="sr-only">{t("message")}</label>
          <textarea
            id="message"
            name="message"
            maxLength={MAX_MESSAGE}
            placeholder={t("message")}
            className={`${inputCls} h-[110px] resize-y`}
            onChange={(e) => setMsgLength(e.target.value.length)}
            {...err("message")}
          />
        </Field>
        <p className="-mt-2 mb-3 text-right text-[11px] text-[#dce5dd]">
          {t("counter", { count: formatNumber(msgLength, locale), max: formatNumber(MAX_MESSAGE, locale) })}
        </p>

        <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? t("sending") : t("submit")}
        </button>
        <p
          role={status === "error" ? "alert" : "status"}
          className={`mt-3 min-h-[1.5em] text-sm ${status === "error" ? "text-[#ffd9cf]" : "text-white"}`}
        >
          {message}
        </p>
        <p className="text-[11px] text-[#dce5dd]">
          {t.rich("privacy", {
            link: (chunks) => (
              <Link className="underline" href={localePath(locale, "/privacy")}>
                {chunks}
              </Link>
            ),
          })}
        </p>
      </form>
    </section>
  );
}
