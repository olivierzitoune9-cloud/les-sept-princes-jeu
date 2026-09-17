import './MatchReport.css'

interface MatchEvent {
  id: number
  timeSeconds: number
  type: string
  actorId?: string
  targetId?: string
  result: string
  causes: string[]
}

interface MatchReportProps {
  score: { nangis: number; lagny: number }
  events: MatchEvent[]
  onClose: () => void
  onRestart: () => void
}

const MatchReport: React.FC<MatchReportProps> = ({ score, events, onClose, onRestart }) => {
  const winner = score.nangis > score.lagny ? 'Nangis' : 
                 score.lagny > score.nangis ? 'Lagny' : 'Égalité'

  const goals = events.filter(e => e.result === 'goal')
  const saves = events.filter(e => e.result === 'save')
  const turnovers = events.filter(e => e.result === 'intercepted')
  const fouls = events.filter(e => e.result === 'foul-defense')

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getEventType = (event: MatchEvent): string => {
    if (event.result === 'goal') return 'goal'
    if (event.result === 'save') return 'save'
    if (event.result === 'intercepted') return 'turnover'
    return 'action'
  }

  const getEventLabel = (event: MatchEvent): string => {
    if (event.result === 'goal') return 'But'
    if (event.result === 'save') return 'Arrêt'
    if (event.result === 'intercepted') return 'Interception'
    return event.type
  }

  // Événements importants (derniers 10 buts, arrêts et interceptions)
  const importantEvents = events
    .filter(e => ['goal', 'save', 'intercepted'].includes(e.result))
    .slice(-10)
    .reverse()

  return (
    <div className="match-report-overlay">
      <div className="match-report">
        <div className="report-header">
          <div className="report-title">Fin du Match</div>
          <div className="final-score">
            <div className="team-final">
              <div className="team-final-name nangis">Nangis</div>
              <div className="team-final-score">{score.nangis}</div>
            </div>
            <div className="score-separator">—</div>
            <div className="team-final">
              <div className="team-final-name lagny">Lagny</div>
              <div className="team-final-score">{score.lagny}</div>
            </div>
          </div>
          {winner !== 'Égalité' && (
            <div className="winner-label">Victoire de {winner}</div>
          )}
        </div>

        <div className="report-section">
          <div className="section-title">Statistiques</div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Buts marqués</span>
              <span className="stat-value">{goals.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Arrêts</span>
              <span className="stat-value">{saves.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Interceptions</span>
              <span className="stat-value">{turnovers.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Fautes</span>
              <span className="stat-value">{fouls.length}</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <div className="section-title">Moments clés</div>
          <div className="events-list">
            {importantEvents.map(event => (
              <div key={event.id} className="event-item">
                <span className="event-time">{formatTime(event.timeSeconds)}</span>
                <span className="event-description">
                  {event.causes.length > 0 ? event.causes[0] : event.type}
                </span>
                <span className={`event-type ${getEventType(event)}`}>
                  {getEventLabel(event)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-actions">
          <button className="report-button" onClick={onRestart}>
            Nouveau match
          </button>
          <button className="report-button secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default MatchReport
