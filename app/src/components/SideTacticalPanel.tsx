import React, { useState } from 'react'
import type { LiveMatchStats } from '../hooks/useMatchEngine'
import './SideTacticalPanel.css'

export interface DuelContext {
  attacker: { id: string; name: string; number: number; role: string; duel: number; acceleration: number; shooting: number }
  defender: { id: string; name: string; number: number; role: string; defense: number; anticipation: number }
  duelActionId?: string
}

interface SideTacticalPanelProps {
  duel?: DuelContext | null
  systemLagny: string
  openIntervals?: string[]
  threats?: string[]
  onExecuteDuel?: (
    duelActionId: string,
    options?: { direction?: 'inside' | 'outside'; intention?: 'explode' | 'feint' | 'delay' }
  ) => void
  liveStats?: LiveMatchStats | null
}

const SideTacticalPanel: React.FC<SideTacticalPanelProps> = ({
  duel,
  systemLagny,
  openIntervals = ['Intervalle 2-3'],
  threats = ['Erwan (ailier ouvert)', 'Aaron (en appui)'],
  onExecuteDuel,
  liveStats
}) => {
  const [activeTab, setActiveTab] = useState<'situation' | 'analysis'>('situation')
  const [selectedDirection, setSelectedDirection] = useState<'inside' | 'outside'>('inside')
  const [selectedIntention, setSelectedIntention] = useState<'explode' | 'feint' | 'delay'>('explode')

  return (
    <aside className="side-tactical-panel">
      {/* Sélecteur d'onglets haut : Terrain & Duels vs Analyse Stats */}
      <div className="panel-tab-bar">
        <button
          className={`panel-tab ${activeTab === 'situation' ? 'active' : ''}`}
          onClick={() => setActiveTab('situation')}
        >
          ⚔ TERRAIN & DUELS
        </button>
        <button
          className={`panel-tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          📊 ANALYSE MATCH
        </button>
      </div>

      {activeTab === 'analysis' ? (
        /* Doc 05 - Sections 76, 91, 92 : Statistiques en direct et efficacités */
        <div className="panel-analysis-card">
          <div className="analysis-header">
            <span className="sit-icon">📊</span>
            <span className="sit-title">STATISTIQUES EN DIRECT</span>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-box-lbl">POSSESSIONS</span>
              <span className="stat-box-val">
                {liveStats?.possessions.nangis ?? 0} <span className="vs-sep">/</span> {liveStats?.possessions.lagny ?? 0}
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-box-lbl">EFFICACITÉ TIRS</span>
              <span className="stat-box-val highlight">
                {liveStats?.shotEfficiency.nangis ?? 0}% <span className="vs-sep">/</span> {liveStats?.shotEfficiency.lagny ?? 0}%
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-box-lbl">TIRS CADRÉS</span>
              <span className="stat-box-val">
                {liveStats?.shots.nangis ?? 0} <span className="vs-sep">/</span> {liveStats?.shots.lagny ?? 0}
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-box-lbl">ARRÊTS GARDIEN</span>
              <span className="stat-box-val">
                {liveStats?.saves.nangis ?? 0} <span className="vs-sep">/</span> {liveStats?.saves.lagny ?? 0}
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-box-lbl">PERTES DE BALLE</span>
              <span className="stat-box-val danger">
                {liveStats?.turnovers.nangis ?? 0} <span className="vs-sep">/</span> {liveStats?.turnovers.lagny ?? 0}
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-box-lbl">FAUTES SUBIES</span>
              <span className="stat-box-val">
                {liveStats?.fouls.nangis ?? 0} <span className="vs-sep">/</span> {liveStats?.fouls.lagny ?? 0}
              </span>
            </div>
          </div>

          {/* Doc 05 - Section 93/94 : Observations de jeu sans assistance artificielle */}
          <div className="sit-section">
            <span className="section-label">OBSERVATIONS DU COACH</span>
            <ul className="sit-list">
              {(liveStats?.keyObservations ?? ['Défense adverse en place', 'Observer les replis']).map((obs, i) => (
                <li key={i} className="sit-item gold">
                  <span className="bullet">⚡</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : duel ? (
        /* Doc 05 - Section 15, 16, 17 : Duel 1v1 avec choix de direction et intention */
        <div className="panel-duel-card">
          <div className="duel-header">
            <span className="duel-icon">⚔</span>
            <span className="duel-title">DUEL DIRECT</span>
          </div>

          <div className="duel-fighters">
            {/* Attaquant */}
            <div className="fighter attacker">
              <div className="fighter-num">{duel.attacker.number}</div>
              <div className="fighter-details">
                <span className="fighter-name">{duel.attacker.name}</span>
                <span className="fighter-role">Nangis · {duel.attacker.role}</span>
              </div>
            </div>

            <div className="vs-badge">VS</div>

            {/* Défenseur */}
            <div className="fighter defender">
              <div className="fighter-num">{duel.defender.number}</div>
              <div className="fighter-details">
                <span className="fighter-name">{duel.defender.name}</span>
                <span className="fighter-role">Lagny · {duel.defender.role}</span>
              </div>
            </div>
          </div>

          {/* Comparatif statistique réel */}
          <div className="duel-stats-compare">
            <div className="compare-row">
              <span className="stat-attacker">{duel.attacker.duel}</span>
              <span className="stat-label">Duel 1v1</span>
              <span className="stat-defender">{duel.defender.defense}</span>
            </div>
            <div className="compare-row">
              <span className="stat-attacker">{duel.attacker.acceleration}</span>
              <span className="stat-label">Premier pas</span>
              <span className="stat-defender">{duel.defender.anticipation}</span>
            </div>
            <div className="compare-row">
              <span className="stat-attacker">{duel.attacker.shooting}</span>
              <span className="stat-label">Finition</span>
              <span className="stat-defender">—</span>
            </div>
          </div>

          {/* Paramètres tactiques interactifs (Doc 05 - Sections 16 & 17) */}
          <div className="duel-tactic-options">
            <div className="tactic-group">
              <span className="group-title">DIRECTION</span>
              <div className="pill-group">
                <button
                  type="button"
                  className={`pill ${selectedDirection === 'inside' ? 'active' : ''}`}
                  onClick={() => setSelectedDirection('inside')}
                >
                  ↗ Intérieur
                </button>
                <button
                  type="button"
                  className={`pill ${selectedDirection === 'outside' ? 'active' : ''}`}
                  onClick={() => setSelectedDirection('outside')}
                >
                  ← Extérieur
                </button>
              </div>
            </div>
            <div className="tactic-group">
              <span className="group-title">INTENTION</span>
              <div className="pill-group">
                <button
                  type="button"
                  className={`pill ${selectedIntention === 'explode' ? 'active' : ''}`}
                  onClick={() => setSelectedIntention('explode')}
                >
                  ⚡ Exploser
                </button>
                <button
                  type="button"
                  className={`pill ${selectedIntention === 'feint' ? 'active' : ''}`}
                  onClick={() => setSelectedIntention('feint')}
                >
                  🎭 Feinter
                </button>
                <button
                  type="button"
                  className={`pill ${selectedIntention === 'delay' ? 'active' : ''}`}
                  onClick={() => setSelectedIntention('delay')}
                >
                  ⏱ Temporiser
                </button>
              </div>
            </div>
          </div>

          {duel.duelActionId && onExecuteDuel && (
            <button
              className="validate-duel-btn"
              onClick={() =>
                onExecuteDuel(duel.duelActionId!, {
                  direction: selectedDirection,
                  intention: selectedIntention
                })
              }
            >
              ENGAGER LE DUEL ➔
            </button>
          )}
        </div>
      ) : (
        /* Situation Tactique normale */
        <div className="panel-situation-card">
          <div className="situation-header">
            <span className="sit-icon">📋</span>
            <span className="sit-title">LECTURE DU TERRAIN</span>
          </div>

          <div className="sit-section">
            <span className="section-label">DISPOSITIF LAGNY</span>
            <div className="system-pill">Défense {systemLagny}</div>
          </div>

          <div className="sit-section">
            <span className="section-label">ESPACES EXPLOITABLES</span>
            <ul className="sit-list">
              {openIntervals.map((interval, i) => (
                <li key={i} className="sit-item green">
                  <span className="bullet">●</span>
                  <span>{interval}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sit-section">
            <span className="section-label">SOLUTIONS DISPONIBLES</span>
            <ul className="sit-list">
              {threats.map((threat, i) => (
                <li key={i} className="sit-item blue">
                  <span className="bullet">●</span>
                  <span>{threat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </aside>
  )
}

export default SideTacticalPanel
