"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={[styles.header, scrolled ? styles.scrolled : ""].join(" ")}>

        {/* Left nav */}
        <nav className={styles.leftNav} aria-label="Left navigation">
          <Link href="/about" className={styles.navLink}>OUR STORY</Link>
          <Link href="/collections/optical" className={styles.navLink}>OPTICAL</Link>
          <Link href="/collections/sunglasses" className={styles.navLink}>SUNGLASSES</Link>
        </nav>

        {/* Centre logo */}
        <Link href="/" aria-label="PRYDE home" className={styles.brand}>
          P R Y D E
        </Link>

        {/* Right nav */}
        <nav className={styles.rightNav} aria-label="Right navigation">
          <Link href="/collections" className={styles.navLink}>COLLECTIONS</Link>
          <Link href="/contact" className={styles.navLink}>CONTACT</Link>
          <Link href="/collections" className={styles.arrowBtn} aria-label="Explore collections">
            <span aria-hidden="true">→</span>
          </Link>
        </nav>

      </header>
    </>
  );
}
