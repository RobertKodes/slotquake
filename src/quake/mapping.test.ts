import { describe, expect, it } from "vitest";
import type { ChainSample } from "../types";
import {
  clamp,
  feeNote,
  logNorm,
  paperFeed,
  percentile,
  quakeAmp,
  quakeLevel,
  sampleToDrive,
  slotsPerSec,
  spikeMag,
  tremorAmp,
} from "./mapping";

const base: ChainSample = {
  t: 1_000,
  slot: 100,
  slotDelta: 4,
  slotsPerSec: 2.2,
  lagMs: 1400,
  tps: 2100,
  txPerSlot: 540,
  feeP90: 80_000,
  feePressure: 0.3,
  failCount: 0,
};

describe("mapping", () => {
  it("clamps and logs into 0..1", () => {
    expect(clamp(12, 0, 3)).toBe(3);
    expect(logNorm(0, 100)).toBe(0);
    expect(logNorm(100, 100)).toBe(1);
    expect(logNorm(-4, 100)).toBe(0);
  });

  it("takes a percentile without exploding on shorts", () => {
    expect(percentile([], 0.9)).toBe(0);
    expect(percentile([4], 0.9)).toBe(4);
    expect(percentile([1, 2, 3, 4], 1)).toBe(4);
  });

  it("raises tremor when TPS climbs", () => {
    expect(tremorAmp(4500)).toBeGreaterThan(tremorAmp(400));
  });

  it("maps hotter fees into a larger quake", () => {
    expect(quakeAmp(1_800_000, 0.8)).toBeGreaterThan(quakeAmp(0, 0));
  });

  it("turns failed signatures into aftershocks", () => {
    expect(spikeMag(0)).toBe(0);
    expect(spikeMag(3)).toBeGreaterThan(spikeMag(1));
    expect(spikeMag(40)).toBe(1);
  });

  it("feeds paper from slot pace", () => {
    expect(paperFeed(2.5)).toBeGreaterThan(paperFeed(0.4));
    expect(slotsPerSec(5, 2000)).toBeCloseTo(2.5);
    expect(slotsPerSec(3, 0)).toBe(0);
  });

  it("classifies CLEAR / RUMBLE / QUAKE", () => {
    expect(quakeLevel(0.05, 0.1, 0)).toBe("CLEAR");
    expect(quakeLevel(0.4, 0.3, 0.1)).toBe("RUMBLE");
    expect(quakeLevel(0.8, 0.6, 0.2)).toBe("QUAKE");
    expect(quakeLevel(0.1, 0.1, 0.9)).toBe("QUAKE");
  });

  it("writes a fee note and a full drive", () => {
    expect(feeNote(0)).toBe("FEE STILL");
    expect(feeNote(400)).toBe("FEE CALM");
    expect(feeNote(40_000)).toBe("FEE WARM");
    expect(feeNote(400_000)).toBe("FEE HEAVY");
    const quiet = sampleToDrive({ ...base, tps: 200, feeP90: 0, feePressure: 0, failCount: 0 });
    const hot = sampleToDrive({ ...base, tps: 4200, feeP90: 1_500_000, feePressure: 0.7, failCount: 4 });
    expect(hot.tremor).toBeGreaterThan(quiet.tremor);
    expect(hot.quake).toBeGreaterThan(quiet.quake);
    expect(hot.spike).toBeGreaterThan(quiet.spike);
    expect(hot.level).not.toBe("CLEAR");
  });
});
