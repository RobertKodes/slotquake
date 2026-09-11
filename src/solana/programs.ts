import { PublicKey } from "@solana/web3.js";

export type KnownProgram = {
  id: string;
  name: string;
  key: PublicKey;
};

const RAW: Array<[string, string]> = [
  ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", "JUPITER"],
  ["675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", "RAYDIUM"],
  ["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", "TOKEN"],
  ["11111111111111111111111111111111", "SYSTEM"],
  ["whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", "ORCA"],
  ["PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY", "PHOENIX"],
  ["dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH", "DRIFT"],
  ["LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo", "METEORA"],
  ["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P", "PUMP"],
  ["ComputeBudget111111111111111111111111111111", "COMPUTE"],
  ["ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", "ATA"],
  ["TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", "TOK2022"],
  ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "USDC"],
];

const seen = new Set<string>();

export const KNOWN_PROGRAMS: KnownProgram[] = RAW.flatMap(([id, name]) => {
  if (seen.has(id)) return [];
  seen.add(id);
  try {
    return [{ id, name, key: new PublicKey(id) }];
  } catch {
    return [];
  }
});

export const FEE_WATCH = KNOWN_PROGRAMS.slice(0, 6).map((p) => p.key);
