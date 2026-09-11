import { PaperDrum } from "./components/PaperDrum";
import { useQuake } from "./hooks/useQuake";
import "./App.css";

export default function App() {
  const q = useQuake();
  const slot = q.legend.slot ? String(q.legend.slot) : "—";
  const tps = Number.isFinite(q.legend.tps) && q.legend.tps > 0
    ? `${Math.round(q.legend.tps)} tps`
    : "tps —";

  return (
    <div className={`lab ${q.armed ? "is-armed" : "is-idle"} ${q.reduced ? "is-reduced" : ""}`}>
      <div className="bench">
        <aside className="plate">
          <p className="kicker">RobertKodes Lab · MK.I drum</p>
          <h1>
            SLOT
            <span>QUAKE</span>
          </h1>
          <p className="lede">
            Live Solana mainnet scratched onto continuous paper. Fees rumble. Failed
            signatures aftershock. Slots feed the drum.
          </p>

          <button
            type="button"
            className={`lever ${q.armed ? "on" : ""}`}
            onClick={q.toggleArm}
            aria-pressed={q.armed}
          >
            <span className="lever-well" aria-hidden>
              <span className="lever-knob" />
            </span>
            <span className="lever-copy">
              <strong>{q.armed ? "ARMED" : "ARM"}</strong>
              <em>{q.armed ? "latch in — paper feeding" : "click before anything moves"}</em>
            </span>
          </button>

          <dl className="lamps">
            <div>
              <dt>station</dt>
              <dd className={`jewel ${q.health}`}>{q.health}</dd>
            </div>
            <div>
              <dt>level</dt>
              <dd className={`level ${q.legend.level.toLowerCase()}`}>
                {q.armed ? q.legend.level : "DARK"}
              </dd>
            </div>
          </dl>
          <p className="bench-note">{q.note}</p>
        </aside>

        <section className="chassis" aria-label="seismograph drum">
          <header className="rail">
            <span className="screw" />
            <span className="rail-mark">helicorder · ink on paper</span>
            <span className="rail-mark ghost">{q.legend.host}</span>
            <span className="screw" />
          </header>
          <PaperDrum bridge={q.bridge} armed={q.armed} />
          <footer className="legend" aria-label="quake legend">
            <span>SLOT {slot}</span>
            <span className="dot" />
            <span className={`lvl ${q.legend.level.toLowerCase()}`}>
              {q.armed ? q.legend.level : "IDLE"}
            </span>
            <span className="dot" />
            <span>{q.legend.feeNote}</span>
            <span className="dot" />
            <span>{tps}</span>
            {q.demo && (
              <>
                <span className="dot" />
                <span className="demo-tag">DEMO PAPER</span>
              </>
            )}
          </footer>
        </section>
      </div>
    </div>
  );
}
