"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICES } from "@/lib/services";

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void } }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const MAX = 800;

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const tsRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Turnstile 読み込み（サイトキー未設定時はスキップ＝ローカル開発用）
  useEffect(() => {
    if (!SITE_KEY || !tsRef.current) return;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => window.turnstile?.render(tsRef.current!, { sitekey: SITE_KEY, callback: (t: string) => setToken(t), "expired-callback": () => setToken("") });
    document.head.appendChild(s);
    return () => { s.remove(); };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    if (SITE_KEY && !token) { setError("スパム対策の確認が完了していません。少し待ってから再度お試しください。"); return; }
    fd.set("turnstile", token);
    setBusy(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "送信に失敗しました。時間をおいて再度お試しください。");
      router.push("/contact/thanks/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました。");
      window.turnstile?.reset();
      setToken("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate={false}>
      <label>会社名・団体名<input name="company" autoComplete="organization" maxLength={100} /></label>
      <label>お名前 <span className="req">*</span><input name="name" required autoComplete="name" maxLength={60} /></label>
      <label>メールアドレス <span className="req">*</span><input name="email" type="email" required autoComplete="email" maxLength={120} /></label>
      {!compact && <label>電話番号<input name="tel" type="tel" autoComplete="tel" maxLength={20} /></label>}
      <label>ご興味のある事業
        <select name="service" defaultValue="">
          <option value="">選択してください</option>
          {SERVICES.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
          <option value="採用について">採用について</option>
          <option value="その他">その他</option>
        </select>
      </label>
      <label>お問い合わせ内容 <span className="req">*</span>
        <textarea name="message" required maxLength={MAX} value={msg} onChange={(e) => setMsg(e.target.value)} />
        <span className="count">{msg.length}/{MAX}</span>
      </label>
      {/* honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999 }} aria-hidden />
      <label className="check"><input type="checkbox" name="agree" required /><span><a href="/privacy/" target="_blank">プライバシーポリシー</a>に同意します <span className="req">*</span></span></label>
      {SITE_KEY && <div ref={tsRef} />}
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-accent" disabled={busy}>{busy ? "送信しています…" : "この内容で送信する"}</button>
    </form>
  );
}
