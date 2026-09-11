import { useCallback, useEffect, useRef, useState } from "react";
import { demoNote, demoSample } from "../quake/demo";
import { sampleToDrive } from "../quake/mapping";
import { DEFAULT_RPC, RPC_CANDIDATES } from "../solana/poller";
import { QuakePoller } from "../solana/poller";
import type { ChainSample, LegendState, NeedleDrive, PollHealth } from "../types";
import { listenReducedMotion } from "./usePrefersReducedMotion";

const REST: NeedleDrive = {
  tremor: 0,
  quake: 0,
  feed: 0,
  spike: 0,
  level: "CLEAR",
  feeNote: "FEE STILL",
};

export type EngineBridge = {
  drive: NeedleDrive;
  armed: boolean;
  reduced: boolean;
  pendingKick: number;
  slot: number;
};

export function useQuake() {
  const [armed, setArmed] = useState(false);
  const [health, setHealth] = useState<PollHealth>("idle");
  const [note, setNote] = useState("Paper still. Arm the drum.");
  const [sample, setSample] = useState<ChainSample | null>(null);
  const [drive, setDrive] = useState<NeedleDrive>(REST);
  const [host, setHost] = useState(() => hostLabel(DEFAULT_RPC));
  const [reduced, setReduced] = useState(false);
  const [demo, setDemo] = useState(false);

  const bridge = useRef<EngineBridge>({
    drive: REST,
    armed: false,
    reduced: false,
    pendingKick: 0,
    slot: 0,
  });
  const failStreak = useRef(0);
  const lastSample = useRef<ChainSample | null>(null);
  const demoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const applySample = useCallback((next: ChainSample, fromDemo: boolean) => {
    lastSample.current = next;
    const mapped = sampleToDrive(next);
    setSample(next);
    setDrive(mapped);
    bridge.current.drive = mapped;
    bridge.current.slot = next.slot;
    if (mapped.spike > 0) {
      bridge.current.pendingKick += mapped.spike;
    }
    if (!fromDemo) {
      setDemo(false);
    }
  }, []);

  const stopDemo = useCallback(() => {
    if (demoTimer.current) {
      clearInterval(demoTimer.current);
      demoTimer.current = null;
    }
  }, []);

  const startDemo = useCallback(() => {
    if (demoTimer.current) return;
    setDemo(true);
    setHealth("demo");
    setNote(demoNote());
    demoTimer.current = setInterval(() => {
      const next = demoSample(Date.now(), lastSample.current);
      applySample(next, true);
    }, 1600);
  }, [applySample]);

  useEffect(() => listenReducedMotion((on) => {
    setReduced(on);
    bridge.current.reduced = on;
  }), []);

  useEffect(() => {
    bridge.current.armed = armed;
    if (!armed) {
      bridge.current.drive = REST;
      setDrive(REST);
      setHealth("idle");
      setNote("Paper still. Arm the drum.");
      setDemo(false);
      failStreak.current = 0;
      stopDemo();
      return;
    }

    const poller = new QuakePoller(RPC_CANDIDATES, {
      onSample: (next) => {
        failStreak.current = 0;
        stopDemo();
        setHost(poller.rpcHost());
        applySample(next, false);
      },
      onHealth: (h, msg) => {
        setHost(poller.rpcHost());
        if (h === "ok") {
          failStreak.current = 0;
          stopDemo();
          setDemo(false);
          setHealth("ok");
          setNote(msg);
          return;
        }
        if (h === "listening") {
          setHealth("listening");
          setNote(msg);
          return;
        }
        failStreak.current += 1;
        setHealth(h);
        setNote(msg);
        if (failStreak.current >= 3) startDemo();
      },
    });
    poller.start();
    return () => {
      poller.stop();
      stopDemo();
    };
  }, [armed, applySample, startDemo, stopDemo]);

  const toggleArm = useCallback(() => {
    setArmed((v) => !v);
  }, []);

  const legend: LegendState = {
    slot: sample?.slot ?? 0,
    level: drive.level,
    feeNote: drive.feeNote,
    tps: sample?.tps ?? 0,
    host,
    demo,
  };

  return {
    armed,
    toggleArm,
    health,
    note,
    sample,
    drive,
    legend,
    reduced,
    demo,
    bridge,
  };
}

function hostLabel(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "rpc";
  }
}
