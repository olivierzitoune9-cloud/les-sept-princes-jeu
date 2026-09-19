import { useState } from 'react'
import Field from './Field'
import VolleyPlanner from './VolleyPlanner'
import { useVolleyMatch } from '../hooks/useVolleyEngine'
import { COLORS } from '../utils/fieldConstants'
import './AppVolley.css'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Blason abstrait (D-021) : geometrie pure, aucune representation d'etre anime.
function Crest({ team }: { team: 'nangis' | 'lagny' }) {
  const color = team === 'nangis' ? COLORS.nangis : COLORS.lagny
  const light = team === 'nangis' ? COLORS.nangisLight : COLORS.lagnyLight
  return (
    <svg className="v2-crest" viewBox="0 0 40 44" aria-hidden="true">
      <path
        d="M20 2 L36 8 V22 C36 32 29 39.5 20 42 C11 39.5 4 32 4 22 V8 Z"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
      />
      <path
        d="M20 8 L30 12 V21 C30 28 25.6 33.4 20 35.6 C14.4 33.4 10 28 10 21 V12 Z"
        fill={color}
        opacity="0.28"
      />
      <path d="M20 12 L26 20 L20 32 L14 20 Z" fill="none" stroke={light} strokeWidth="1.6" />
    </svg>
  )
}

const ROLE_LABELS: Record<string, string> = {
  goalkeeper: 'Gardien',
  wing: 'Ailier',
  back: 'Arriere',
  center: 'Demi-centre',
  pivot: 'Pivot'
}

