"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/content/products";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];

  const displayName = product.colorway
    ? `${product.name} — ${product.colorway}`
    : product.name;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={styles.card}
      aria-label={`View details for ${displayName}`}
    >
      <div className={styles.imageWrap}>
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        <Image
          src={primaryImage.src}
          alt={primaryImage.alt}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={styles.img}
        />
      </div>

      <div className={styles.details}>
        <h3 className={styles.title}>{displayName}</h3>
      </div>
    </Link>
  );
}

