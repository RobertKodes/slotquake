export class PaperRoll {
  readonly y: Float32Array;
  readonly spike: Uint8Array;
  readonly length: number;
  private head = 0;
  filled = 0;

  constructor(length = 1600) {
    this.length = Math.max(2, length);
    this.y = new Float32Array(this.length);
    this.spike = new Uint8Array(this.length);
  }

  push(value: number, isSpike = false): void {
    this.y[this.head] = value;
    this.spike[this.head] = isSpike ? 1 : 0;
    this.head = (this.head + 1) % this.length;
    if (this.filled < this.length) this.filled += 1;
  }

  /** Oldest → newest among filled samples. */
  chronological(index: number): { y: number; spike: boolean } {
    const count = this.filled;
    if (count === 0) return { y: 0, spike: false };
    const i = ((index % count) + count) % count;
    const start = this.filled === this.length ? this.head : 0;
    const at = (start + i) % this.length;
    return { y: this.y[at] ?? 0, spike: (this.spike[at] ?? 0) === 1 };
  }

  reset(): void {
    this.y.fill(0);
    this.spike.fill(0);
    this.head = 0;
    this.filled = 0;
  }
}

export function feedPixels(feed: number, reduced: boolean): number {
  if (reduced) return 9 + feed * 8;
  return 32 + feed * 58;
}
