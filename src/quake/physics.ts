import { clamp } from "./mapping";

export type NeedleState = {
  y: number;
  v: number;
  phase: number;
};

export function createNeedle(): NeedleState {
  return { y: 0, v: 0, phase: 0 };
}

/**
 * Spring-mass needle. Tremor is fast noise, quake is a slower wander,
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
  n.phase += t * (0.85 + quake * 3.4);
  const slow = Math.sin(n.phase) * quake * 0.62;
  const jitter = reduced ? 0 : noise * tremor * 0.22;
  const target = slow + jitter;

  if (reduced) {
    n.y += (slow * 0.55 - n.y) * Math.min(1, t * 4.2);
    n.v = 0;
    return clamp(n.y, -1, 1);
  }

  const stiffness = 88;
  const damping = 9.4;
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
