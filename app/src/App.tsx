import { useState, useEffect } from 'react'
import './App.css'
import Field from './components/Field'
import HUD from './components/HUD'
import ActionPanel from './components/ActionPanel'
import MatchReport from './components/MatchReport'
import useMatchEngine from './hooks/useMatchEngine'

function App() {
  const {
    matchState,
    engineState,
    isPaused,
    selectedPlayer,
    availableActions,
    selectPlayer,
    executeAction,
    togglePause,
    setSpeed,
    speed,
    isMatchOver,
    restartMatch
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

  return (
    <div className="app">
      <HUD 
        matchState={matchState}
        speed={speed}
        onSpeedChange={setSpeed}
        isPaused={isPaused}
        onTogglePause={togglePause}
      />
      
      <div className="main-container">
        <Field
          matchState={matchState}
          selectedPlayer={selectedPlayer?.id || null}
          onPlayerSelect={selectPlayer}
        />
      </div>

      {selectedPlayer && availableActions.length > 0 && (
        <ActionPanel
          player={selectedPlayer}
          actions={availableActions}
          onAction={executeAction}
        />
      )}

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
