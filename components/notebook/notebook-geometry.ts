// All lengths are book-width units (cqw). Rings and paper share ONE geometry.
export const RING_POSITIONS = [18, 50, 82] as const;
export const RING_RADIUS = 5.208;
export const HOLE_OFFSET = 3.8;
export const PAPER_WIDTH = 97.2;
export const PAPER_HEIGHT = 57.875;
export const HOLE_ROW = PAPER_HEIGHT * HOLE_OFFSET / 100;
export const PAPER_HINGE = HOLE_ROW - RING_RADIUS;

export function ringPoint(angle: number) {
  return { y: RING_RADIUS * Math.cos(angle), z: RING_RADIUS * Math.sin(angle) };
}
