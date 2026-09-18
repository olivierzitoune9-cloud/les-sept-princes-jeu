import { useMemo, useState } from 'react'
import type { VolleyDraftOrder } from '../hooks/useVolleyEngine'
import type { AttackVolleyIntent } from '@engine/volley.js'
import './VolleyPlanner.css'

interface VolleyPlayer {
  id: string
  name: string
  number: number
  team: 'nangis' | 'lagny'
  role?: string
  hasBall?: boolean
  position: { x: number; y: number }
}

interface VolleyPlannerProps {
  players: VolleyPlayer[]
  holderId: string | null
  draft: VolleyDraftOrder[]
  budget: { major: number; minor: number }
  validation: string | null
  onAddOrder: (kind: AttackVolleyIntent, targetId?: string) => void
  onRemoveOrder: (id: string) => void
  onSetTarget: (targetId: string) => void
  onLockAndResolve: () => void
  onAutoPlan: () => void
  onClear: () => void
  onSelectPlayer: (playerId: string) => void
  selectedPlayerId: string | null
}

const ORDER_KINDS: Array<{ kind: AttackVolleyIntent; label: string }> = [
  { kind: 'attackSpace', label: 'Attaquer' },
  { kind: 'fix', label: 'Fixer' },
  { kind: 'pass', label: 'Passer' },
  { kind: 'shoot', label: 'Tirer' },
  { kind: 'move', label: 'Placer' },
  { kind: 'cut', label: 'Couper' },
  { kind: 'stretch', label: 'Etirer' }
]

function orderLabel(order: VolleyDraftOrder, players: VolleyPlayer[]): string {
  const actor = players.find((p) => p.id === order.actorId)
  const target = order.targetId ? players.find((p) => p.id === order.targetId) : null
  const base = `${actor?.name ?? order.actorId} : ${order.kind}`
  if (target) return `${base} vers ${target.name}`
  if (order.targetPosition) return `${base} (${order.targetPosition.x.toFixed(1)}, ${order.targetPosition.y.toFixed(1)})`
  return base
}
const VolleyPlanner: React.FC<VolleyPlannerProps> = ({
  players, holderId, draft, budget, validation,
  onAddOrder, onRemoveOrder, onSetTarget,
  onLockAndResolve, onAutoPlan, onClear,
  onSelectPlayer, selectedPlayerId
}) => {
  const [pendingKind, setPendingKind] = useState<AttackVolleyIntent | null>(null)
  const mates = useMemo(
    () => players.filter((p) => p.team === 'nangis' && p.id !== selectedPlayerId),
    [players, selectedPlayerId]
  )
  const foes = useMemo(() => players.filter((p) => p.team === 'lagny'), [players])
  const pickTarget = (playerId: string) => {
    if (pendingKind === 'pass' || pendingKind === 'fix') {
      onSetTarget(playerId)
      setPendingKind(null)
      return
    }
    onSelectPlayer(playerId)
  }
  return (
    <section className="volley-planner">
      <div className="volley-planner-head">
        <div>
          <h2>Volee a planifier</h2>
          <p>Temps fige : 3 majeures + 2 mineures. Une fleche = une intention.</p>
        </div>
        <div className="volley-budget">
          <span className={budget.major > 3 ? 'over' : ''}>Majeures {budget.major}/3</span>
          <span className={budget.minor > 2 ? 'over' : ''}>Mineures {budget.minor}/2</span>
        </div>
      </div>
      <div className="volley-kinds">
        {ORDER_KINDS.map(({ kind, label }) => (
          <button
            key={kind}
            className={`volley-kind ${pendingKind === kind ? 'pending' : ''}`}
            onClick={() => {
              if (kind === 'shoot') {
                onAddOrder(kind)
              } else {
                setPendingKind(kind)
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {pendingKind && (
        <div className="volley-target">
          <span>Clique un joueur ou le terrain pour viser, ou annule.</span>
          <button className="volley-cancel" onClick={() => setPendingKind(null)}>Annuler</button>
        </div>
      )}
      <div className="volley-columns">
        <div className="volley-list">
          <h3>Plan ({draft.length})</h3>
          {draft.length === 0 && <p className="volley-empty">Ajoute une fleche, ou laisse l IA proposer.</p>}
          {draft.map((order) => (
            <div key={order.id} className="volley-order">
              <span>{orderLabel(order, players)}</span>
              <button onClick={() => onRemoveOrder(order.id)}>Retirer</button>
            </div>
          ))}
          {validation && <p className="volley-error">{validation}</p>}
          <div className="volley-actions">
            <button className="volley-resolve" onClick={onLockAndResolve} disabled={draft.length === 0}>
              Verrouiller et simuler
            </button>
            <button onClick={onAutoPlan}>IA propose</button>
            <button onClick={onClear}>Effacer</button>
          </div>
        </div>
        <div className="volley-roster">
          <h3>Partenaires</h3>
          <div className="volley-players">
            {mates.map((player) => (
              <button
                key={player.id}
                className={`volley-player ${player.id === holderId ? 'holder' : ''}`}
                onClick={() => pickTarget(player.id)}
              >
                #{player.number} {player.name}
              </button>
            ))}
          </div>
          <h3>Defenseurs</h3>
          <div className="volley-players foes">
            {foes.map((player) => (
              <button key={player.id} className="volley-player" onClick={() => pickTarget(player.id)}>
                #{player.number} {player.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default VolleyPlanner

