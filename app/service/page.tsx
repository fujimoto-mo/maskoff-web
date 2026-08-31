import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { ServiceCards } from "@/components/ServiceCards";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: "事業内容", description: "MasKOFFの8つの事業。techMasKOFF LAB.・求人広告・WEBアプリ開発・キャリア支援・BPO・アパレルコンサルティング・越境EC・IT導入支援。" };

export default function ServiceIndex() {
  return (
    <>
      <PageHead en="SERVICE" ja="事業内容" crumbs={[{ label: "SERVICE" }]} lead="アパレルから始まり、いまは8つの事業で人と企業の「素」を引き出しています。組み合わせてのご依頼も可能です。" />
      <section className="section wrap" style={{ borderTop: 0 }}>
        <ServiceCards variant="list" />
      </section>
      <CtaBand />
    </>
  );
}
