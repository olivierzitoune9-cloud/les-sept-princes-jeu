import { useMemo } from 'react'
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
  pendingKind: AttackVolleyIntent | null
  onAddOrder: (kind: AttackVolleyIntent, targetId?: string) => void
  onRemoveOrder: (id: string) => void
  onCancelPending: () => void
  onLockAndResolve: () => void
  onAutoPlan: () => void
  onClear: () => void
  onSelectPlayer: (playerId: string) => void
  selectedPlayerId: string | null
}

// Dock d'intentions v2 (D-021) : cartes compactes en bas d'ecran. La
// planification reste celle de la volee (spec 19 §4) : une fleche = une
// intention continue, jamais une choregraphie.
const ORDER_KINDS: Array<{ kind: AttackVolleyIntent; label: string; hint: string }> = [
  { kind: 'attackSpace', label: 'Attaquer', hint: "Attaque l'intervalle" },
  { kind: 'fix', label: 'Fixer', hint: 'Provoque la reponse' },
  { kind: 'pass', label: 'Passer', hint: 'Cherche un partenaire' },
  { kind: 'shoot', label: 'Tirer', hint: 'Prend la chance' },
  { kind: 'move', label: 'Placer', hint: 'Course de replacement' },
  { kind: 'cut', label: 'Couper', hint: 'Course interieure' },
  { kind: 'stretch', label: 'Etirer', hint: 'Donne la largeur' }
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
  players, holderId, draft, budget, validation, pendingKind,
  onAddOrder, onRemoveOrder, onCancelPending,
  onLockAndResolve, onAutoPlan, onClear,
  onSelectPlayer, selectedPlayerId
}) => {
  const holder = players.find((p) => p.id === holderId) ?? null
  // Le porteur reste visible : sinon un clic sur un partenaire le fait
  // disparaitre de la liste et la passe devient impossible a viser.
  const mates = useMemo(() => players.filter((p) => p.team === 'nangis'), [players])
  const foes = useMemo(() => players.filter((p) => p.team === 'lagny'), [players])
  // Le hook possede l'intention en attente : cliquer un joueur termine la
  // fleche en cours (passe, fixation, course) ou change l'acteur selectionne.
  const pendingHint =
    pendingKind === 'pass' ? `Passe : ${holder ? `${holder.name} (porteur)` : 'porteur'} ➔ clique un partenaire.`
    : pendingKind === 'fix' ? 'Fixation : clique le defenseur a fixer.'
    : pendingKind ? 'Course : clique le terrain pour viser, ou un partenaire pour le faire courir.'
    : null
  return (
    <section className="volley-planner v2-planner">
      <div className="volley-planner-head">
        <div>
          <h2>Plan de la volee</h2>
          <p>Temps fige · 3 majeures + 2 mineures · une fleche = une intention</p>
        </div>
        <div className="volley-budget">
          <span className={budget.major > 3 ? 'over' : ''}>Majeures {budget.major}/3</span>
          <span className={budget.minor > 2 ? 'over' : ''}>Mineures {budget.minor}/2</span>
        </div>
      </div>
      <div className="volley-kinds">
        {ORDER_KINDS.map(({ kind, label, hint }) => (
          <button
            key={kind}
            className={`volley-kind ${pendingKind === kind ? 'pending' : ''}`}
            disabled={kind === 'shoot' && !holderId}
            onClick={() => onAddOrder(kind)}
          >
            <span className="volley-kind-label">{label}</span>
            <span className="volley-kind-hint">{hint}</span>
          </button>
        ))}
      </div>
      {pendingHint && (
        <div className="volley-target">
          <span>{pendingHint}</span>
          <button className="volley-cancel" onClick={onCancelPending}>Annuler</button>
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
              VALIDER — simuler la volee
            </button>
            <button onClick={onAutoPlan}>IA propose</button>
            <button onClick={onClear}>Effacer</button>
          </div>
        </div>
        <div className="volley-roster">
          <h3>Nangis {holder ? `— porteur ${holder.name}` : ''}</h3>
          <div className="volley-players">
            {mates.map((player) => (
              <button
                key={player.id}
                className={`volley-player ${player.id === holderId ? 'holder' : ''} ${player.id === selectedPlayerId ? 'selected' : ''} ${pendingKind === 'pass' ? 'targetable' : ''}`}
                onClick={() => onSelectPlayer(player.id)}
              >
                #{player.number} {player.name}
              </button>
            ))}
          </div>
          <h3>Defenseurs</h3>
          <div className="volley-players foes">
            {foes.map((player) => (
              <button
                key={player.id}
                className={`volley-player ${pendingKind === 'fix' ? 'targetable' : ''}`}
                disabled={pendingKind !== 'fix'}
                onClick={() => onSelectPlayer(player.id)}
              >
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

