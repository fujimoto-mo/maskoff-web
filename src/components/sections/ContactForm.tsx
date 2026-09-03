"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Field, { INPUT_CLASS } from "@/components/ui/Field";
import { CATEGORY_LABELS } from "@/lib/schema/contact-labels";
import type { ContactInput } from "@/lib/schema/contact";

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const MAX = 2000;
type Errors = Partial<Record<string, string>>;

/**
 * お問い合わせフォーム。zod でクライアント検証 → POST /api/contact（JSON）→ /contact/thanks/。
 * 検証ルールは src/lib/schema/contact.ts のみ（Worker も同じスキーマを import する）。
 * @example <ContactForm />
 */
export default function ContactForm() {
  const router = useRouter();
  const tsRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");

  // Turnstile（サイトキーがある時だけ読み込む。ローカルはスキップ）
  useEffect(() => {
    if (!SITE_KEY || !tsRef.current) return;
    const el = tsRef.current;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => window.turnstile?.render(el, { sitekey: SITE_KEY, callback: (t: string) => setToken(t), "expired-callback": () => setToken("") });
    document.head.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");
    const fd = new FormData(e.currentTarget);
    const str = (k: string) => String(fd.get(k) ?? "");
    const raw: Record<keyof ContactInput, string | boolean> = {
      company: str("company"),
      name: str("name"),
      email: str("email"),
      tel: str("tel"),
      category: str("category"),
      message: str("message"),
      consent: fd.get("consent") === "on",
      website: str("website"),
      turnstileToken: SITE_KEY ? token : "local",
    };
    const [{ contactSchema }, { z }] = await Promise.all([import("@/lib/schema/contact"), import("zod")]);
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      const f = z.flattenError(parsed.error).fieldErrors;
      setErrors(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])));
      if (f.turnstileToken) setServerError("スパム対策の確認が完了していません。少し待ってから再度お試しください。");
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: Errors };
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.error ?? "送信に失敗しました。時間をおいて再度お試しください。");
      }
      router.push("/contact/thanks/");
    } catch (err) {
      if (err instanceof TypeError) {
        setServerError("通信に失敗しました。ネットワーク環境をご確認ください。");
      } else {
        setServerError(err instanceof Error ? err.message : "送信に失敗しました。");
      }
      window.turnstile?.reset();
      setToken("");
    } finally {
      setBusy(false);
    }
  }

  const aria = (k: string) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${k}-error` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="会社名・団体名" htmlFor="company" error={errors.company}>
        <input id="company" name="company" autoComplete="organization" maxLength={100} className={INPUT_CLASS} placeholder="株式会社○○" {...aria("company")} />
      </Field>
      <Field label="お名前" htmlFor="name" required error={errors.name}>
        <input id="name" name="name" autoComplete="name" required maxLength={50} className={INPUT_CLASS} placeholder="山田 太郎" {...aria("name")} />
      </Field>
      <Field label="メールアドレス" htmlFor="email" required error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className={INPUT_CLASS} placeholder="you@example.com" {...aria("email")} />
      </Field>
      <Field label="電話番号" htmlFor="tel" error={errors.tel}>
        <input id="tel" name="tel" type="tel" autoComplete="tel" maxLength={20} className={INPUT_CLASS} placeholder="09000000000" {...aria("tel")} />
      </Field>
      <Field label="お問い合わせ種別" htmlFor="category" required error={errors.category}>
        <select id="category" name="category" defaultValue="" required className={INPUT_CLASS} {...aria("category")}>
          <option value="" disabled>
            選択してください
          </option>
          {Object.entries(CATEGORY_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="お問い合わせ内容"
        htmlFor="message"
        required
        error={errors.message}
        hint={
          <p className="text-right text-caption text-fg-muted">
            {message.length}/{MAX}
          </p>
        }
      >
        <textarea id="message" name="message" rows={6} required maxLength={MAX} value={message} onChange={(e) => setMessage(e.target.value)} className={INPUT_CLASS} placeholder="ご相談内容をご記入ください" {...aria("message")} />
      </Field>

      {/* ハニーポット: 人間には見えない。値が入っていたら Bot */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" />

      <label className="mt-1 flex items-start justify-center gap-2 text-caption text-fg">
        <input type="checkbox" name="consent" required className="mt-1 accent-fg" aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? "consent-error" : undefined} />
        <span>
          <a href="/privacypolicy/" target="_blank" rel="noopener" className="underline underline-offset-2">
            プライバシーポリシー
          </a>
          に同意します
          <span aria-hidden className="ml-1 text-required">
            *
          </span>
        </span>
      </label>
      {errors.consent && (
        <p id="consent-error" role="alert" className="text-center text-caption text-required">
          {errors.consent}
        </p>
      )}

      {SITE_KEY && <div ref={tsRef} className="flex justify-center" />}
      {serverError && (
        <p role="alert" className="text-caption text-required">
          {serverError}
        </p>
      )}
      <Button type="submit" variant="block" disabled={busy} className="mt-1">
        {busy ? "送信しています…" : "この内容で送信する"}
      </Button>
    </form>
  );
}
