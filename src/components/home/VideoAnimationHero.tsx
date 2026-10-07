"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./VideoAnimationHero.module.css";

const POSTER = "/images/animation/ezgif-53e85e45aa6e6f2e-jpg/ezgif-frame-001.jpg";

export function VideoAnimationHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setIsPlaying(false));
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <section className={styles.hero} aria-label="Hero campaign video">

      {/* ── Poster / fallback image — always visible behind everything ── */}
      <Image
        src={POSTER}
        alt="PRYDE eyewear hero frame"
        fill
        priority
        className={styles.posterImg}
        sizes="100vw"
      />

      {/* ── Native <video> — shown once loaded, overlays the poster ── */}
      {!videoError && (
        <video
          ref={videoRef}
          className={`${styles.video} ${videoReady ? styles.videoVisible : ""}`}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoError(true)}
        >
          <source src="/video/hero-animation.mp4" type="video/mp4" />
          <source src="/video/hero-animation.webm" type="video/webm" />
        </video>
      )}

      {/* ── Gradient overlay ── */}
      <div className={styles.overlay} />

      {/* ── Hero copy ── */}
      <div className={styles.content}>
        <span className={styles.eyebrow}>A NEW PERSPECTIVE</span>
        <h1 className={styles.heading}>
          <span>See colour.</span>
          <span>See differently.</span>
        </h1>
        <p className={styles.subtitle}>
          Distinctive eyewear. A different point of view.
        </p>
        <Link href="/collections" className={styles.ctaButton}>
          Explore the collection <span aria-hidden="true">→</span>
        </Link>
      </div>


    </section>
  );
}
