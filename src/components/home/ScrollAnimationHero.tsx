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
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastDrawnIndexRef = useRef<number>(-1);
  const frameIndexRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const isPlayingRef = useRef(true);
  const isVisibleRef = useRef(true);
  const isReadyRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);

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

  // Controlled RAF loop manager:
  // Ensures only ONE loop can ever run, and every start path verifies:
  // - tab visibility (!document.hidden)
  // - viewport visibility (isVisibleRef.current)
  // - play/pause state (isPlayingRef.current)
  // - reduced motion preference (!prefersReducedMotionRef.current)
  // - asset readiness (isReadyRef.current)
  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const canRun = useCallback(() => {
    if (typeof document === "undefined") return false;
    return (
      isReadyRef.current &&
      !prefersReducedMotionRef.current &&
      isPlayingRef.current &&
      isVisibleRef.current &&
      !document.hidden
    );
  }, []);

  const animate = useCallback(
    (timestamp: number) => {
      if (!canRun()) {
        stopLoop();
        return;
      }

      const interval = 1000 / fps;
      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= interval) {
        lastTimeRef.current = timestamp - (elapsed % interval);
        frameIndexRef.current = (frameIndexRef.current + 1) % totalFrames;
        drawFrame(frameIndexRef.current);
      }

      if (canRun()) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        stopLoop();
      }
    },
    [totalFrames, fps, drawFrame, canRun, stopLoop]
  );

  const startLoop = useCallback(() => {
    // Prevent multiple concurrent loops
    if (rafRef.current !== null) return;
    if (!canRun()) return;

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);
  }, [canRun, animate]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (e: MediaQueryListEvent | MediaQueryList) => {
      prefersReducedMotionRef.current = e.matches;
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        stopLoop();
      } else {
        startLoop();
      }
    };
    prefersReducedMotionRef.current = mediaQuery.matches;
    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, [startLoop, stopLoop]);

  // Progressive streaming preload:
  // 1. First frame loads eagerly to enable instant poster-to-canvas rendering.
  // 2. Initial buffer of 24 frames loads swiftly to start playback without delay.
  // 3. Subsequent frames stream in background in controlled batches of 4, avoiding 299 parallel requests at once.
  useEffect(() => {
    if (prefersReducedMotion) return;

    const images: (HTMLImageElement | null)[] = new Array(totalFrames).fill(null);
    imagesRef.current = images;

    let cancelled = false;
    const INITIAL_BUFFER = Math.min(24, totalFrames);
    const CONCURRENCY = 4;

    const loadSingleFrame = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        if (cancelled || images[index]) return resolve();
        const img = new Image();
        img.src = getFrameUrl(index);
        img.onload = () => {
          if (!cancelled) {
            images[index] = img;
          }
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    // Step 1: Load frame 0 immediately
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    const onFirstLoad = () => {
      if (cancelled) return;
      images[0] = firstImg;
      drawFrame(0);
    };
    firstImg.onload = onFirstLoad;
    if (firstImg.complete && firstImg.naturalWidth > 0) {
      onFirstLoad();
    }

    // Step 2: Load startup buffer
    const startupBatch: Promise<void>[] = [];
    for (let i = 1; i < INITIAL_BUFFER; i++) {
      startupBatch.push(loadSingleFrame(i));
    }

    Promise.all(startupBatch).then(() => {
      if (cancelled) return;
      isReadyRef.current = true;
      setIsReady(true);
      startLoop();

      // Step 3: Stream the remaining frames in controlled background batches
      let nextIndex = INITIAL_BUFFER;
      const loadNextBatch = () => {
        if (cancelled || nextIndex >= totalFrames) return;
        const batch: Promise<void>[] = [];
        const end = Math.min(nextIndex + CONCURRENCY, totalFrames);
        for (let i = nextIndex; i < end; i++) {
          batch.push(loadSingleFrame(i));
        }
        nextIndex = end;
        Promise.all(batch).then(() => {
          if (!cancelled && nextIndex < totalFrames) {
            if (typeof window !== "undefined" && "requestIdleCallback" in window) {
              (window as unknown as { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => void })
                .requestIdleCallback(loadNextBatch, { timeout: 200 });
            } else {
              setTimeout(loadNextBatch, 50);
            }
          }
        });
      };

      loadNextBatch();
    });

    return () => {
      cancelled = true;
      stopLoop();
    };
  }, [totalFrames, prefersReducedMotion, drawFrame, startLoop, stopLoop]);

  useEffect(() => {
    const onResize = () => drawFrame(frameIndexRef.current);
    window.addEventListener("resize", onResize, { passive: true });

    // IntersectionObserver to pause animation when scrolled off-screen
    const currentContainer = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    if (currentContainer) observer.observe(currentContainer);

    // Pause animation when browser tab is in background
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    startLoop();

    return () => {
      stopLoop();
      window.removeEventListener("resize", onResize);
      if (currentContainer) observer.unobserve(currentContainer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startLoop, stopLoop, drawFrame]);

  return (
    <section ref={containerRef} className={styles.heroContainer} aria-label="PRYDE Hero">
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
                fetchPriority="high"
                decoding="async"
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
