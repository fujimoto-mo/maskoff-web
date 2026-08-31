import Marker from "@/components/ui/Marker";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";

/** VISION。黒背景遷移・手書きストローク描画・段落フェードはフェーズ③。 */
export default function VisionBlock() {
  return (
    <section id="vision" aria-labelledby="vision-title" className="section-pad">
      <div className="wrap">
        <SectionHeading en="VISION" ja="私たちの想い" id="vision-title" />
        <div className="grid grid-cols-2 gap-gap-cols max-tab:grid-cols-1 max-tab:gap-[76px]">
          <div>
            <Picture src="/images/company/vision-handwriting.svg" alt="仮面を外して、素の自分で。" width={640} height={160} className="mb-10 block w-full max-w-[560px]" imgClassName="h-auto w-full" />
            {/* SAMPLE: 本文は仮。マーカーは 1 セクション 3 箇所まで */}
            <div className="space-y-[22px] text-body leading-[2] text-fg max-sp:text-body-sp [&>p]:max-w-[560px]">
              <p>「MASK OFF」には、仮面を外す、素の自分という意味があります。誰かに合わせるために被った仮面は、いつのまにか自分の輪郭を曖昧にしていく。</p>
              <p>
                私たちはファッションブランドの企画から始まった会社です。服は、着る人の「素」を隠すためではなく、<Marker>引き出すためにある</Marker>。その考え方は、アーティストの活動支援にも、ホームページ制作にも通じています。
              </p>
              <p>
                領域は違っても、やっていることは同じです。人や企業が本来持っている個性を見つけ、形にして、届ける。<Marker>進化したこの時代で、新たな個性をさらけ出す</Marker>。
              </p>
              <p>
                MasKOFFは、そのための仕組みと仲間をつくる会社です。<Marker>素の自分で立てる場所</Marker>が、ここから増えていくことを願って。
              </p>
            </div>
          </div>
          <div className="w-full max-w-[540px] justify-self-center max-tab:order-last max-tab:mt-2.5">
            <Picture src="/images/company/vision-diagram.svg" alt="ブランド・アーティスト・クライアントを Web と EC がつなぐ関係図" width={540} height={420} className="block w-full" imgClassName="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
