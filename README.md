# SLOTQUAKE

Live Solana mainnet as a **paper-drum seismograph**.

Click **Arm** first. Unarmed, the paper stays still and the chassis sits dark. After that it polls public RPC and scratches the needle: TPS as background tremor, priority fees as quakes, failed signatures as aftershocks, slot ticks as the paper feed.

Not an explorer. Not a newspaper. Not a dashboard. Not another VFD rack.

**Live:** https://robertkodes.github.io/slotquake/

## Design tokens

Late-night geology lab. Ink on continuous paper. Brass and steel, not neon.

| Token | Hex | Role |
| --- | --- | --- |
| void | `#0c0b09` | lab after hours |
| chassis | `#1a1713` | steel plate |
| paper | `#eadcc3` | drum roll |
| ink | `#1c1610` | carbon trace |
| rust | `#a33c28` | needle / aftershock |
| brass | `#c9a45c` | screws, latch, lamps |

**Type**

- Display — **Big Shoulders Display** (nameplate, ARM, level stamps)
- Body — **Source Serif 4** (bench notes)
- Mono — **Azeret Mono** (slot, legend, errors)

No Inter. No Roboto. No purple gradient.

## What the needle is doing

- **Tremor** — non-vote TPS from `getRecentPerformanceSamples`
- **Quake** — recent prioritization fees (p90 + how many were non-zero)
- **Aftershock** — new signatures with `err` on a couple of busy programs
- **Feed** — `getSlot` pace. Slots keep the paper walking.

Legend strip is slot / CLEAR–RUMBLE–QUAKE / fee note. Not a chart panel.

`prefers-reduced-motion`: the drum settles. No frantic scribble.

## Run

```bash
npm i
npm run dev
```

Open the `/slotquake/` path Vite prints (`base` is set for GitHub Pages).

```bash
npm run build
npm run preview
npm test
```

## RPC

Default is `https://solana-rpc.publicnode.com`. Official `api.mainnet-beta.solana.com` often 403s browser Origins (this Pages site, localhost), so the station starts on PublicNode and hops if an endpoint blocks us. It also backs off on 429s.

Human copy on 403 / 429 — no JSON dumps.

If the wire stays dead, the drum falls back to a labeled paper demo and keeps retrying live.

If you have a Helius / Triton / etc URL:

```bash
cp .env.example .env
# edit VITE_RPC_URL
```

No wallets. No seeds. No trading.

## Pages

`vite.config.ts` has `base: '/slotquake/'`. The `gh-pages` branch is the built `dist/` (includes `.nojekyll`). Repo Settings → Pages → Deploy from branch → `gh-pages` / root.

## Smoke

1. Load the site. Paper is dim. Needle parked. Click **Arm**.
2. Paper should scroll. Ink should wander with live mainnet. Slot in the legend should tick.
3. Wait a few polls. If fees heat up, level moves CLEAR → RUMBLE → QUAKE. Failed txs flash rust spikes.
4. If an RPC 403/429s, the bench note speaks English and hops / waits.
5. Turn on reduced motion: scribble dies down, paper still feeds slowly.
