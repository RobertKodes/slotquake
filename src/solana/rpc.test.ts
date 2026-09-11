import { describe, expect, it } from "vitest";
import { hostOf, humanRpcError, isForbidden, isRateLimited } from "./rpc";

describe("rpc copy", () => {
  it("speaks English on 403 / 429", () => {
    expect(isForbidden(new Error("403 forbidden"))).toBe(true);
    expect(isRateLimited(new Error("429 Too Many Requests"))).toBe(true);
    expect(humanRpcError(new Error("403"))).toMatch(/barred/i);
    expect(humanRpcError(new Error("429"))).toMatch(/jammed/i);
    expect(humanRpcError(new Error("Failed to fetch"))).toMatch(/dead/i);
    expect(hostOf("https://solana-rpc.publicnode.com")).toBe("solana-rpc.publicnode.com");
  });
});
