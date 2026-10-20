"use client";

import { useId, useState } from "react";
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
};

export default function WeddingEnvelope({ overview = defaultWeddingOverview, defaultOpen = false, open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const cardId = useId();
  return (
    <div className={styles.component}>
      <div className={styles.scene} data-open={open}>
        <div className={styles.envelope}>
          {/* Physical layers share one coordinate system; the card is never die-cut. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.back} src="/images/envelope/back.png" alt="" aria-hidden="true" />
          <div className={styles.flap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/envelope/flap.png" alt="" aria-hidden="true" />
            <div className={styles.flapOutside} />
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
      </div>
      <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={cardId} onClick={() => {
        setInternalOpen(!open);
        onOpenChange?.(!open);
      }}>{open ? "봉투 접어두기" : "초대장 열어보기"}<span aria-hidden="true">{open ? " −" : " ＋"}</span></button>
    </div>
  );
}
