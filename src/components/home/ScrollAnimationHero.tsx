"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import styles from "./ScrollAnimationHero.module.css";

interface HeroAnimationProps {
  totalFrames?: number;
  frameFolder?: string;
  framePrefix?: string;
  frameExt?: string;
  padZeroes?: number;
  fps?: number;
  posterUrl?: string;
  hasMatchingPanoramicVideo?: boolean;
}

// Frame sequence: public/images/animation/ezgif-7feec42b6c8612f9-jpg/
// 300 frames × 30 fps = 10 s loop. Poster = first frame of the new sequence.
const DEFAULT_POSTER = "/images/animation/ezgif-7feec42b6c8612f9-jpg/ezgif-frame-001.jpg";
const DEFAULT_FRAME_FOLDER = "/images/animation/ezgif-7feec42b6c8612f9-jpg";
const DEFAULT_FRAME_PREFIX = "ezgif-frame-";

export function ScrollAnimationHero({
  totalFrames = 300,
  frameFolder = DEFAULT_FRAME_FOLDER,
  framePrefix = DEFAULT_FRAME_PREFIX,
  frameExt = ".jpg",
  padZeroes = 3,
  fps = 30,
  posterUrl = DEFAULT_POSTER,
  hasMatchingPanoramicVideo = false,
}: HeroAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastDrawnIndexRef = useRef<number>(-1);
  const frameIndexRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const isPlayingRef = useRef(true);

  const [isReady, setIsReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  function getFrameUrl(index: number): string {
    return `${frameFolder}/${framePrefix}${String(index + 1).padStart(padZeroes, "0")}${frameExt}`;
  }

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let img = imagesRef.current[index];

    if (!img || !img.complete || img.naturalWidth === 0) {
      if (lastDrawnIndexRef.current >= 0) {
        img = imagesRef.current[lastDrawnIndexRef.current];
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    lastDrawnIndexRef.current = index;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (cssW === 0 || cssH === 0) return;

    const physW = Math.round(cssW * dpr);
    const physH = Math.round(cssH * dpr);

    if (canvas.width !== physW || canvas.height !== physH) {
      canvas.width = physW;
      canvas.height = physH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const iR = img.naturalWidth / img.naturalHeight;
    const cR = cssW / cssH;
    let dw = cssW, dh = cssH, ox = 0, oy = 0;

    // Logic for 'contain' scaling
    if (cR > iR) {
      dw = cssH * iR;
      ox = (cssW - dw) / 2;
    } else {
      dh = cssW / iR;
      oy = (cssH - dh) / 2;
    }

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, ox, oy, dw, dh);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  // Preload frames only if matching panoramic video sequence is explicitly provided
  useEffect(() => {
    if (prefersReducedMotion) return;

    const images: (HTMLImageElement | null)[] = new Array(totalFrames).fill(null);
    imagesRef.current = images;

    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    firstImg.onload = () => {
      images[0] = firstImg;
      setIsReady(true);
      drawFrame(0);
    };
    if (firstImg.complete && firstImg.naturalWidth > 0) {
      images[0] = firstImg;
      setIsReady(true);
      drawFrame(0);
    }

    for (let i = 1; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        images[i] = img;
      };
    }
  }, [totalFrames, prefersReducedMotion, drawFrame]);

  const animate = useCallback((timestamp: number) => {
    if (!isPlayingRef.current) return;

    const interval = 1000 / fps;
    const elapsed = timestamp - lastTimeRef.current;

    if (elapsed >= interval) {
      lastTimeRef.current = timestamp - (elapsed % interval);
      frameIndexRef.current = (frameIndexRef.current + 1) % totalFrames;
      drawFrame(frameIndexRef.current);
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [totalFrames, fps, drawFrame]);

  useEffect(() => {
    if (!isReady || prefersReducedMotion) return;

    isPlayingRef.current = true;
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);

    const onResize = () => drawFrame(frameIndexRef.current);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [isReady, prefersReducedMotion, animate, drawFrame]);

  return (
    <section className={styles.heroContainer} aria-label="PRYDE Hero">
      <div className={styles.contentWrapper}>
        {/* Left Text Column */}
        <div className={styles.textCol}>
          <span className={styles.eyebrow}>A NEW PERSPECTIVE</span>
          <h1 className={styles.heading}>
            <span>See colour.</span>
            <span>See differently.</span>
          </h1>
          <p className={styles.description}>
            Distinctive eyewear. A different point of view.
          </p>
          <Link href="/collections" className={styles.ctaButton}>
            Explore the collection <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Right Media Column */}
        <div className={styles.mediaCol}>
          <div className={styles.videoWrapper}>
            {/* Decorative elements */}
            <div className={styles.lavenderGlow} aria-hidden="true" />
            <div className={styles.offsetOutline} aria-hidden="true" />
            
            {/* The Video Container */}
            <div className={styles.videoContainer}>
              <img
                src={posterUrl}
                alt="PRYDE Eyewear Mediterranean courtyard scene"
                className={`${styles.posterImage} ${isReady && !prefersReducedMotion ? styles.posterHidden : ""}`}
                loading="eager"
              />
              {!prefersReducedMotion && (
                <canvas
                  ref={canvasRef}
                  className={`${styles.canvas} ${isReady ? styles.canvasVisible : ""}`}
                />
              )}
            </div>
          </div>
          
          {/* Caption below video */}
          <div className={styles.videoCaption}>
            <span className={styles.captionText}>A DIFFERENT POINT OF VIEW</span>
            <hr className={styles.captionLine} />
            <span className={styles.captionText}>01 / PRYDE IN MOTION</span>
          </div>
        </div>
      </div>
    </section>
  );
}
