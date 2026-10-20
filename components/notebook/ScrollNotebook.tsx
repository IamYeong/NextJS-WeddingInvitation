"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./ScrollNotebook.module.css";

type Placement = {
  id: string;
  /** Percentages of the usable page, from 0 to 100. */
  x: number;
  y: number;
  width: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
};

export type NotebookElement = Placement & (
  | { type: "text"; text: string; fontFamily?: string; fontSize?: number;
      fontWeight?: CSSProperties["fontWeight"]; color?: string;
      textAlign?: CSSProperties["textAlign"]; lineHeight?: number }
  | { type: "image"; src: string; alt: string; objectFit?: "cover" | "contain";
      borderRadius?: number }
);

export type NotebookPage = { id: string; label?: string; elements: NotebookElement[] };
export type ScrollNotebookProps = {
  pages: readonly NotebookPage[];
  label?: string;
  className?: string;
};

function PageContent({ page }: { page?: NotebookPage }) {
  return <div className={styles.content}>{page?.elements.map((element) => {
    const position: CSSProperties = {
      left: `${element.x}%`, top: `${element.y}%`, width: `${element.width}%`,
      height: element.height === undefined ? undefined : `${element.height}%`,
      transform: `rotate(${element.rotation ?? 0}deg)`, zIndex: element.zIndex,
    };
    return element.type === "text" ? (
      <div key={element.id} className={styles.text} style={{ ...position,
        fontFamily: element.fontFamily, fontSize: `${(element.fontSize ?? 24) / 7.36}cqw`,
        fontWeight: element.fontWeight, color: element.color,
        textAlign: element.textAlign, lineHeight: element.lineHeight ?? 1.6,
      }}>{element.text}</div>
    ) : (
      // Dynamic collage images intentionally retain percentage-based geometry.
      // eslint-disable-next-line @next/next/no-img-element
      <img key={element.id} className={styles.image} src={element.src} alt={element.alt}
        draggable={false} style={{ ...position, objectFit: element.objectFit ?? "cover",
          borderRadius: element.borderRadius }} />
    );
  })}</div>;
}

export default function ScrollNotebook({ pages, label = "우리의 이야기", className }: ScrollNotebookProps) {
  // Both the data and rendered DOM are capped at ten sheets.
  const sheets = pages.slice(0, 10);
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<{ from: number; to: number; direction: number } | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const lastWheel = useRef(0);
  const wheelAmount = useRef(0);
  const touchY = useRef<number | null>(null);
  const current = Math.min(index, Math.max(0, sheets.length - 1));

  function move(direction: number) {
    const to = current + direction;
    if (busy.current || to < 0 || to >= sheets.length) return;
    busy.current = true;
    setTurn({ from: current, to, direction });
  }

  useEffect(() => {
    if (!turn) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      setIndex(turn.to);
      setTurn(null);
      busy.current = false;
    }, reduced ? 20 : 900);
    return () => window.clearTimeout(timer);
  }, [turn]);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    function start(event: TouchEvent) { touchY.current = event.touches.length === 1 ? event.touches[0].clientY : null; }
    function drag(event: TouchEvent) {
      if (touchY.current === null || event.touches.length !== 1) return;
      const direction = Math.sign(touchY.current - event.touches[0].clientY);
      if (busy.current || (current + direction >= 0 && current + direction < sheets.length)) event.preventDefault();
    }
    function end(event: TouchEvent) {
      if (touchY.current === null) return;
      const distance = touchY.current - event.changedTouches[0].clientY;
      touchY.current = null;
      if (Math.abs(distance) > 40) move(Math.sign(distance));
    }
    function cancel() { touchY.current = null; }
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
      const direction = Math.sign(event.deltaY);
      // Let the surrounding document scroll once the first/last page is reached.
      if (!busy.current && (current + direction < 0 || current + direction >= sheets.length)) return;
      event.preventDefault();
      const now = performance.now();
      const gap = now - lastWheel.current;
      lastWheel.current = now;
      if (busy.current) { wheelAmount.current = 0; return; }
      // Ignore momentum from the same gesture, even after the animation ends.
      if (gap < 180 && wheelAmount.current === 0) return;
      if (gap >= 180 || Math.sign(wheelAmount.current) !== direction) wheelAmount.current = 0;
      wheelAmount.current += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node!.clientHeight : 1);
      if (Math.abs(wheelAmount.current) >= 35) {
        wheelAmount.current = 0;
        move(direction);
      }
    }
    node.addEventListener("wheel", wheel, { passive: false });
    node.addEventListener("touchstart", start, { passive: true });
    node.addEventListener("touchmove", drag, { passive: false });
    node.addEventListener("touchend", end);
    node.addEventListener("touchcancel", cancel);
    return () => {
      node.removeEventListener("wheel", wheel);
      node.removeEventListener("touchstart", start);
      node.removeEventListener("touchmove", drag);
      node.removeEventListener("touchend", end);
      node.removeEventListener("touchcancel", cancel);
    };
  });

  if (!sheets.length) return null;
  const movingPage = turn ? sheets[turn.direction > 0 ? turn.from : turn.to] : undefined;

  return <section className={`${styles.notebook} ${className ?? ""}`} aria-label={label}>
    <div ref={host} className={styles.book} tabIndex={0} role="group"
      aria-label={`${label}, ${current + 1}/${sheets.length}페이지. 위아래 방향키로 넘기기`}
      onKeyDown={(event) => {
        if (["ArrowDown", "PageDown", "ArrowUp", "PageUp"].includes(event.key)) {
          event.preventDefault(); move(["ArrowDown", "PageDown"].includes(event.key) ? 1 : -1);
        }
      }}>
      <div className={styles.upper} aria-hidden="true">
        <PageContent page={sheets[(turn?.direction === -1 ? turn.to : current) - 1]} />
      </div>
      <div className={styles.lower} aria-hidden={!!turn}>
        <PageContent page={sheets[turn?.to ?? current]} />
      </div>
      {turn && <div key={`${turn.from}-${turn.to}`} aria-hidden="true"
        className={`${styles.turning} ${turn.direction > 0 ? styles.forward : styles.backward}`}>
        <div className={styles.front}><PageContent page={movingPage} /></div>
        <div className={styles.back}><PageContent page={movingPage} /></div>
      </div>}
    </div>
    <nav className={styles.controls} aria-label="노트 페이지 이동">
      <button type="button" disabled={current === 0 || !!turn} onClick={() => move(-1)}>↑ 이전</button>
      <span role="status" aria-live="polite" aria-atomic="true">{current + 1} / {sheets.length}</span>
      <button type="button" disabled={current === sheets.length - 1 || !!turn} onClick={() => move(1)}>다음 ↓</button>
    </nav>
    <p className={styles.hint}>스크롤하거나 위로 쓸어 넘겨 주세요</p>
  </section>;
}
