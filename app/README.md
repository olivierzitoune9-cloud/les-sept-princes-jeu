# Les Sept Princes - Interface Jouable

Interface web du jeu de handball tactique Les Sept Princes.

## Installation

```bash
npm install
```

## Lancement

```bash
npm run dev
```

Puis ouvrir http://localhost:5173 dans le navigateur.

## Contrôles

- **Clic sur un joueur** : Sélectionner le joueur
- **Panneau d'actions** : Choisir une action (passe, duel, tir, fixation)
- **Pause/Lecture** : Contrôler la simulation
- **Vitesse** : 0.5×, 1×, 2× pour ajuster la vitesse de simulation
- **Espace** : Pause rapide (à implémenter si nécessaire)

## Fonctionnalités

- Terrain 40×20m avec zones réglementaires (6m, 9m, 7m)
- 14 joueurs sur le terrain (7 par équipe)
- Jetons avec numéros, noms, indicateurs fatigue/pression
- Pauses décisionnelles automatiques toutes les 2-3 actions pour Nangis
- Actions disponibles : passe, duel, tir, fixation
- Animation fluide avec interpolation
- 3 vitesses de simulation
- Rapport de fin de match avec statistiques
- Match complet Nangis vs Lagny

## Architecture

- `src/components/` : Composants React (Field, HUD, ActionPanel, MatchReport)
- `src/hooks/` : Hook useMatchEngine pour l'intégration du moteur
- `src/utils/` : Utilitaires de rendu Canvas et constantes
- `../engine/src/` : Moteur TypeScript (types, simulation, IA, résolution)

## Notes

- Le moteur est déterministe avec seed
- Les positions sont en mètres (terrain 40×20)
- Le Canvas utilise une échelle de 20px/m (800×400px)
- L'interface s'adapte automatiquement à la taille de l'écran
