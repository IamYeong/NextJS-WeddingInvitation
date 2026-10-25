import { HOLE_ROW, PAPER_HEIGHT, PAPER_WIDTH, PAPER_HINGE, RING_RADIUS, ringPoint } from "./notebook-geometry";
export { PAPER_HEIGHT, PAPER_WIDTH, PAPER_HINGE } from "./notebook-geometry";

export type Point = { x: number; y: number };
export type Point3D = Point & { z: number };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
export const TRANSITION_SEGMENTS = 16;
export const CURL_RADIUS = RING_RADIUS * 1.25;
const rectangle: readonly Point[] = [
  { x: 0, y: 0 }, { x: PAPER_WIDTH, y: 0 },
  { x: PAPER_WIDTH, y: PAPER_HEIGHT }, { x: 0, y: PAPER_HEIGHT },
];
function clip(nx: number, ny: number, distance: number, flipped: boolean, input = rectangle): Point[] {
  const result: Point[] = [];
  const side = (point: Point) => (nx * point.x + ny * point.y - distance) * (flipped ? -1 : 1);
  for (let i = 0; i < input.length; i++) {
    const a = input[i], b = input[(i + 1) % input.length];
    const sa = side(a), sb = side(b);
    if (sa <= 0) result.push(a);
    if ((sa < 0 && sb > 0) || (sa > 0 && sb < 0)) {
      const t = sa / (sa - sb);
      result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return result;
}
const polygon = (points: readonly Point[]) => points.length < 3 ? "polygon(0 0,0 0,0 0)" :
  `polygon(${points.map(({ x, y }) => `${x / PAPER_WIDTH * 100}% ${y / PAPER_HEIGHT * 100}%`).join(",")})`;

/** One travelling U: flat paper -> fixed 180-degree curl -> reversed paper.
 * Vertical progress moves this boundary; current x selects its diagonal.
 * The page has no additional progress-dependent rotation or late unfolding. */
export function pageFold(direction: number, progress: number, focus = .75) {
  const p = clamp(progress);
  const side = direction > 0 ? 1 : -1;
  // A tiny U grows out of the free edge without popping a finite flap into
  // view. Its turning angle is already 180 degrees at the first drag frame.
  const radius = Math.min(CURL_RADIUS, .65 * p * PAPER_HEIGHT / (Math.PI * Math.max(1e-9, 1 - p)));
  const arcLength = Math.PI * radius;
  // Straighten the diagonal before the U reaches the three punched holes.
  // This leaves all holes on the same circular binding path, never sheared.
  const slope = (clamp(focus) * 2 - 1) * .25 * (1 - smooth((p - .45) / .15));
  const ny = 1 / Math.hypot(slope, 1), nx = slope * ny;
  const support = ny * PAPER_HEIGHT + Math.abs(nx) * PAPER_WIDTH / 2;
  const distance = nx * PAPER_WIDTH / 2 + support - p * (support + arcLength);
  const ax = PAPER_WIDTH / 2, ay = (distance - nx * ax) / ny;
  let along = 0, height = 0;
  function surface(offset: number, rotation: number, points: Point[]) {
    const c = Math.cos(rotation), s = Math.sin(rotation), t = 1 - c;
    const xx = c + ny * ny * t, xy = -nx * ny * t, xz = -nx * s;
    const yx = xy, yy = c + nx * nx * t, yz = -ny * s;
    const zx = nx * s, zy = ny * s;
    const startX = ax + nx * offset, startY = ay + ny * offset;
    const translation = {
      x: ax + nx * along - xx * startX - xy * startY,
      y: ay + ny * along - yx * startX - yy * startY,
      z: height - zx * startX - zy * startY,
    };
    const matrix = [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, c, 0, 0, 0, 0, 1];
    const bendPoint = ({ x, y, z = 0 }: Point3D): Point3D => ({
      x: xx * x + xy * y + xz * z + translation.x,
      y: yx * x + yy * y + yz * z + translation.y,
      z: zx * x + zy * y + c * z + translation.z,
    });
    return { offset, rotation, points, matrix, translation, bendPoint,
      clip: polygon(points), ink: side * c >= 0 ? 1 : .22,
      transform: `translate3d(${translation.x}cqw,${translation.y}cqw,${translation.z}cqw) matrix3d(${matrix.join(",")})` };
  }
  const step = arcLength / TRANSITION_SEGMENTS;
  const transition = Array.from({ length: TRANSITION_SEGMENTS }, (_, index) => {
    const offset = step * index;
    const points = clip(nx, ny, distance + offset + step, false, clip(nx, ny, distance + offset, true));
    const rotation = side * Math.PI * (index + .5) / TRANSITION_SEGMENTS;
    const part = surface(offset, rotation, points);
    along += step * Math.cos(rotation);
    height += step * Math.sin(rotation);
    return part;
  });
  const front = clip(nx, ny, distance, false);
  const flap = clip(nx, ny, distance + arcLength, true);
  const tip = surface(arcLength, side * Math.PI, flap);
  const parts = [...transition, tip];
  const bendPoint = (point: Point3D): Point3D => {
    const offset = nx * point.x + ny * point.y - distance;
    if (offset <= 0 || step === 0) return point;
    return parts[Math.min(TRANSITION_SEGMENTS, Math.floor(offset / step))].bendPoint(point);
  };
  // Thread the U's punched row through the real rings. While the fold is far
  // away this is an identity translation; no independent whole-sheet flip.
  const sourceHole = { x: PAPER_WIDTH / 2, y: HOLE_ROW, z: 0 };
  const hole = bendPoint(sourceHole);
  const holePhase = arcLength ? clamp((nx * sourceHole.x + ny * HOLE_ROW - distance) / arcLength) : 0;
  const contactAngle = Math.PI * (side > 0 ? holePhase : 1 - holePhase);
  const contact = ringPoint(contactAngle);
  const shift = { x: sourceHole.x - hole.x, y: PAPER_HINGE + contact.y - side * hole.y, z: contact.z - side * hole.z };
  const transport = ({ x, y, z }: Point3D): Point3D => ({ x: x + shift.x, y: side * y + shift.y, z: side * z + shift.z });
  const extent = Math.abs(nx) * PAPER_WIDTH + ny * PAPER_HEIGHT;
  const stop = 50 + (distance + arcLength / 2 - nx * PAPER_WIDTH / 2 - ny * PAPER_HEIGHT / 2) / extent * 100;
  const band = arcLength / extent * 100;
  const gradient = `linear-gradient(${Math.atan2(nx, -ny) * 180 / Math.PI}deg, transparent ${stop - band}%, rgb(61 54 39 / .1) ${stop}%, transparent ${stop + band}%)`;
  return { front, flap, transition, parts, radius, arcLength, foldAngle: Math.PI, nx, ny, distance,
    contact, contactAngle, transport, bendPoint, matrix: tip.matrix, translation: tip.translation,
    frontClip: polygon(front), flapClip: polygon(flap), gradient,
    sheetTransform: `translate3d(${shift.x}cqw,${shift.y}cqw,${shift.z}cqw)${side < 0 ? " rotateX(180deg)" : ""}`,
    flapTransform: tip.transform, frontInk: side > 0 ? 1 : .22, flapInk: tip.ink,
  };
}
