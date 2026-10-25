"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PhotoPrinter.module.css";

export type PrinterPhoto = {
  src: string;
  alt: string;
  objectPosition?: string;
};

type PhotoPrinterProps = {
  photos: readonly [PrinterPhoto | null, PrinterPhoto | null, PrinterPhoto | null, PrinterPhoto | null];
  caption?: string;
  onPhotoClick?: (index: number) => void;
};

/** A fixed 2×2 frame. Change photos to print a new set; photos stay local to the caller. */
export default function PhotoPrinter({ photos, caption, onPhotoClick }: PhotoPrinterProps) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [edition, setEdition] = useState(0);
  const [completedPrint, setCompletedPrint] = useState<string | null>(null);
  const photoKey = JSON.stringify(photos);
  const printKey = `${photoKey}-${edition}`;
  const printing = completedPrint !== printKey;

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    // Also completes when the user has disabled motion (no animationend fires).
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setCompletedPrint(printKey), reducedMotion ? 0 : 4200);
    return () => window.clearTimeout(timer);
  }, [visible, printKey]);

  return (
    <div className={styles.printer} ref={root}>
      <div className={styles.machine} role="group" aria-label="네컷 사진 인화기">
        {/* eslint-disable-next-line @next/next/no-img-element -- Layered local raster asset. */}
        <img className={styles.outlet} src="/images/photo-printer/outlet.png" alt="" />
        <div className={styles.feed}>
          <div
            key={printKey}
            className={`${styles.paper} ${visible ? styles.print : styles.waiting}`}
            onAnimationEnd={() => setCompletedPrint(printKey)}
          >
            <div className={styles.photos}>
              {photos.map((photo, index) => photo === null ? (
                <div className={`${styles.photo} ${styles.emptyPhoto}`} key={index} aria-label="빈 사진 칸" />
              ) : (
                <div className={styles.photo} key={index} data-photo-index={index}>
                  {onPhotoClick ? <button className={styles.photoButton} type="button" disabled={printing} onClick={() => onPhotoClick(index)} aria-label={`${index + 1}번째 사진 크게 보기`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.src} alt={photo.alt} style={{ objectPosition: photo.objectPosition }} />
                  </button> : <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.src} alt={photo.alt} style={{ objectPosition: photo.objectPosition }} />
                  </>}
                </div>
              ))}
            </div>
            {caption && <span className={styles.caption}>{caption}</span>}
          </div>
        </div>
        <div className={styles.lip} aria-hidden="true" />
      </div>
      <div className={styles.controls}>
        <span role="status" aria-live="polite">{printing ? "사진을 인화하고 있어요" : "우리의 소중한 순간"}</span>
        <button type="button" disabled={printing} onClick={() => {
          setEdition((value) => value + 1);
        }}>다시 인화하기 <span aria-hidden="true">↻</span></button>
      </div>
    </div>
  );
}
