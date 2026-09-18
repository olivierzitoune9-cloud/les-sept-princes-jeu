import { useState, useEffect } from 'react'
import './App.css'
import Field from './components/Field'
import HUD from './components/HUD'
import ActionDock from './components/ActionDock'
import SideTacticalPanel from './components/SideTacticalPanel'
import ActionClimaxOverlay from './components/ActionClimaxOverlay'
import MatchReport from './components/MatchReport'
import useMatchEngine from './hooks/useMatchEngine'

function App() {
  const {
    matchState,
    engineState,
    isPaused,
    togglePause,
    selectedPlayer,
    selectPlayer,
    availableActions,
    executeAction,
    speed,
    setSpeed,
    controlMode,
    setControlMode,
    awaitingDecision,
    letAiDecide,
    pendingContest,
    resolveContest,
    letContestAiDecide,
    setSystem,
    takeTimeout,
    isMatchOver,
    restartMatch,
    seed,
    feedback,
    trajectories,
    hoveredActionId,
    setHoveredActionId,
    climax,
    activeDuel
  } = useMatchEngine()

  const [showReport, setShowReport] = useState(false)

  const handleShowReport = () => {
    setShowReport(true)
  }

  const handleRestartMatch = () => {
    setShowReport(false)
    restartMatch()
  }

  // Afficher automatiquement le rapport à la fin du match
  useEffect(() => {
    if (isMatchOver && !showReport) {
      const timer = setTimeout(() => setShowReport(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [isMatchOver, showReport])

  // Joueur actif : porteur de balle
  const activePlayer = selectedPlayer ?? matchState?.players.find((p) => p.hasBall) ?? null

  return (
    <div className="app-layout">
      {/* 1. Rangée Haut : HUD */}
      <header className="app-header">
        <HUD
          matchState={matchState}
          speed={speed}
          onSpeedChange={setSpeed}
          isPaused={isPaused}
          onTogglePause={togglePause}
          controlMode={controlMode}
          onControlModeChange={setControlMode}
          awaitingDecision={awaitingDecision}
          onLetAiDecide={letAiDecide}
          onSetSystem={setSystem}
          onTakeTimeout={takeTimeout}
          seed={seed}
        />
        {feedback && (
          <div className={`feedback-toast ${feedback.success ? 'success' : 'failure'}`}>
            <span className="feedback-type">{feedback.type}</span>
            <span className="feedback-title">{feedback.title}</span>
            {feedback.detail && <span className="feedback-detail">— {feedback.detail}</span>}
          </div>
        )}
      </header>

      {/* 2. Rangée Centrale : Terrain + Panneau Tactique (Jamais masqué) */}
      <main className="app-center-arena">
        <div className="field-viewport">
          <Field
            matchState={matchState}
            selectedPlayer={activePlayer?.id || null}
            trajectories={trajectories}
            hoveredActionId={hoveredActionId}
            onPlayerSelect={selectPlayer}
            onTrajectorySelect={executeAction}
          />
          <ActionClimaxOverlay climax={climax} />
        </div>

        <SideTacticalPanel
          duel={activeDuel}
          systemLagny={matchState?.systems.lagny ?? '6-0'}
          onExecuteDuel={executeAction}
        />
      </main>

      {/* 3. Rangée Basse : Dock Tactique Horizontal (Hauteur fixe 148px) */}
      {pendingContest ? (
        <footer className="action-dock-idle contest-bar">
          <div className="idle-msg">
            {pendingContest.defenderName} répond à {pendingContest.action.name} — choisis la défense
          </div>
          <div className="contest-options">
            {pendingContest.options.map((option) => (
              <button key={option.key} className="idle-ai-btn contest-btn" onClick={() => resolveContest(option.key)}>
                {option.label} <span className="contest-detail">· {option.detail}</span>
              </button>
            ))}
            <button className="idle-ai-btn" onClick={letContestAiDecide}>
              ⚡ IA défend
            </button>
          </div>
        </footer>
      ) : activePlayer && availableActions.length > 0 ? (
        <ActionDock
          player={activePlayer}
          actions={availableActions}
          onAction={executeAction}
          onHoverAction={setHoveredActionId}
          onLetAiDecide={letAiDecide}
        />
      ) : (
        <footer className="action-dock-idle">
          <div className="idle-msg">
            {matchState?.possession === 'lagny'
              ? 'Lagny attaque · clique un défenseur pour marquer ou aider'
              : 'En attente de la prochaine situation...'}
          </div>
          <button className="idle-ai-btn" onClick={letAiDecide}>
            ⚡ Accélérer avec l'IA
          </button>
        </footer>
      )}

      {/* Rapport de fin de match */}
      {isMatchOver && showReport && engineState && (
        <MatchReport
          score={{
            nangis: engineState.teams.nangis.score,
            lagny: engineState.teams.lagny.score
          }}
          events={engineState.events}
          onClose={() => setShowReport(false)}
          onRestart={handleRestartMatch}
        />
      )}

      {isMatchOver && !showReport && (
        <div className="match-over-banner">
          <span>Match terminé</span>
          <button onClick={handleShowReport}>Voir le rapport</button>
        </div>
      )}
    </div>
  )
}

export default App