import type { ChainSample } from "../types";

/** Synthetic station if every RPC wire goes dead. Prefer live. */
export function demoSample(now: number, prev: ChainSample | null): ChainSample {
  const t = now;
  const wave = 0.5 + 0.5 * Math.sin(t / 7400);
  const pulse = 0.5 + 0.5 * Math.sin(t / 2100);
  const burst = Math.sin(t / 18000) > 0.88;
  const fail = Math.sin(t / 5300) > 0.93 ? 2 : 0;
  const slotDelta = 2 + (pulse > 0.7 ? 2 : 1);
  const slot = (prev?.slot ?? 312_000_000) + slotDelta;
  return {
    t,
    slot,
    slotDelta,
    slotsPerSec: 2.1 + pulse * 0.7,
    lagMs: 900,
    tps: 1600 + wave * 1400,
    txPerSlot: 380 + wave * 220,
    feeP90: burst ? 420_000 : 2_400 + wave * 12_000,
    feePressure: burst ? 0.62 : 0.08 + wave * 0.18,
    failCount: fail,
  };
}

export function demoNote(): string {
  return "Station went dark. Paper demo until the wire comes back.";
}
