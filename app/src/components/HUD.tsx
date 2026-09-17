import './HUD.css'

interface HUDProps {
  matchState: {
    score: { nangis: number; lagny: number }
    time: number // en secondes
    possession: 'nangis' | 'lagny'
  } | null
  speed: number
  onSpeedChange: (speed: number) => void
  isPaused: boolean
  onTogglePause: () => void
}

const HUD: React.FC<HUDProps> = ({
  matchState,
  speed,
  onSpeedChange,
  isPaused,
  onTogglePause
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const nangisScore = matchState?.score.nangis || 0
  const lagnyScore = matchState?.score.lagny || 0
  const time = matchState?.time || 0
  const possession = matchState?.possession || 'nangis'

  return (
    <div className="hud">
      <div className="hud-left">
        <div className="team-score">
          <span className="team-name nangis">NANGIS</span>
          <span className="score">{nangisScore}</span>
        </div>
      </div>

      <div className="hud-center">
        <div className="chrono">{formatTime(time)}</div>
        
        <div className="possession-indicator">
          <span className="possession-dot" />
          <span>Possession: {possession === 'nangis' ? 'Nangis' : 'Lagny'}</span>
        </div>
      </div>

      <div className="hud-right">
        <div className="team-score">
          <span className="score">{lagnyScore}</span>
          <span className="team-name lagny">LAGNY</span>
        </div>
      </div>

      <div className="controls">
        <button 
          className={`control-button ${isPaused ? 'active' : ''}`}
          onClick={onTogglePause}
        >
          {isPaused ? '▶ Reprendre' : '⏸ Pause'}
        </button>

        <div className="speed-controls">
          <button
            className={`speed-button ${speed === 0.5 ? 'active' : ''}`}
            onClick={() => onSpeedChange(0.5)}
          >
            0.5×
          </button>
          <button
            className={`speed-button ${speed === 1 ? 'active' : ''}`}
            onClick={() => onSpeedChange(1)}
          >
            1×
          </button>
          <button
            className={`speed-button ${speed === 2 ? 'active' : ''}`}
            onClick={() => onSpeedChange(2)}
          >
            2×
          </button>
        </div>
      </div>
    </div>
  )
}

export default HUD
