import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { CtaBand } from "@/components/CtaBand";
import { cms } from "@/lib/cms";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = { title: "会社情報", description: `${SITE.name}の会社概要・理念・メンバー。` };

export default async function Company() {
  const members = await cms.members();
  return (
    <>
      <PageHead en="COMPANY" ja="会社情報" crumbs={[{ label: "COMPANY" }]} lead="仮面を外し、素の自分で。私たちの理念と会社概要です。" />

      <section className="section wrap two-col">
        <div className="side"><h2>PHILOSOPHY</h2><p className="ja">理念</p></div>
        <div className="prose">
          <p className="display" style={{ fontSize: "clamp(28px,3.4vw,48px)", fontFamily: "var(--font-body)", fontWeight: 700, lineHeight: 1.4 }}>進化したこの時代で、新たな個性をさらけ出す。</p>
          <p>MASK OFFには「仮面を外す」「素の自分」という意味があります。私たちはオリジナルファッションブランドの企画・デザインを軸に事業を始め、いまはWeb・採用・キャリア・BPO・IT導入へと領域を広げてきました。</p>
          <p>どの事業も根底にあるのは同じ問いです。「その人、その会社の素の魅力は何か」。答えを見つけ、形にして、届ける。それが私たちの仕事です。</p>
        </div>
      </section>

      <section className="section wrap two-col">
        <div className="side"><h2>PROFILE</h2><p className="ja">会社概要</p></div>
        <dl className="dl">
          <dt>社名</dt><dd>{SITE.name}（{SITE.nameEn}）</dd>
          <dt>代表者</dt><dd>{SITE.ceo}</dd>
          <dt>設立</dt><dd>{SITE.founded}</dd>
          <dt>資本金</dt><dd>{SITE.capital}</dd>
          <dt>従業員数</dt><dd>{SITE.employees}</dd>
          <dt>所在地</dt><dd>{SITE.address}</dd>
          <dt>連絡先</dt><dd>TEL {SITE.tel} / {SITE.email}</dd>
          <dt>事業内容</dt>
          <dd><ul>{SERVICES.map((s) => <li key={s.slug}>・{s.title}</li>)}</ul></dd>
        </dl>
      </section>

      <section className="section wrap two-col">
        <div className="side"><h2>MEMBERS</h2><p className="ja">メンバー</p></div>
        <ul className="members">
          {members.map((m) => (
            <li key={m.id} className="member">
              <div className="avatar" />
              <p className="role">{m.role}</p>
              <h3>{m.name}</h3>
              <p>{m.bio}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section wrap two-col">
        <div className="side"><h2>ACCESS</h2><p className="ja">アクセス</p></div>
        <div>
          <p>{SITE.address}</p>
          <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>○○線 ○○駅 徒歩X分（サンプル）</p>
          <div style={{ marginTop: 24, aspectRatio: "16/7", background: "var(--surface)", display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 13 }}>Google Map 埋め込み（要 iframe）</div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
