import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { WORKS, type Work } from "@/lib/works";

const SIZES = ["L", "M", "S", "M2", "S2"] as const;

/**
 * 全幅の行リスト。PC はホバーでサムネ 5 枚が散布し他行が薄くなる。≤820 は画面中央の行がアクティブ（RevealObserver）。
 * @example <WorksList />
 */
export default function WorksList({ works = WORKS }: { works?: readonly Work[] }) {
  return (
    <section id="works" aria-labelledby="works-title" className="section-pad">
      <div className="wrap">
        <SectionHeading en="WORKS" ja="制作・支援事例" id="works-title" className="max-tab:mb-[240px]" />
      </div>
      <ul id="work-list" className="work-list max-tab:wrap max-tab:flex max-tab:flex-col max-tab:gap-16">
        {works.map((w, i) => (
          <li
            key={w.id}
            data-pat={`p${i % 3}`}
            data-activate
            data-url={w.url}
            className="work-row relative grid grid-cols-[88px_minmax(220px,auto)_1fr] items-center gap-x-[30px] px-pad-x py-7 max-tab:grid-cols-[60px_1fr] max-tab:gap-x-3.5 max-tab:px-0.5 max-tab:py-1"
          >
            <Picture src={w.logo} alt="" sizes="88px" className="work-av block size-[88px] overflow-hidden rounded-full max-tab:size-[60px]" imgClassName="size-full object-cover" />
            <div className="min-w-0">
              <h3 className="font-display text-[clamp(22px,2.2vw,30px)] font-bold leading-[1.15] tracking-[.005em] text-fg max-tab:text-[19px] max-tab:leading-[1.1]">
                {w.url ? (
                  <a href={w.url} target="_blank" rel="noopener" className="work-nm">
                    <span className="nm-a">{w.name}</span>
                    <span className="nm-b" aria-hidden>{w.name}</span>
                  </a>
                ) : (
                  <span className="work-nm">
                    <span className="nm-a">{w.name}</span>
                    <span className="nm-b" aria-hidden>{w.name}</span>
                  </span>
                )}
              </h3>
              <p className="mt-0.5 text-[12.5px] font-medium tracking-[.02em] text-fg-muted max-tab:text-[11px] max-tab:font-semibold">{w.kind}</p>
            </div>
            <p className="w-[max(520px,52vw)] max-w-full justify-self-end text-[13px] leading-[1.85] text-fg-body max-tab:col-span-full max-tab:mt-3 max-tab:w-auto max-tab:text-[11.5px] max-tab:leading-[1.8]">
              {w.text}
            </p>
            <ul className="work-thumbs" aria-hidden>
              {w.thumbs.slice(0, 5).map((src, k) => (
                <li key={src} className="work-sc" data-size={SIZES[k]}>
                  <Picture src={src} alt="" sizes="240px" className="block size-full" imgClassName="size-full rounded-[4px] object-cover" />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
