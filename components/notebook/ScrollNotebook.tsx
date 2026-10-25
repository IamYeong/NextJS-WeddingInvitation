"use client";

import { memo, useEffect, useMemo, useRef, useState, type PointerEvent, type CSSProperties } from "react";
import styles from "./ScrollNotebook.module.css";
import FoldingNotebookSheet from "./FoldingNotebookSheet";
import NotebookBinding, { RING_RADIUS, RING_POSITIONS, HOLE_OFFSET } from "./NotebookBinding";

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

const PageContent = memo(function PageContent({ page }: { page?: NotebookPage }) {
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
});

type Turn = { from: number; to: number; direction: number; progress: number;
  focus: number; target: number | null; duration: number };
type Gesture = { id: number; startX: number; startY: number; lastY: number; lastTime: number;
  velocity: number; direction: number; progress: number; focus: number; tapAllowed: boolean; dragged: boolean };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
export default function ScrollNotebook({ pages, label = "우리의 이야기", className }: ScrollNotebookProps) {
  const sheets = pages.slice(0, 10);
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const queued = useRef<number | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const lastWheel = useRef(0);
  const wheelAmount = useRef(0);
  const current = Math.min(index, Math.max(0, sheets.length - 1));

  function move(direction: number, focus = .8) {
    const to = current + direction;
    if (busy.current) { queued.current = direction; return; }
    if (to < 0 || to >= sheets.length) return;
    busy.current = true;
    setTurn({ from: current, to, direction, progress: 0, focus, target: 1, duration: 600 });
  }

  function finishTurn() {
    if (!turn) return;
    const settled = turn.target === 1 ? turn.to : turn.from;
    const direction = queued.current;
    queued.current = null;
    setIndex(settled);
    if (direction !== null && settled + direction >= 0 && settled + direction < sheets.length) {
      setTurn({ from: settled, to: settled + direction, direction, progress: 0, focus: .8, target: 1, duration: 600 });
    } else {
      setTurn(null);
      busy.current = false;
    }
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || busy.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const bounds = event.currentTarget.getBoundingClientRect();
    const focus = clamp((event.clientX - bounds.left - bounds.width * .014) / (bounds.width * .972));
    gesture.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastY: event.clientY,
      lastTime: performance.now(), velocity: 0, direction: 0, progress: 0,
      focus, tapAllowed: true, dragged: false };
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = gesture.current;
    if (!drag || drag.id !== event.pointerId) return;
    const distance = drag.startY - event.clientY;
    if (Math.abs(event.clientX - drag.startX) > 8 || Math.abs(distance) > 8) drag.tapAllowed = false;
    if (!drag.dragged && Math.abs(distance) < 8) return;
    if (!drag.dragged) {
      drag.dragged = true;
      drag.direction = Math.sign(distance);
      if (current + drag.direction < 0 || current + drag.direction >= sheets.length) return;
      busy.current = true;
    }
    if (!busy.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    drag.focus = clamp((event.clientX - bounds.left - bounds.width * .014) / (bounds.width * .972));
    const now = performance.now();
    drag.velocity = (drag.lastY - event.clientY) / Math.max(1, now - drag.lastTime);
    drag.lastY = event.clientY;
    drag.lastTime = now;
    drag.progress = clamp(Math.max(0, distance * drag.direction - 8) / (event.currentTarget.clientHeight * .75));
    setTurn({ from: current, to: current + drag.direction, direction: drag.direction,
      progress: drag.progress, focus: drag.focus, target: null, duration: 0 });
  }

  function pointerEnd(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const drag = gesture.current;
    if (!drag || drag.id !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!drag.dragged) {
      if (!cancelled && drag.tapAllowed) {
        const bounds = event.currentTarget.getBoundingClientRect();
        move(event.clientY < bounds.top + bounds.height * .5 ? -1 : 1, drag.focus);
      }
      return;
    }
    if (!busy.current) return;
    const velocity = performance.now() - drag.lastTime > 100 ? 0 : drag.velocity * drag.direction;
    const target = !cancelled && (velocity > .45 || (velocity > -.45 && drag.progress >= .5)) ? 1 : 0;
    const remaining = Math.abs(target - drag.progress);
    const duration = Math.min(420, Math.max(120, remaining * 500 / Math.max(1, Math.abs(velocity) * 1.5)));
    setTurn({ from: current, to: current + drag.direction, direction: drag.direction,
      progress: drag.progress, focus: drag.focus, target, duration });
  }

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
      const direction = Math.sign(event.deltaY);
      if (!busy.current && (current + direction < 0 || current + direction >= sheets.length)) return;
      event.preventDefault();
      const now = performance.now();
      const gap = now - lastWheel.current;
      lastWheel.current = now;
      if (busy.current) { wheelAmount.current = 0; return; }
      if (gap < 180 && wheelAmount.current === 0) return;
      if (gap >= 180 || Math.sign(wheelAmount.current) !== direction) wheelAmount.current = 0;
      wheelAmount.current += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node!.clientHeight : 1);
      if (Math.abs(wheelAmount.current) >= 35) { wheelAmount.current = 0; move(direction); }
    }
    node.addEventListener("wheel", wheel, { passive: false });
    return () => node.removeEventListener("wheel", wheel);
  });

  const movingPage = turn ? sheets[turn.direction > 0 ? turn.from : turn.to] : undefined;
  const movingContent = useMemo(() => <PageContent page={movingPage} />, [movingPage]);
  if (!sheets.length) return null;

  return <section className={`${styles.notebook} ${className ?? ""}`} aria-label={label}>
    <div ref={host} className={styles.book} tabIndex={0} role="group"
      style={{ touchAction: sheets.length === 1 ? "auto" : current === 0 ? "pan-down" : current === sheets.length - 1 ? "pan-up" : "none",
        "--ring-radius": `${RING_RADIUS}cqw`,
        "--front-hole-y": `${HOLE_OFFSET}%`, "--back-hole-y": `${100 - HOLE_OFFSET}%`,
        ...Object.fromEntries(RING_POSITIONS.map((position, index) => [`--ring-${index + 1}`, `${position}%`])),
      } as CSSProperties}
      aria-label={`${label}, ${current + 1}/${sheets.length}페이지. 위아래 방향키로 넘기기`}
      onPointerDown={pointerDown} onPointerMove={pointerMove}
      onPointerUp={(event) => pointerEnd(event)} onPointerCancel={(event) => pointerEnd(event, true)}
      onLostPointerCapture={(event) => pointerEnd(event, true)}
      onKeyDown={(event) => {
        if (["ArrowDown", "PageDown", "ArrowUp", "PageUp"].includes(event.key)) {
          event.preventDefault(); move(["ArrowDown", "PageDown"].includes(event.key) ? 1 : -1);
        }
      }}>
      <div className={styles.scene}>
        <div className={styles.spine} aria-hidden="true" />
        <div className={`${styles.upper} ${styles.back}`} aria-hidden="true">
          <div className={styles.restingReverse}><PageContent page={sheets[(turn?.direction === -1 ? turn.to : current) - 1]} /></div>
        </div>
        <div className={`${styles.lower} ${styles.front}`} aria-hidden={!!turn}>
          <PageContent page={sheets[turn?.direction === 1 ? turn.to : current]} />
        </div>
        {turn && <FoldingNotebookSheet key={`${turn.from}-${turn.to}-${turn.target ?? "drag"}`}
          direction={turn.direction} progress={turn.progress} focus={turn.focus}
          target={turn.target} duration={turn.duration} onComplete={finishTurn}>
          {movingContent}
        </FoldingNotebookSheet>}
        <NotebookBinding />
      </div>
    </div>
    <nav className={styles.controls} aria-label="노트 페이지 이동">
      <button type="button" disabled={!turn && current === 0} onClick={() => move(-1)}>↑ 이전</button>
      <span role="status" aria-live="polite" aria-atomic="true">{current + 1} / {sheets.length}</span>
      <button type="button" disabled={!turn && current === sheets.length - 1} onClick={() => move(1)}>다음 ↓</button>
    </nav>
    <p className={styles.hint}>드래그해서 넘기거나 아래쪽 페이지를 터치해 주세요</p>
  </section>;
}
