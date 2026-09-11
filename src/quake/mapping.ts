import type { ChainSample, NeedleDrive, QuakeLevel } from "../types";

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * clamp(p, 0, 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const a = sorted[lo];
  const b = sorted[hi];
  if (a === undefined) return 0;
  if (b === undefined || lo === hi) return a;
  return a * (hi - idx) + b * (idx - lo);
}

export function logNorm(value: number, max: number): number {
  if (value <= 0 || max <= 0) return 0;
  return clamp(Math.log1p(value) / Math.log1p(max), 0, 1);
}

/** Background tremor from performance samples / non-vote TPS. */
export function tremorAmp(tps: number): number {
  return clamp((tps - 180) / 4600, 0.05, 1);
}

/** Larger quakes from priority-fee congestion. */
export function quakeAmp(feeP90: number, feePressure: number): number {
  return clamp(0.72 * logNorm(feeP90, 2_000_000) + 0.28 * clamp(feePressure, 0, 1), 0, 1);
}

/** Aftershock size from failed recent signatures. */
export function spikeMag(failCount: number): number {
  if (failCount <= 0) return 0;
  return clamp(0.28 + failCount * 0.14, 0, 1);
}

/** Paper feed from slot pace. ~2.5 slots/sec is a calm mainnet walk. */
export function paperFeed(slotsPerSec: number): number {
  return clamp(slotsPerSec / 3.15, 0.12, 1.45);
}

export function quakeLevel(quake: number, tremor: number, spike: number): QuakeLevel {
  const energy = 0.52 * quake + 0.28 * tremor + 0.2 * spike;
  if (energy >= 0.58 || spike >= 0.72) return "QUAKE";
  if (energy >= 0.24) return "RUMBLE";
  return "CLEAR";
}

export function feeNote(feeP90: number): string {
  if (feeP90 <= 0) return "FEE STILL";
  if (feeP90 >= 180_000) return "FEE HEAVY";
  if (feeP90 >= 18_000) return "FEE WARM";
  return "FEE CALM";
}

export function sampleToDrive(sample: ChainSample): NeedleDrive {
  const tremor = tremorAmp(sample.tps);
  const quake = quakeAmp(sample.feeP90, sample.feePressure);
  const spike = spikeMag(sample.failCount);
  const feed = paperFeed(sample.slotsPerSec);
  return {
    tremor,
    quake,
    feed,
    spike,
    level: quakeLevel(quake, tremor, spike),
    feeNote: feeNote(sample.feeP90),
  };
}

export function slotsPerSec(delta: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return clamp(delta / (elapsedMs / 1000), 0, 8);
}
