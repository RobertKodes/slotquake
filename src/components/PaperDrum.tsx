import { useEffect, useRef, type MutableRefObject } from "react";
import { feedPixels, PaperRoll } from "../quake/paper";
import { createNeedle, kickNeedle, needleAngleDeg, stepNeedle } from "../quake/physics";
import type { EngineBridge } from "../hooks/useQuake";

const PAPER = "#eadcc3";
const PAPER_IDLE = "#3f382f";
const INK = "#1c1610";
const RUST = "#a33c28";
const GRID = "rgba(28, 22, 16, 0.14)";

type Props = {
  bridge: MutableRefObject<EngineBridge>;
  armed: boolean;
};

export function PaperDrum({ bridge, armed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const armRef = useRef<SVGGElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const roll = new PaperRoll(1800);
    const needle = createNeedle();
    let raf = 0;
    let last = performance.now();
    let carry = 0;
    let spikeHold = 0;
    const rng = mulberry(0x51e15);

    const grain = makeGrain();

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const b = bridge.current;
      const live = b.armed;
      const reduced = b.reduced;

      if (b.pendingKick > 0) {
        const mag = b.pendingKick;
        b.pendingKick = 0;
        kickNeedle(needle, mag, rng() > 0.5 ? 1 : -1);
        spikeHold = 1;
      }
      spikeHold *= Math.pow(0.12, dt);

      const y = live
        ? stepNeedle(needle, dt, b.drive.tremor, b.drive.quake, rng() * 2 - 1, reduced)
        : stepNeedle(needle, dt, 0, 0, 0, true);

      if (live) {
        const pxPerSec = feedPixels(b.drive.feed, reduced);
        carry += pxPerSec * dt;
        const isSpike = spikeHold > 0.18;
        while (carry >= 1) {
          carry -= 1;
          roll.push(y, isSpike);
        }
      }

      paint(ctx, canvas, roll, y, live, grain, b.slot);
      if (armRef.current) {
        const deg = live ? needleAngleDeg(y) : 0;
        armRef.current.setAttribute("transform", `rotate(${deg} 108 160)`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [bridge]);

  return (
    <div className={`drum ${armed ? "armed" : "idle"}`} ref={wrapRef}>
      <div className="roller left" aria-hidden />
      <div className="paper-well">
        <canvas ref={canvasRef} className="paper" />
        <svg className="needle" viewBox="0 0 120 320" aria-hidden>
          <g ref={armRef} transform="rotate(0 108 160)">
            <line x1="108" y1="160" x2="8" y2="160" stroke="#5c4a3a" strokeWidth="2.2" />
            <line x1="108" y1="160" x2="8" y2="160" stroke="#a33c28" strokeWidth="1.15" />
            <rect x="70" y="152" width="22" height="16" rx="1" fill="#c9a45c" />
            <circle cx="8" cy="160" r="4.2" fill="#1c1610" />
            <circle cx="8" cy="160" r="1.6" fill="#a33c28" />
            <circle cx="108" cy="160" r="9" fill="#c9a45c" />
            <circle cx="108" cy="160" r="4.2" fill="#1a1713" />
          </g>
        </svg>
        {!armed && (
          <div className="paper-veil">
            <p>arm the drum</p>
            <span>paper stays still until you latch it</span>
          </div>
        )}
      </div>
      <div className="roller right" aria-hidden />
      <div className="pen-post" aria-hidden>
        <span className="post-cap" />
        <span className="post-shaft" />
      </div>
    </div>
  );
}

function paint(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  roll: PaperRoll,
  y: number,
  armed: boolean,
  grain: HTMLCanvasElement,
  slot: number,
) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = armed ? PAPER : PAPER_IDLE;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = armed ? 0.11 : 0.05;
  for (let x = 0; x < w; x += grain.width) {
    for (let yy = 0; yy < h; yy += grain.height) {
      ctx.drawImage(grain, x, yy);
    }
  }
  ctx.globalAlpha = 1;

  const mid = h * 0.5;
  const amp = h * 0.36;
  const top = 16;
  const bot = h - 16;

  ctx.fillStyle = armed ? "#0c0b09" : "#1a1713";
  for (let x = 10; x < w; x += 13) {
    ctx.beginPath();
    ctx.arc(x, 9, 3.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, h - 9, 3.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, mid);
  ctx.lineTo(w, mid);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, mid - amp);
  ctx.lineTo(w, mid - amp);
  ctx.moveTo(0, mid + amp);
  ctx.lineTo(w, mid + amp);
  ctx.stroke();

  const needleX = w * 0.78;
  const n = roll.filled;
  if (n > 1) {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 1.45;
    let drawing = false;
    let rust = false;
    for (let i = 0; i < n; i += 1) {
      const s = roll.chronological(i);
      const x = needleX - (n - 1 - i);
      if (x < 4 || x > w - 4) continue;
      const py = mid - s.y * amp;
      if (s.spike !== rust || !drawing) {
        if (drawing) ctx.stroke();
        rust = s.spike;
        ctx.strokeStyle = rust ? RUST : INK;
        ctx.beginPath();
        ctx.moveTo(x, py);
        drawing = true;
      } else {
        ctx.lineTo(x, py);
      }
    }
    if (drawing) ctx.stroke();
  }

  const ny = mid - y * amp;
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(needleX, ny, 2.1, 0, Math.PI * 2);
  ctx.fill();

  if (armed && slot > 0) {
    ctx.fillStyle = "rgba(28,22,16,0.35)";
    ctx.font = "500 10px 'Azeret Mono', monospace";
    ctx.fillText(String(slot), 18, bot - 4);
    ctx.fillText("mm", 18, top + 12);
  }
}

function makeGrain(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d");
  if (!g) return c;
  const img = g.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 180 + Math.floor(Math.random() * 70);
    img.data[i] = n;
    img.data[i + 1] = n - 12;
    img.data[i + 2] = n - 28;
    img.data[i + 3] = 90;
  }
  g.putImageData(img, 0, 0);
  return c;
}

function mulberry(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
