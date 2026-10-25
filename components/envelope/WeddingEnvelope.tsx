"use client";

import { useEffect, useId, useState } from "react";
import styles from "./WeddingEnvelope.module.css";

export type WeddingOverview = {
  heading: string;
  names: string;
  date: string;
  venue: string;
  message: string;
};

export const defaultWeddingOverview: WeddingOverview = {
  heading: "WE ARE GETTING MARRIED",
  names: "서연 & 도윤",
  date: "2027년 5월 22일 토요일 오후 2시",
  venue: "그린가든 웨딩홀 · 2층 가든홀",
  message: "우리의 새로운 시작에 함께해 주세요.",
};

type Props = {
  overview?: WeddingOverview;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  introduction?: boolean;
  onOpened?: () => void;
};

export default function WeddingEnvelope({ overview = defaultWeddingOverview, defaultOpen = false, open: controlledOpen, onOpenChange, introduction = false, onOpened }: Props) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const cardId = useId();
  const [phase, setPhase] = useState(open ? "expanded" : "closed");
  const [settledOpen, setSettledOpen] = useState(open);
  const moving = open !== settledOpen;

  useEffect(() => {
    if (open === settledOpen) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const steps: [number, string][] = open
      ? [[0, "unsealing"], [850, "lifting"], [1600, "expanded"]]
      : [[0, "contracting"], [850, "returning"], [1600, "sealing"], [2450, "closed"]];
    const timers = steps.map(([delay, next]) => window.setTimeout(() => {
      setPhase(next);
    }, reducedMotion ? 0 : delay));
    timers.push(window.setTimeout(() => {
      setSettledOpen(open);
      if (open) onOpened?.();
    }, reducedMotion ? 0 : 2450));
    return () => timers.forEach(window.clearTimeout);
  }, [open, settledOpen, onOpened]);
  return (
    <div className={`${styles.component} ${introduction ? styles.introduction : ""}`}>
      <div className={styles.scene} data-phase={phase} aria-busy={moving}>
        <div className={styles.envelope}>
          {/* Physical layers share one coordinate system; the card is never die-cut. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.back} src="/images/envelope/back.png" alt="" aria-hidden="true" />
          <div className={styles.flapRig} aria-hidden="true">
            <div className={styles.flap}>
              {/* White paper and its green lining are the two faces of one lid. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.flapInside} src="/images/envelope/flap.png" alt="" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.flapOutside} src="/images/envelope/flap-outside-reference.png" alt="" />
            </div>
          </div>
          <article id={cardId} className={styles.card} aria-hidden={!open}>
            <p className={styles.eyebrow}>{overview.heading}</p>
            <h2>{overview.names}</h2>
            <div className={styles.rule} />
            <p>{overview.date}</p>
            <p>{overview.venue}</p>
            <p className={styles.message}>{overview.message}</p>
          </article>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.front} src="/images/envelope/front.png" alt="" aria-hidden="true" />
          <span className={styles.inscription}>TO OUR DEAREST GUESTS</span>
        </div>
        {introduction && <button type="button" className={styles.touchTarget}
          disabled={moving || open} aria-label="봉투를 터치해 청첩장 열기"
          aria-expanded={open} aria-controls={cardId} onClick={() => {
            setInternalOpen(true);
            onOpenChange?.(true);
          }} />}
      </div>
      {!introduction && <button type="button" className={styles.toggle} disabled={moving} aria-expanded={open} aria-controls={cardId} onClick={() => {
        setInternalOpen(!open);
        onOpenChange?.(!open);
      }}>{open ? "봉투 접어두기" : "초대장 열어보기"}<span aria-hidden="true">{open ? " −" : " ＋"}</span></button>}
    </div>
  );
}
