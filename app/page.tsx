import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";
import { ServiceCards } from "@/components/ServiceCards";
import { Faq } from "@/components/Faq";
import { ContactForm } from "@/components/ContactForm";
import { Picture } from "@/components/Picture";
import { JsonLd } from "@/components/JsonLd";
import { cms, fmtDate } from "@/lib/cms";
import { WORKS } from "@/lib/works";
import { SITE } from "@/lib/site";

const PARTNERS = [
  { tag: "SPORTS", name: "Sample Football Club", text: "地域からトップリーグを目指すクラブ。2026シーズンのオフィシャルパートナーとしてユニフォーム製作を担当（サンプル）。" },
  { tag: "EVENT", name: "Sample Creative Fes", text: "映像・デザイン・音楽の表現者が集う創作フェス。ブース出展と物販運営を支援（サンプル）。" },
  { tag: "SCHOOL", name: "Sample Tech School", text: "地域のIT人材育成プログラムにカリキュラムを提供（サンプル）。" },
  { tag: "COMMUNITY", name: "Sample Artist Collective", text: "所属アーティストの制作・発信をバックアップ（サンプル）。" },
];

const STEPS = [
  { t: "フォーム送信", s: "1分ほどで完了します。" },
  { t: "担当より返信", s: "2営業日以内にメールでご連絡します。" },
  { t: "オンライン相談", s: "30分程度で課題とご希望を整理します。" },
  { t: "ご提案・見積", s: "内容に合わせて最適な進め方をご提案します。" },
];

export default async function Home() {
  const [faq, news] = await Promise.all([cms.faq(), cms.news()]);
  const marqueeText = (
    <>TAKE THE <em>MASK</em> OFF. — BE YOURSELF. —&nbsp;</>
  );

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
      }} />

      {/* HERO — Dipsy のマーキー見出しに相当 */}
      <section className="hero" aria-label="メインビジュアル">
        <h1 className="sr-only">{SITE.name} — {SITE.tagline}</h1>
        <div className="marquee" aria-hidden>
          <div>{marqueeText}</div><div>{marqueeText}</div>
        </div>
        <div className="hero-foot wrap">
          <p>MASK OFFには「仮面を外す」「素の自分」という意味があります。私たちは、進化したこの時代で新たな個性をさらけ出すために、アパレル・IT・キャリア・BPOの8つの事業で、人と企業の「素」を引き出します。</p>
          <div className="sns">
            <a href={SITE.sns.instagram} target="_blank" rel="noopener">INSTAGRAM</a>
            <a href={SITE.sns.x} target="_blank" rel="noopener">X</a>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section id="vision" className="section wrap">
        <SectionHead en="VISION" ja="私たちの想い" />
        <div className="vision">
          <p className="lead">仮面を外したその先に、その人だけの価値がある。</p>
          <div className="body">
            <p>誰かに合わせるために被った仮面は、いつのまにか自分の輪郭を曖昧にしていく。私たちはファッションブランドの企画から始まった会社です。服は、着る人の「素」を隠すためではなく、引き出すためにある。その考え方は、いま手がけているすべての事業に通じています。</p>
            <p>Web制作、採用支援、キャリア相談、業務代行、IT導入。領域は違っても、やっていることは同じです。人や企業が本来持っている個性を見つけ、形にして、届ける。</p>
            <p>進化し続けるこの時代に、新たな個性をさらけ出す。MasKOFFはそのための仕組みと仲間をつくる会社です。</p>
          </div>
        </div>
      </section>

      {/* SERVICE — PC グリッド / SP カルーセル */}
      <section id="service" className="section section-service">
        <SectionHead en="SERVICE" ja="8つの事業" />
        <ServiceCards variant="grid" />
        <p style={{ marginTop: 40 }}><Link href="/service/" className="link-more">事業一覧を見る</Link></p>
      </section>

      {/* WORKS — Dipsy OFFICIAL CREATORS 相当 */}
      <section id="works" className="section wrap">
        <SectionHead en="WORKS" ja="制作・支援事例（サンプル）" />
        <ul className="works-grid">
          {WORKS.map((w) => (
            <li key={w.id} className="work">
              <div className="avatar"><Picture src={w.image} alt="" sizes="96px" /></div>
              <div>
                <h3>{w.name}</h3>
                <p className="role">{w.role}</p>
                <p>{w.text}</p>
                <a href={w.url} className="handle">@{w.handle}</a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* PARTNERS — Dipsy SPONSORING 相当（SP 非表示） */}
      <section id="partners" className="section section-partners wrap">
        <SectionHead en="PARTNERS" ja="MasKOFFが支援する活動" />
        <p style={{ maxWidth: "40em", marginBottom: 48 }}>スポーツ・カルチャー・教育の現場を、ものづくりとテクノロジーで支えています。表現者が輝く場所に寄り添い、その未来を共につくる仲間であり続けます。</p>
        <ul className="partners-grid">
          {PARTNERS.map((p) => (
            <li key={p.name} className="partner">
              <span className="tag">{p.tag}</span>
              <div className="mark" aria-hidden>LOGO</div>
              <h3>{p.name}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* NEWS（直近3件） */}
      <section id="news" className="section wrap">
        <div className="news-strip">
          <div>
            <SectionHead en="NEWS" ja="ニュース" />
            <ul className="list">
              {news.slice(0, 3).map((n) => (
                <li key={n.id}>
                  <Link href={`/news/${n.id}/`} className="list-row">
                    <time dateTime={n.publishedAt}>{fmtDate(n.publishedAt)}</time>
                    <span className="cat">{n.category?.name}</span>
                    <span className="title">{n.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/news/" className="btn btn-line btn-sm">すべてのニュース</Link>
        </div>
      </section>

      {/* FAQ — PC 2カラム静的 / SP アコーディオン */}
      <section id="faq" className="section section-faq">
        <SectionHead en="FAQ" ja="よくあるご質問" />
        <Faq items={faq} />
      </section>

      {/* CONTACT — Dipsy OPEN CALL 相当 */}
      <section id="contact" className="section wrap">
        <SectionHead en="CONTACT" ja="お問い合わせ・ご相談" />
        <p className="contact-intro">まず、話すことから。事業のご相談、採用、取材のご依頼はこちらから。</p>
        <ol className="steps" aria-label="ご相談の流れ">
          {STEPS.map((s) => <li key={s.t}><strong>{s.t}</strong><span>{s.s}</span></li>)}
        </ol>
        <ContactForm compact />
      </section>
    </>
  );
}
