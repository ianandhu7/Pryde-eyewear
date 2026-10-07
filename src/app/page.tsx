import { ScrollAnimationHero } from "@/components/home/ScrollAnimationHero";
import { CategorySection } from "@/components/home/CategorySection";
import { BrandIntroduction } from "@/components/home/BrandIntroduction";
import { CollectionHighlights } from "@/components/home/CollectionHighlights";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/");

export default function Home() {
  return (
    <main>
      <ScrollAnimationHero />
      <CategorySection />
      <BrandIntroduction />
      <CollectionHighlights />

      {/* Boutique Stockist Callout Banner */}
      <section style={{
        padding: "clamp(80px, 10vw, 140px) 4%",
        backgroundColor: "var(--paper-dark)",
        borderTop: "1px solid rgba(10,10,10,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "24px"
      }}>
        <span style={{ fontSize: "11px", letterSpacing: "0.25em", color: "var(--stone-dark)", fontWeight: 600 }}>
          OPTICAL STOCKISTS & PARTNERS
        </span>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(36px, 5vw, 68px)", fontWeight: 300, color: "var(--ink)", maxWidth: "800px", lineHeight: 1.05 }}>
          Experience PRYDE in person at selected optical retailers worldwide.
        </h2>
        <p style={{ fontSize: "15px", color: "#666666", maxWidth: "480px", lineHeight: 1.6 }}>
          Discover our full frame collection, custom lens fitting services, and personal styling appointments.
        </p>
        <Link
          href="/where-to-buy"
          style={{
            marginTop: "16px",
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "11px",
            letterSpacing: "0.22em",
            fontWeight: 600,
            color: "var(--paper)",
            backgroundColor: "var(--ink)",
            padding: "16px 36px",
            textDecoration: "none",
            transition: "opacity 0.3s ease"
          }}
        >
          FIND US NEAR YOU <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}

