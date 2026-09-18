import Field from './Field'
import VolleyPlanner from './VolleyPlanner'
import { useVolleyMatch } from '../hooks/useVolleyEngine'
import './AppVolley.css'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function AppVolley() {
  const volley = useVolleyMatch(44, 10)

  return (
    <div className="app-volley">
      <header className="volley-hud">
        <div className="volley-score">
          <span className="team nangis">NANGIS {volley.match?.score.nangis ?? 0}</span>
          <span className="chrono">{formatTime(volley.match?.time ?? 0)} · volée {volley.volleyCount}</span>
          <span className="team lagny">{volley.match?.score.lagny ?? 0} LAGNY</span>
        </div>
        <div className="volley-sub">
          <span>{volley.attackingTeam === 'nangis' ? 'Nangis attaque — à toi de planifier' : 'Lagny attaque — l IA joue, tu lis'}</span>
          <span>seed #44 · 2 × 10 min · temps figé pendant le plan</span>
          <button onClick={volley.restart}>Recommencer</button>
        </div>
      </header>
      <main className="volley-main">
        <div className="volley-field">
          <Field
            matchState={volley.match}
            selectedPlayer={volley.selectedId}
            trajectories={volley.trajectories}
            openIntervals={volley.gapMarkers}
            onPlayerSelect={volley.setSelectedId}
            onCourtClick={volley.aimLastAtPoint}
          />
        </div>
        <div className="volley-side">
          {volley.attackingTeam === 'nangis' ? (
            <VolleyPlanner
              players={volley.match?.players ?? []}
              holderId={volley.holderId}
              draft={volley.draft}
              budget={volley.budget}
              validation={volley.validation}
              onAddOrder={volley.addOrder}
              onRemoveOrder={volley.removeOrder}
              onSetTarget={volley.setTargetForLast}
              onLockAndResolve={volley.lockAndResolve}
              onAutoPlan={volley.autoPlan}
              onClear={volley.clearDraft}
              onSelectPlayer={volley.setSelectedId}
              selectedPlayerId={volley.selectedId}
            />
          ) : (
            <section className="volley-planner">
              <h2>Lagny planifie en aveugle</h2>
              <p>La doctrine adverse se verrouille sans voir ton plan. Clique pour simuler la volée.</p>
              <div className="volley-actions">
                <button className="volley-resolve" onClick={volley.lockAndResolve}>Simuler la volée</button>
              </div>
            </section>
          )}
          <section className="volley-causal">
            <h3>Journal causal</h3>
            {!volley.lastVolley && <p>Planifie puis verrouille : le journal racontera la volée.</p>}
            {volley.lastVolley && (
              <>
                <p>
                  {volley.lastVolley.durationSeconds.toFixed(1)} s · fin {volley.lastVolley.endReason}
                  {volley.lastVolley.endedEarly ? ' (arrêt anticipé)' : ''} · défense {volley.lastVolley.defense.orders.length} ordres
                </p>
                <ul>
                  {volley.lastVolley.causalLines.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
          <section className="volley-causal">
            <h3>Brèches ({volley.gaps.length})</h3>
            <ul>
              {volley.gaps.slice(0, 5).map((gap) => (
                <li key={gap.id}>
                  {gap.id} : {gap.width.toFixed(1)} m · fenêtre {gap.window.toFixed(2)} s{ gap.exploitable ? ' · exploitable' : ''}
                </li>
              ))}
            </ul>
          </section>
          {volley.isOver && (
            <section className="volley-planner">
              <h2>Match terminé</h2>
              <p>
                {volley.match?.score.nangis} — {volley.match?.score.lagny}
              </p>
              <button onClick={volley.restart}>Rejouer la même seed</button>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default AppVolley
