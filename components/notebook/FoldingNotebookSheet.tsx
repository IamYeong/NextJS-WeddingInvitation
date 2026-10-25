"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { pageFold } from "./paper-fold";
import styles from "./ScrollNotebook.module.css";

export default function FoldingNotebookSheet({ direction, progress, focus, target, duration, onComplete, children }: {
  direction: number; progress: number; focus: number; target: number | null; duration: number;
  onComplete: () => void; children: ReactNode;
}) {
  const [animatedProgress, setAnimatedProgress] = useState(progress);
  const complete = useRef(onComplete);
  useEffect(() => { complete.current = onComplete; }, [onComplete]);
  useEffect(() => {
    if (target === null) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    let frame: number;
    function advance(now: number) {
      const elapsed = reduced ? 1 : Math.min(1, (now - started) / Math.max(1, duration));
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setAnimatedProgress(progress + (target! - progress) * eased);
      if (elapsed === 1) complete.current();
      else frame = requestAnimationFrame(advance);
    }
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [duration, progress, target]);

  const fold = pageFold(direction, target === null ? progress : animatedProgress, focus);
  return <div className={styles.foldSheet} aria-hidden="true" style={{ transform: fold.sheetTransform }}>
    <div className={`${styles.foldFace} ${styles.front}`} style={{ clipPath: fold.frontClip }}>
      <div className={styles.foldPrint} style={{ opacity: fold.frontInk }}>{children}</div>
      <div className={styles.foldShade} style={{ background: fold.gradient }} />
    </div>
    {fold.parts.map((part, index) => <div key={index} className={styles.foldFlapLayer} style={{ transform: part.transform }}>
      <div className={`${styles.foldFace} ${styles.front}`} style={{ clipPath: part.clip }}>
        <div className={styles.foldPrint} style={{ opacity: part.ink }}>{children}</div>
        <div className={styles.foldShade} style={{ background: fold.gradient }} />
      </div>
    </div>)}
  </div>;
}
