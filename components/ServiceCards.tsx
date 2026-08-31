import Link from "next/link";
import { SERVICES } from "@/lib/services";

export function ServiceCards({ variant = "grid" }: { variant?: "grid" | "list" }) {
  return (
    <>
      <ul className={variant === "grid" ? "service-grid" : "service-list"}>
        {SERVICES.map((s) => (
          <li key={s.slug}>
            <Link href={`/service/${s.slug}/`} className="service-card">
              <span className="verb">{s.verb}</span>
              <h3>{s.title}</h3>
              <p>{s.lead}</p>
              <span className="link-more">詳しく見る</span>
            </Link>
          </li>
        ))}
      </ul>
      {variant === "grid" && <span className="service-hint">横にスワイプして他の事業を見る</span>}
    </>
  );
}
