export type PollHealth = "idle" | "listening" | "ok" | "waiting" | "error" | "demo";

export type QuakeLevel = "CLEAR" | "RUMBLE" | "QUAKE";

export type ChainSample = {
  t: number;
  slot: number;
  slotDelta: number;
  slotsPerSec: number;
  lagMs: number;
  tps: number;
  txPerSlot: number;
  feeP90: number;
  feePressure: number;
  failCount: number;
};

export type NeedleDrive = {
  tremor: number;
  quake: number;
  feed: number;
  spike: number;
  level: QuakeLevel;
  feeNote: string;
};

export type LegendState = {
  slot: number;
  level: QuakeLevel;
  feeNote: string;
  tps: number;
  host: string;
  demo: boolean;
};
