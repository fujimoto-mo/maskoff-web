import type { CSSProperties } from "react";
import Button from "@/components/ui/Button";

/**
 * SERVICE 一覧・詳細の末尾 CTA 帯（docs/design_handoff_service_page の「LET'S MAKE IT REAL.」）。
 * @example <ServiceCta />
 */
export default function ServiceCta() {
  return (
    <section className="wrap section-pad border-t border-border text-center">
      <p
        data-reveal="up"
        className="font-display text-[clamp(40px,7vw,88px)] font-extrabold leading-none tracking-[-.04em] text-fg"
      >
        LET&apos;S MAKE IT REAL.
      </p>
      <p
        data-reveal="up"
        style={{ "--rd": "80ms" } as CSSProperties}
        className="mt-6 text-body text-fg-muted"
      >
        各事業へのご相談・お見積りを受け付けています。
      </p>
      <div
        data-reveal="up"
        style={{ "--rd": "160ms" } as CSSProperties}
        className="mt-8"
      >
        <Button href="/contact/" dot className="px-10 py-3.5 text-[14px]">
          CONTACT
        </Button>
      </div>
    </section>
  );
}
