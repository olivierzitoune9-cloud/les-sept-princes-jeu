import React from 'react'
import './ActionClimaxOverlay.css'

export interface ClimaxEvent {
  type: 'goal' | 'save' | 'interception' | 'duel-won' | 'foul'
  actorName: string
  actorNumber?: number
  targetName?: string
  score?: { nangis: number; lagny: number }
  causesText: string
}

interface ActionClimaxOverlayProps {
  climax: ClimaxEvent | null
}

const ActionClimaxOverlay: React.FC<ActionClimaxOverlayProps> = ({ climax }) => {
  if (!climax) return null

  return (
    <div className={`climax-overlay ${climax.type}`}>
      <div className="climax-card">
        {climax.type === 'goal' && (
          <>
            <div className="climax-badge goal">BUT !</div>
            <div className="climax-player">
              {climax.actorNumber ? `#${climax.actorNumber} ` : ''}{climax.actorName.toUpperCase()}
            </div>
            {climax.score && (
              <div className="climax-score">
                <span className="team-nangis">Nangis {climax.score.nangis}</span>
                <span className="score-sep">—</span>
                <span className="team-lagny">{climax.score.lagny} Lagny</span>
              </div>
            )}
            <div className="climax-detail">{climax.causesText}</div>
          </>
        )}

        {climax.type === 'save' && (
          <>
            <div className="climax-badge save">PARADE DU GARDIEN</div>
            <div className="climax-player">{climax.targetName ?? 'TEDDY'}</div>
            <div className="climax-sub">Tir repoussé de {climax.actorName}</div>
            <div className="climax-detail">{climax.causesText}</div>
          </>
        )}

        {climax.type === 'interception' && (
          <>
            <div className="climax-badge interception">INTERCEPTION</div>
            <div className="climax-player">{climax.targetName ?? 'DÉFENSE DE LAGNY'}</div>
            <div className="climax-sub">Passe coupée sur {climax.actorName}</div>
            <div className="climax-detail">{climax.causesText}</div>
          </>
        )}

        {climax.type === 'duel-won' && (
          <>
            <div className="climax-badge duel">DUEL GAGNÉ</div>
            <div className="climax-player">{climax.actorName}</div>
            <div className="climax-sub">Débordement face à {climax.targetName}</div>
            <div className="climax-detail">{climax.causesText}</div>
          </>
        )}

        {climax.type === 'foul' && (
          <>
            <div className="climax-badge foul">FAUTE DÉFENSIVE</div>
            <div className="climax-player">Coup franc pour {climax.actorName}</div>
            <div className="climax-detail">{climax.causesText}</div>
          </>
        )}
      </div>
    </div>
  )
}

export default ActionClimaxOverlay
