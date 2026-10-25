import type { CSSProperties } from "react";
import styles from "./ScrollNotebook.module.css";

import { RING_POSITIONS, ringPoint } from "./notebook-geometry";
export { RING_POSITIONS, RING_RADIUS, HOLE_OFFSET } from "./notebook-geometry";

/** A ring is a continuous loop in the Y/Z plane, rather than a cropped photo.
 * The moving punched margin follows this exact loop in the same 3D scene. */
export default function NotebookBinding() {
  const segments = 96;
  return <div className={styles.binding} aria-hidden="true">
    {RING_POSITIONS.map((position) => <div key={position} className={styles.ring}
      style={{ left: `${1.4 + .972 * position}%` }}>
      {Array.from({ length: segments }, (_, index) => {
        const angle = index / segments * Math.PI * 2;
        const point = ringPoint(angle);
        return <span key={index} className={styles.ringSegment} style={{
          transform: `translate3d(-50%, ${point.y.toFixed(5)}cqw, ${point.z.toFixed(5)}cqw) rotateX(${(90 + angle * 180 / Math.PI).toFixed(5)}deg)`,
          "--metal-light": (.72 + Math.sin(angle - .7) * .22).toFixed(5),
        } as CSSProperties} />;
      })}
    </div>)}
  </div>;
}
