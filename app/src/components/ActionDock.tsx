import React, { useState, useEffect, useMemo } from 'react'
import './ActionDock.css'

export type TacticalCategory = 'pass' | 'duel' | 'fix' | 'move' | 'shoot'

export interface ActionItem {
  id: string
  name: string
  description: string
  risk?: 'safe' | 'moderate' | 'risky'
  quality?: 'very-favorable' | 'favorable' | 'neutral' | 'risky' | 'very-risky'
  qualityLabel?: string
  estimatedSuccess?: number
  enabled: boolean
  intent: {
    type: string
    actorId?: string
    targetId?: string
    shotType?: string
  }
}

export interface PlayerInfo {
  id: string
  name: string
  number: number
  team: 'nangis' | 'lagny'
  role?: string
  fatigue?: number
  pressure?: number
}

interface ActionDockProps {
  player: PlayerInfo
  actions: ActionItem[]
  onAction: (actionId: string) => void
  onHoverAction?: (actionId: string | null) => void
  onLetAiDecide?: () => void
  onSelectCategory?: (category: TacticalCategory) => void
  isExpertMode?: boolean
}

const CATEGORY_TABS: Array<{ key: TacticalCategory; label: string; icon: string }> = [
  { key: 'pass', label: 'PASSER', icon: '↗' },
  { key: 'duel', label: 'ATTAQUER', icon: '⚔' },
  { key: 'fix', label: 'FIXER', icon: '⚓' },
  { key: 'move', label: 'DÉPLACER', icon: '↺' },
  { key: 'shoot', label: 'TIRER', icon: '🎯' }
]

const ActionDock: React.FC<ActionDockProps> = ({
  player,
  actions,
  onAction,
  onHoverAction,
  onLetAiDecide,
  onSelectCategory,
  isExpertMode = false
}) => {
  // Grouper les actions par catégorie
  const groupedActions = useMemo(() => {
    const groups: Record<TacticalCategory, ActionItem[]> = {
      pass: [],
      duel: [],
      fix: [],
      move: [],
      shoot: []
    }
    actions.forEach((act) => {
      const type = act.intent.type
      if (type === 'pass') groups.pass.push(act)
      else if (type === 'duel') groups.duel.push(act)
      else if (type === 'fix') groups.fix.push(act)
      else if (type === 'run' || type === 'cross') groups.move.push(act)
      else if (type === 'shoot') groups.shoot.push(act)
    })
    return groups
  }, [actions])

  // Catégorie active : par défaut la première non-vide (ou passe)
  const [activeCategory, setActiveCategory] = useState<TacticalCategory>('pass')

  useEffect(() => {
    if (groupedActions[activeCategory].length === 0) {
      const available = CATEGORY_TABS.find((tab) => groupedActions[tab.key].length > 0)
      if (available) {
        setActiveCategory(available.key)
        onSelectCategory?.(available.key)
      }
    }
  }, [groupedActions, activeCategory, onSelectCategory])

  const handleTabClick = (cat: TacticalCategory) => {
    setActiveCategory(cat)
    onSelectCategory?.(cat)
  }

  const energyVal = player.fatigue ?? 100
  const pressureVal = player.pressure ?? 0
  const activeList = groupedActions[activeCategory]

  return (
    <footer className="action-dock">
      {/* 1. Volet Gauche : Fiche du Porteur */}
      <div className="dock-carrier">
        <div className={`carrier-badge ${player.team}`}>
          {player.number}
        </div>
        <div className="carrier-info">
          <div className="carrier-name">
            {player.name}
            {player.role && <span className="carrier-role"> · {player.role}</span>}
          </div>
          <div className="carrier-stats">
            <div className="stat-line">
              <span className="stat-lbl">Énergie</span>
              <div className="stat-track">
                <div
                  className={`stat-bar energy ${energyVal < 40 ? 'danger' : ''}`}
                  style={{ width: `${energyVal}%` }}
                />
              </div>
              <span className="stat-val">{energyVal}%</span>
            </div>
            <div className="stat-line">
              <span className="stat-lbl">Pression</span>
              <div className="stat-track">
                <div
                  className={`stat-bar pressure ${pressureVal > 65 ? 'high' : ''}`}
                  style={{ width: `${pressureVal}%` }}
                />
              </div>
              <span className="stat-val">{pressureVal}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Volet Centre : Les 5 Verbes Tactiques */}
      <nav className="dock-categories">
        {CATEGORY_TABS.map((tab) => {
          const count = groupedActions[tab.key].length
          const isSelected = activeCategory === tab.key
          return (
            <button
              key={tab.key}
              className={`category-tab ${isSelected ? 'selected' : ''} ${count === 0 ? 'empty' : ''}`}
              onClick={() => handleTabClick(tab.key)}
              disabled={count === 0}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.label}</span>
              {count > 0 && <span className="tab-badge">{count}</span>}
            </button>
          )
        })}
      </nav>

      {/* 3. Volet Droit : Sous-options contextuelles */}
      <div className="dock-options">
        <div className="options-scroll">
          {activeList.map((action) => (
            <button
              key={action.id}
              className={`option-btn ${action.risk ?? 'moderate'}`}
              onClick={() => onAction(action.id)}
              onMouseEnter={() => onHoverAction?.(action.id)}
              onMouseLeave={() => onHoverAction?.(null)}
              disabled={!action.enabled}
            >
              <div className="option-title">{action.name}</div>
              <div className="option-desc">{action.description}</div>
              {/* Doc 05 Section 12 : Mode Normal qualitatif / Section 13 : Mode Expert chiffré */}
              {isExpertMode && action.estimatedSuccess !== undefined ? (
                <span className={`expert-pct-tag ${action.quality ?? 'neutral'}`}>
                  {action.estimatedSuccess}%
                </span>
              ) : action.qualityLabel ? (
                <span className={`quality-tag ${action.quality ?? 'neutral'}`}>
                  {action.qualityLabel}
                </span>
              ) : action.risk ? (
                <span className={`risk-tag ${action.risk}`}>
                  {action.risk === 'safe' ? 'SÛR' : action.risk === 'moderate' ? 'MODÉRÉ' : 'RISQUÉ'}
                </span>
              ) : null}
            </button>
          ))}
          {activeList.length === 0 && (
            <div className="empty-category-msg">Aucune option disponible dans cette zone</div>
          )}
        </div>

        {onLetAiDecide && (
          <button
            className="dock-ai-shortcut"
            onClick={onLetAiDecide}
            title="Laisser l'ordinateur jouer ce coup tactique"
          >
            ⚡ IA DÉCIDE
          </button>
        )}
      </div>
    </footer>
  )
}

export default ActionDock
