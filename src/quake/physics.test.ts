import { describe, expect, it } from "vitest";
import { createNeedle, kickNeedle, needleAngleDeg, stepNeedle } from "./physics";
import { PaperRoll, feedPixels } from "./paper";
import { demoSample } from "./demo";

describe("needle physics", () => {
  it("settles without scribble when reduced motion is on", () => {
    const n = createNeedle();
    n.y = 0.8;
    for (let i = 0; i < 80; i += 1) {
      stepNeedle(n, 1 / 60, 1, 0.4, 1, true);
    }
    expect(Math.abs(n.v)).toBeLessThan(0.001);
    expect(Math.abs(n.y)).toBeLessThan(0.55);
  });

  it("kicks then rings instead of sticking", () => {
    const n = createNeedle();
    kickNeedle(n, 1, 1);
    const first = n.y;
    const firstV = n.v;
    stepNeedle(n, 1 / 60, 0.2, 0.1, 0, false);
    expect(n.y).not.toBe(first);
    expect(firstV).toBeGreaterThan(2);
  });

  it("maps deflection into a shallow boom angle", () => {
    expect(needleAngleDeg(0)).toBe(0);
    expect(needleAngleDeg(1)).toBeCloseTo(16.5);
    expect(needleAngleDeg(-2)).toBeCloseTo(-19.8);
  });
});

describe("paper roll", () => {
  it("reads oldest to newest across a wrap", () => {
    const roll = new PaperRoll(4);
    roll.push(1);
    roll.push(2);
    roll.push(3);
    roll.push(4);
    roll.push(5);
    expect(roll.chronological(0).y).toBe(2);
    expect(roll.chronological(3).y).toBe(5);
    expect(roll.filled).toBe(4);
  });

  it("marks aftershock ink", () => {
    const roll = new PaperRoll(3);
    roll.push(0.1, false);
    roll.push(0.9, true);
    expect(roll.chronological(1).spike).toBe(true);
    expect(roll.chronological(0).spike).toBe(false);
  });

  it("slows the drum under reduced motion", () => {
    expect(feedPixels(1, true)).toBeLessThan(feedPixels(1, false));
  });
});

describe("demo station", () => {
  it("advances slots and can throw a burst", () => {
    const a = demoSample(0, null);
    const b = demoSample(50_000, a);
    expect(b.slot).toBeGreaterThan(a.slot);
    expect(b.tps).toBeGreaterThan(0);
  });
});
