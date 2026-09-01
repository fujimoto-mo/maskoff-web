type Step = { title: string; text: string };

/**
 * 番号バッジ + 縦線の手順リスト。
 * @example <StepFlow heading="ご相談の流れ" steps={[{ title: "フォームの送信", text: "1 分ほどで完了します。" }]} />
 */
export default function StepFlow({ heading, steps }: { heading: string; steps: readonly Step[] }) {
  return (
    <div className="pt-2.5">
      <h4 className="mb-[26px] text-[16.5px] font-bold leading-[1.55] tracking-[.01em] text-fg max-tab:text-[16px]">[ {heading} ]</h4>
      <ol className="list-none">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="relative pb-6 pl-[42px] last:pb-0 after:absolute after:top-7 after:bottom-0.5 after:left-[13px] after:w-px after:bg-border last:after:hidden"
          >
            <span aria-hidden className="absolute top-[-2px] left-0 flex size-[26px] items-center justify-center rounded-full bg-fg font-display text-[12px] font-bold text-fg-invert">
              {i + 1}
            </span>
            <b className="block text-[14px] font-bold leading-[1.55] tracking-[.01em] text-fg">{s.title}</b>
            <span className="mt-[3px] block text-caption text-fg-muted max-tab:text-[13px] max-tab:leading-[1.8]">{s.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
