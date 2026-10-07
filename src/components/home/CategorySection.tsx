"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./CategorySection.module.css";

const categories = [
  {
    href: "/collections/optical",
    title: "Optical",
    image: "/images/hero/hero-tortoiseshell-glasses.webp",
    alt: "PRYDE tortoiseshell optical glasses resting on travertine stone pedestal.",
  },
  {
    href: "/collections/sunglasses",
    title: "Sunglasses",
    image: "/images/hero/hero-6-amber-lens.webp",
    alt: "PRYDE amber lens black sunglasses on terracotta ledge.",
  },
];

export function CategorySection() {
  return (
    <section className={styles.section} aria-labelledby="category-heading">
      <div className={styles.container}>
        {/* Header Block */}
        <div className={styles.header}>
          <h2 id="category-heading" className={styles.heading}>
            Find your point of view.
          </h2>
          <Link href="/collections" className={styles.exploreAllLink}>
            EXPLORE ALL EYEWEAR <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* 2-Column Grid matching reference screenshot */}
        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link key={cat.href} href={cat.href} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={styles.img}
                />
                <div className={styles.overlayText}>
                  <h3 className={styles.title}>{cat.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