function AppVolley() {
  const volley = useVolleyMatch(44, 10)
  const score = volley.match?.score ?? { nangis: 0, lagny: 0 }
  const possNangis = volley.match ? volley.match.possession === 'nangis' : true
  const sel = volley.selectedInfo
  const topThreat = volley.threats[0] ?? null
  // Ecran titre (D-022) : on entre dans le match par un vrai porche, sobre.
  const [entered, setEntered] = useState(false)
  // Ralenti cinema : la derniere volee decisive (tir, but, arret, duel)
  // ralentit la glisse visuelle le temps de la lire. Jamais la simulation.
  const [slowUntil, setSlowUntil] = useState(0)
  const [seenVolley, setSeenVolley] = useState(0)
  const DECISIVE = new Set(['shot', 'goal', 'save', 'duel', 'interception'])
  if (volley.volleyCount !== seenVolley) {
    setSeenVolley(volley.volleyCount)
    if (volley.lastVolley && DECISIVE.has(volley.lastVolley.endReason)) {
      setSlowUntil(Date.now() + 2400)
    }
  }
  const slowMotion = Date.now() < slowUntil

  if (!entered) {
    return (
      <div className="v2-app v2-title">
        <div className="v2-title-inner">
          <div className="v2-title-crests">
            <Crest team="nangis" />
            <span className="v2-title-vs">—</span>
            <Crest team="lagny" />
          </div>
          <h1>LES SEPT PRINCES</h1>
          <p className="v2-title-sub">Nangis contre Lagny · le match du roman</p>
          <p className="v2-title-desc">
            Tu es le coach de Nangis. Planifie chaque volee a temps fige,
            la defense repond en aveugle, le journal explique chaque cause.
            Un jeu de lecture, pas de reflexes.
          </p>
          <button className="v2-resolve v2-enter" onClick={() => setEntered(true)}>
            Entrer sur le terrain
          </button>
          <span className="v2-title-tag">Plus qu'un jeu — une lecture du jeu</span>
        </div>
      </div>
    )
  }

  return (
    <div className="v2-app">
      <header className="v2-hud">
        <div className="v2-team v2-team-left">
          <Crest team="nangis" />
          <div className="v2-team-text">
            <span className="v2-team-name">NANGIS</span>
            <span className={`v2-possession ${possNangis ? 'on' : ''}`}>
              <i />{possNangis ? 'Possession' : 'En defense'}
            </span>
          </div>
        </div>
        <div className="v2-scorebox">
          <div className="v2-score-line">
            <span className="v2-score-num">{score.nangis}</span>
            <span className="v2-score-sep">—</span>
            <span className="v2-score-num">{score.lagny}</span>
          </div>
          <div className="v2-chrono">{formatTime(volley.match?.time ?? 0)}</div>
          <div className="v2-hud-meta">Volee {volley.volleyCount} · seed #44 · 2 × 10 min</div>
        </div>
        <div className="v2-team v2-team-right">
          <div className="v2-team-text">
            <span className="v2-team-name">LAGNY</span>
            <span className={`v2-possession lagny ${!possNangis ? 'on' : ''}`}>
              <i />{!possNangis ? 'Possession' : 'En defense'}
            </span>
          </div>
          <Crest team="lagny" />
        </div>
        <button className="v2-restart" onClick={volley.restart} title="Rejouer la meme seed">
          Recommencer
        </button>
      </header>

      <main className="v2-main">
        <section className="v2-field">
          <Field
            matchState={volley.match}
            selectedPlayer={volley.selectedId}
            trajectories={volley.trajectories}
            openIntervals={volley.gapMarkers}
            attackingTeam={volley.attackingTeam}
            slowMotion={slowMotion}
            onPlayerSelect={volley.clickPlayer}
            onCourtClick={volley.attackingTeam === 'nangis' ? volley.clickCourt : undefined}
          />
        </section>

        <aside className="v2-rail">
          <section className="v2-card">
            <h3>Possession</h3>
            {sel ? (
              <>
                <div className="v2-possession-head">
                  <span className={`v2-mini-token ${sel.team}`}>{sel.number}</span>
                  <div>
                    <strong>{sel.name.toUpperCase()}</strong>
                    <span className="v2-sub">
                      #{sel.number} · {ROLE_LABELS[sel.role] ?? sel.role}
                      {sel.hasBall ? ' · porteur' : ''}
                    </span>
                  </div>
                </div>
                <div className="v2-gauge">
                  <div className="v2-gauge-label">
                    <span>Energie</span>
                    <span>{sel.energy}%</span>
                  </div>
                  <div className="v2-gauge-track">
                    <div className="v2-gauge-fill energy" style={{ width: `${sel.energy}%` }} />
                  </div>
                </div>
                <div className="v2-gauge">
                  <div className="v2-gauge-label">
                    <span>Pression subie</span>
                    <span>{sel.pressure}%</span>
                  </div>
                  <div className="v2-gauge-track">
                    <div className="v2-gauge-fill pressure" style={{ width: `${sel.pressure}%` }} />
                  </div>
                </div>
              </>
            ) : (
              <p className="v2-empty">Selectionne un joueur sur le terrain.</p>
            )}
          </section>

          <section className="v2-card">
            <h3>Menaces sur le porteur</h3>
            {volley.threats.length === 0 && <p className="v2-empty">Aucun defenseur a portee.</p>}
            {volley.threats.map((t) => (
              <div key={t.id} className="v2-threat">
                <span className="v2-mini-token lagny">{t.number}</span>
                <div className="v2-threat-text">
                  <strong>{t.name}</strong>
                  <span className="v2-sub">a {t.distanceMeters.toFixed(1)} m · Def {t.defense}</span>
                </div>
              </div>
            ))}
            {topThreat && (
              <p className="v2-note">
                Vis-a-vis immediat : {topThreat.name} (duel {topThreat.duel}, antic. {topThreat.anticipation}).
              </p>
            )}
          </section>

          <section className="v2-card">
            <h3>Breches ({volley.gaps.length})</h3>
            {volley.gaps.length === 0 && <p className="v2-empty">Bloc compact : aucune fissure mesurable.</p>}
            {volley.gaps.slice(0, 4).map((gap) => (
              <div key={gap.id} className={`v2-gap ${gap.exploitable ? 'open' : ''}`}>
                <span className="v2-gap-id">{gap.id}</span>
                <span>
                  {gap.width.toFixed(1)} m · fenetre {gap.window.toFixed(2)} s
                </span>
                <em>{gap.exploitable ? 'exploitable' : 'contestable'}</em>
              </div>
            ))}
          </section>

          <section className="v2-card v2-journal">
            <h3>Journal causal</h3>
            {!volley.lastVolley && <p className="v2-empty">Verrouille un plan : le journal racontera la volee.</p>}
            {volley.lastVolley && (
              <>
                <p className="v2-note">
                  {volley.lastVolley.durationSeconds.toFixed(1)} s · fin {volley.lastVolley.endReason}
                  {volley.lastVolley.endedEarly ? ' (arret anticipe)' : ''}
                </p>
                <ul>
                  {volley.lastVolley.causalLines.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <details className="v2-card v2-help">
            <summary>Comment jouer</summary>
            <ol>
              <li>Clique une intention du dock : Attaquer, Passer, Tirer, Fixer, Placer, Couper, Etirer.</li>
              <li>Passe et Fixer attendent un clic sur un joueur ; les courses attendent un clic sur le terrain.</li>
              <li>Clique un partenaire pour lui donner la prochaine fleche.</li>
              <li>Valider : la defense joue en aveugle 3 a 5 s, puis le journal explique.</li>
            </ol>
          </details>

          {volley.isOver && (
            <section className="v2-card v2-over">
              <h3>Match termine</h3>
              <p className="v2-final">
                {score.nangis} — {score.lagny}
              </p>
              {volley.timeline.length > 0 && (
                <ul className="v2-timeline">
                  {volley.timeline.slice(-14).map((event, index) => (
                    <li key={index}>
                      <span className="v2-timeline-time">{formatTime(event.timeSeconds)}</span>
                      <span className={`v2-timeline-type ${event.type}`}>{event.type}</span>
                      <span className="v2-timeline-result">{event.result}</span>
                    </li>
                  ))}
                </ul>
              )}
              <button className="v2-resolve" onClick={volley.restart}>Rejouer la meme seed</button>
            </section>
          )}
        </aside>
      </main>

      <footer className="v2-dock">
        {volley.attackingTeam === 'nangis' && !volley.isOver ? (
          <VolleyPlanner
            players={volley.match?.players ?? []}
            holderId={volley.holderId}
            draft={volley.draft}
            budget={volley.budget}
            validation={volley.validation}
            pendingKind={volley.pendingKind}
            onAddOrder={volley.addOrder}
            onRemoveOrder={volley.removeOrder}
            onCancelPending={() => volley.setPendingKind(null)}
            onLockAndResolve={volley.lockAndResolve}
            onAutoPlan={volley.autoPlan}
            onClear={volley.clearDraft}
            onSelectPlayer={volley.clickPlayer}
            selectedPlayerId={volley.selectedId}
          />
        ) : (
          !volley.isOver && (
            <div className="v2-defense-note">
              <strong>Lagny planifie en aveugle.</strong>
              <span>La doctrine adverse se verrouille sans voir ton plan. Simule la volee, puis lis le journal.</span>
              <button className="v2-resolve" onClick={volley.lockAndResolve}>Simuler la volee</button>
            </div>
          )
        )}
      </footer>

      <div className="v2-tagline">PLUS QU'UN JEU — UNE LECTURE DU JEU</div>
    </div>
  )
}

export default AppVolley
