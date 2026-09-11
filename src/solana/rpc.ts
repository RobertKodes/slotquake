const BUILTIN_RPCS = [
  "https://solana-rpc.publicnode.com",
  "https://api.mainnet-beta.solana.com",
];

export const RPC_CANDIDATES = unique([
  import.meta.env.VITE_RPC_URL?.trim(),
  ...BUILTIN_RPCS,
]);

export const DEFAULT_RPC = RPC_CANDIDATES[0] ?? BUILTIN_RPCS[0];

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "rpc";
  }
}

export function formatErr(err: unknown): string {
  if (err instanceof Error) return err.message.slice(0, 180);
  return String(err).slice(0, 180);
}

export function isRateLimited(err: unknown): boolean {
  const text = formatErr(err).toLowerCase();
  return text.includes("429") || text.includes("too many") || text.includes("rate limit");
}

export function isForbidden(err: unknown): boolean {
  const text = formatErr(err).toLowerCase();
  return text.includes("403") || text.includes("access forbidden") || text.includes("forbidden");
}

export function humanRpcError(err: unknown): string {
  if (isRateLimited(err)) {
    return "The drum is jammed. Holding for a quiet window.";
  }
  if (isForbidden(err)) {
    return "This station is barred. The RPC will not serve this origin.";
  }
  const text = formatErr(err).toLowerCase();
  if (text.includes("failed to fetch") || text.includes("network") || text.includes("cors")) {
    return "The line to the station is dead. Trying the next wire.";
  }
  return "The station missed a beat. Holding, then asking again.";
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))];
}
