import './ActionPanel.css'

interface Action {
  id: string
  name: string
  description: string
  risk?: 'safe' | 'moderate' | 'risky'
  enabled: boolean
}

interface Player {
  id: string
  name: string
  number: number
  team: 'nangis' | 'lagny'
  role?: string
  fatigue?: number
  pressure?: number
}

interface ActionPanelProps {
  player: Player
  actions: Action[]
  onAction: (actionId: string) => void
  onHoverAction?: (actionId: string | null) => void
  onLetAiDecide?: () => void
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  player,
  actions,
  onAction,
  onHoverAction,
  onLetAiDecide
}) => {
  const fatiguePercent = player.fatigue || 100
  const pressurePercent = player.pressure || 0

  return (
    <div className="action-panel">
      <div className="panel-header">
        <div className="player-info">
          <div className={`player-badge ${player.team}`}>
            {player.number}
          </div>
          <div className="player-details">
            <div className="player-name">
              {player.name}
              {player.role && ` · ${player.role}`}
            </div>
            <div className="player-status">
              <div className="status-item">
                <span>Énergie</span>
                <div className="status-bar">
                  <div 
                    className={`status-fill energy ${fatiguePercent < 50 ? 'low' : ''}`}
                    style={{ width: `${fatiguePercent}%` }}
                  />
                </div>
                <span>{fatiguePercent}%</span>
              </div>
              <div className="status-item">
                <span>Pression</span>
                <div className="status-bar">
                  <div 
                    className={`status-fill pressure ${pressurePercent > 70 ? 'high' : ''}`}
                    style={{ width: `${pressurePercent}%` }}
                  />
                </div>
                <span>{pressurePercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {onLetAiDecide && (
          <button
            className="ai-decide-btn"
            onClick={onLetAiDecide}
            title="Laisser l'IA trancher pour ce coup"
          >
            ⚡ Laisser l'IA décider
          </button>
        )}
      </div>

      <div className="actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className="action-button"
            onClick={() => onAction(action.id)}
            onMouseEnter={() => onHoverAction?.(action.id)}
            onMouseLeave={() => onHoverAction?.(null)}
            disabled={!action.enabled}
          >
            <div className="action-name">{action.name}</div>
            <div className="action-description">{action.description}</div>
            {action.risk && (
              <span className={`action-risk ${action.risk}`}>
                {action.risk === 'safe' ? 'Sûr' : action.risk === 'moderate' ? 'Modéré' : 'Risqué'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ActionPanel
