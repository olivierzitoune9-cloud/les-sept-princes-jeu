import type { DefensiveSystem } from '@engine/types.js'
import './HUD.css'

const SYSTEM_OPTIONS: Array<{ system: DefensiveSystem; label: string }> = [
  { system: '6-0', label: '6-0' },
  { system: '1-5', label: '1-5' },
  { system: '1-2-3', label: '1-2-3' },
  { system: 'hybrid-1-2-3', label: 'Hybride' }
]

interface HUDProps {
  matchState: {
    score: { nangis: number; lagny: number }
    time: number
    period: 1 | 2
    possession: 'nangis' | 'lagny'
    systems: { nangis: DefensiveSystem; lagny: DefensiveSystem }
    timeouts: number
  } | null
  speed: number
  onSpeedChange: (speed: number) => void
  isPaused: boolean
  onTogglePause: () => void
  controlMode: 'coach' | 'auto'
  onControlModeChange: (mode: 'coach' | 'auto') => void
  awaitingDecision: boolean
  onLetAiDecide: () => void
  onSetSystem: (system: DefensiveSystem) => void
  onTakeTimeout: () => void
  seed: number
}

const HUD: React.FC<HUDProps> = ({
  matchState,
  speed,
  onSpeedChange,
  isPaused,
  onTogglePause,
  controlMode,
  onControlModeChange,
  awaitingDecision,
  onLetAiDecide,
  onSetSystem,
  onTakeTimeout,
  seed
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const nangisScore = matchState?.score.nangis ?? 0
  const lagnyScore = matchState?.score.lagny ?? 0
  const time = matchState?.time ?? 0
  const period = matchState?.period ?? 1
  const possession = matchState?.possession ?? 'nangis'
  const nangisSystem = matchState?.systems.nangis ?? '6-0'
  const timeoutsLeft = matchState?.timeouts ?? 0

  return (
    <div className="hud">
      <div className="hud-scores">
        <div className={`team-score ${possession === 'nangis' ? 'with-ball' : ''}`}>
          <span className="team-name nangis">NANGIS</span>
          <span className="score">{nangisScore}</span>
        </div>

        <div className="hud-center">
          <div className="chrono">
            {formatTime(time)}
            <span className="period">{period === 1 ? '1re MT' : '2e MT'}</span>
          </div>
          <div className="possession-indicator">
            <span className={`possession-dot ${possession}`} />
            <span>{possession === 'nangis' ? 'Nangis' : 'Lagny'} a la balle</span>
          </div>
        </div>

        <div className={`team-score ${possession === 'lagny' ? 'with-ball' : ''}`}>
          <span className="score">{lagnyScore}</span>
          <span className="team-name lagny">LAGNY</span>
        </div>
      </div>

      <div className="hud-controls">
        <button
          className="control-button"
          onClick={onTogglePause}
          disabled={awaitingDecision}
        >
          {isPaused ? '▶ Reprendre' : '⏸ Pause'}
        </button>

        <div className="speed-controls">
          {[1, 2, 4, 8].map((value) => (
            <button
              key={value}
              className={`speed-button ${speed === value ? 'active' : ''}`}
              onClick={() => onSpeedChange(value)}
            >
              {value}×
            </button>
          ))}
        </div>

        <div className="mode-controls">
          <button
            className={`mode-button ${controlMode === 'coach' ? 'active' : ''}`}
            onClick={() => onControlModeChange('coach')}
          >
            Coach
          </button>
          <button
            className={`mode-button ${controlMode === 'auto' ? 'active' : ''}`}
            onClick={() => onControlModeChange('auto')}
          >
            Auto
          </button>
        </div>

        {awaitingDecision && controlMode === 'coach' && (
          <button className="control-button ai" onClick={onLetAiDecide}>
            Laisser l'IA jouer
          </button>
        )}
      </div>

      <div className="hud-tactics">
        <span className="tactics-label">Défense Nangis</span>
        {SYSTEM_OPTIONS.map(({ system, label }) => (
          <button
            key={system}
            className={`system-button ${nangisSystem === system ? 'active' : ''}`}
            onClick={() => onSetSystem(system)}
          >
            {label}
          </button>
        ))}
        <button
          className="timeout-button"
          onClick={onTakeTimeout}
          disabled={timeoutsLeft <= 0}
        >
          Temps mort ({timeoutsLeft})
        </button>
        <span className="seed-chip">seed #{seed}</span>
      </div>
    </div>
  )
}

export default HUD