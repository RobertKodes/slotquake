import { clamp } from "./mapping";

export type NeedleState = {
  y: number;
  v: number;
  phase: number;
  wander: number;
};

export function createNeedle(): NeedleState {
  return { y: 0, v: 0, phase: 0, wander: 0 };
}

/**
 * Spring-mass needle. Tremor is scratchy microseism, quake is a slow wander,
 * kicks are aftershocks (failed txs). Reduced-motion settles without scribble.
 */
export function stepNeedle(
  n: NeedleState,
  dt: number,
  tremor: number,
  quake: number,
  noise: number,
  reduced: boolean,
): number {
  const t = clamp(dt, 0, 0.05);
  n.phase += t * (8.5 + tremor * 14);
  n.wander += (noise - n.wander) * Math.min(1, t * (1.1 + quake * 3.2));

  if (reduced) {
    const rest = n.wander * quake * 0.35;
    n.y += (rest - n.y) * Math.min(1, t * 4.2);
    n.v = 0;
    return clamp(n.y, -1, 1);
  }

  const micro = Math.sin(n.phase) * tremor * 0.12 + noise * tremor * 0.2;
  const target = n.wander * (0.22 + quake * 0.72) + micro;
  const stiffness = 96;
  const damping = 8.6;
  n.v += (target - n.y) * stiffness * t - n.v * damping * t;
  n.y = clamp(n.y + n.v * t, -1.18, 1.18);
  return n.y;
}

export function kickNeedle(n: NeedleState, mag: number, sign: number): void {
  const m = clamp(mag, 0, 1);
  const s = sign < 0 ? -1 : 1;
  n.v += s * (2.1 + m * 5.2);
  n.y = clamp(n.y + s * m * 0.28, -1.18, 1.18);
}

export function needleAngleDeg(y: number): number {
  return clamp(y, -1.2, 1.2) * 16.5;
}
