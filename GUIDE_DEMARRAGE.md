# Guide de démarrage rapide — Les Sept Princes

## Prérequis

- Node.js 18+ installé
- npm ou équivalent

## Installation et lancement

### 1. Installer les dépendances du moteur

```bash
cd engine
npm install
```

### 2. Compiler le moteur

```bash
npm run build
```

### 3. Tester le moteur (optionnel)

```bash
npm run test
```

### 4. Installer les dépendances de l'interface

```bash
cd ../app
npm install
```

### 5. Lancer l'interface

```bash
npm run dev
```

L'application s'ouvre sur http://localhost:5173

## Comment jouer

### Démarrage

1. Le match commence en pause
2. Cliquer sur **▶ Reprendre** pour démarrer
3. La simulation tourne automatiquement

### Pauses décisionnelles

- Toutes les 2-3 actions, le jeu met en pause pour Nangis
- Un panneau apparaît en bas avec les actions disponibles
- Choisir une action : **Passe**, **Duel**, **Tir**, **Fixation**
- Le jeu reprend automatiquement après l'action

### Contrôles

- **⏸ Pause / ▶ Reprendre** : Contrôler la simulation
- **0.5× / 1× / 2×** : Ajuster la vitesse
- **Clic sur un joueur** : Voir ses informations
- **Actions** : Sélectionner une action dans le panneau

### Lecture du terrain

- **Cercles bleus** : Joueurs de Nangis
- **Cercles rouges** : Joueurs de Lagny
- **Point jaune** : Ballon
- **Anneau vert** : Joueur sélectionné
- **Anneau rouge** : Fatigue basse (< 70%)
- **Anneau orange** : Pression élevée (> 50)

### Fin de match

- Le match se termine après **60 possessions** ou **60 minutes**
- Un rapport complet s'affiche avec :
  - Score final
  - Statistiques (buts, arrêts, interceptions, fautes)
  - Moments clés
- **Nouveau match** : Relancer avec une seed différente

## Fonctionnalités avancées

### Interface

- Le terrain respecte les dimensions réglementaires (40×20m)
- Les zones 6m et 9m sont visibles
- L'animation est fluide avec interpolation
- L'interface s'adapte à la taille de l'écran

### Moteur

- Simulation déterministe avec seed
- IA décide pour les deux équipes
- Pauses automatiques pour les décisions humaines (Nangis)
- Résolution physique et tactique des actions
- Fatigue, pression, confiance des joueurs
- Systèmes défensifs (6-0, 1-5, 1-2-3)
- Gardiens avec lecture du tir

## Architecture

```
sept-princes-jeu/
├── engine/               # Moteur TypeScript
│   ├── src/
│   │   ├── types.ts      # Types et interfaces
│   │   ├── match.ts      # Roster Nangis-Lagny
│   │   ├── engine.ts     # Résolution des actions
│   │   ├── ai.ts         # Décisions IA
│   │   ├── simulation.ts # Boucle de match
│   │   └── ...
│   └── package.json
│
├── app/                  # Interface React
│   ├── src/
│   │   ├── components/   # Field, HUD, ActionPanel, MatchReport
│   │   ├── hooks/        # useMatchEngine
│   │   ├── utils/        # Rendu Canvas
│   │   └── main.tsx
│   └── package.json
│
└── docs/                 # Documentation du projet
```

## Prochaines étapes

Consulter `docs/INDEX.md` pour comprendre la vision complète du projet.

Le jeu actuel correspond à la **vertical slice jouable** (Phase B du doc 16).

Pour étendre :
- Ajouter plus de joueurs (Leo, Ilyes, Layo, Rio)
- Implémenter le match pilote complet (chapitres 44-48)
- Ajouter les autres équipes
- Développer la campagne

## Dépannage

### Le jeu ne se lance pas

- Vérifier que le moteur est compilé : `cd engine && npm run build`
- Vérifier les dépendances : `npm install` dans `engine/` et `app/`

### Erreur de compilation TypeScript

- Le tsconfig pointe vers `../engine/src` avec l'alias `@engine`
- Vérifier que les extensions `.js` sont bien dans les imports du moteur

### Le terrain est vide

- Ouvrir la console du navigateur (F12)
- Vérifier les erreurs JavaScript
- Le match s'initialise au premier rendu

## Contact

Pour toute question, consulter la documentation dans `docs/`.
