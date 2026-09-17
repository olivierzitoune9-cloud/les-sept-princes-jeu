# Les Sept Princes — Jeu de Handball Tactique

Jeu de handball tactique basé sur l'univers des Sept Princes. Interface web sobre et premium, moteur de simulation déterministe, pauses décisionnelles et intelligence tactique.

## 🎮 Jouer en ligne

👉 **[Déployé sur Vercel](https://sept-princes-jeu.vercel.app)** (URL à mettre à jour)

## 🚀 Lancement en local

### Installation rapide

```bash
# Compiler le moteur
cd engine
npm install
npm run build

# Lancer l'interface
cd ../app
npm install
npm run dev
```

Ouvrir http://localhost:5173

### Commande unique (depuis la racine)

```bash
npm run build:all   # Compiler moteur + app
npm run dev         # Lancer en développement
```

## 📖 Documentation

- **[LANCEMENT_RAPIDE.md](LANCEMENT_RAPIDE.md)** : Guide minimal pour jouer immédiatement
- **[GUIDE_DEMARRAGE.md](GUIDE_DEMARRAGE.md)** : Installation complète et gameplay détaillé
- **[STATUS.md](STATUS.md)** : État du projet et fonctionnalités
- **[docs/INDEX.md](docs/INDEX.md)** : Documentation complète du projet

## 🎯 Fonctionnalités

### Interface jouable
- ✅ Terrain 40×20m avec zones réglementaires
- ✅ 14 joueurs (7 par équipe) avec jetons tactiques
- ✅ Animation fluide 60fps
- ✅ Pauses décisionnelles automatiques
- ✅ Actions : passe, duel, tir, fixation
- ✅ 3 vitesses de simulation (0.5×, 1×, 2×)
- ✅ Rapport de fin de match

### Moteur tactique
- ✅ Simulation déterministe avec seed
- ✅ IA contextuelle pour les deux équipes
- ✅ Résolution physique et tactique
- ✅ Fatigue, pression, confiance
- ✅ Systèmes défensifs (6-0, 1-5, 1-2-3)
- ✅ Gardiens avec lecture du tir

### 100% Licite
- ✅ Cercles et texte uniquement
- ✅ Aucune représentation animée
- ✅ Design sobre et tactique
- ✅ Aucun pari ni lootbox

## 🏗️ Architecture

```
sept-princes-jeu/
├── engine/          # Moteur TypeScript
│   ├── src/         # Types, simulation, IA, résolution
│   └── dist/        # Compilé (généré)
├── app/             # Interface React
│   ├── src/         # Components, hooks, utils
│   └── dist/        # Build production (généré)
└── docs/            # Documentation du projet
```

## 🛠️ Technologies

- **Frontend** : React 18 + TypeScript + Vite
- **Rendu** : Canvas 2D
- **Moteur** : TypeScript pur (déterministe)
- **Déploiement** : Vercel
- **Build** : npm scripts avec compilation séquentielle

## 📊 Status

**Phase actuelle** : Vertical slice jouable (Phase B)

- ✅ Noyau du moteur construit
- ✅ Interface complète et fluide
- ✅ Match Nangis vs Lagny jouable
- 🔄 Prochaine étape : Validation et calibration (Phase C)

Voir [STATUS.md](STATUS.md) pour les détails.

## 📝 Conformité

Le projet respecte strictement :
- Les documents de vérité (00, 01, 03, 04, 05)
- Les contraintes licites (AGENTS.md, docs/09)
- Le plan de développement (docs/16)

Aucune représentation d'être animé, aucun shirk, aucune musique imposée.

## 🎮 Comment jouer

1. Cliquer sur **▶ Reprendre** pour démarrer
2. Le match se joue automatiquement avec l'IA
3. Pauses automatiques toutes les 2-3 actions pour Nangis
4. Choisir une action dans le panneau
5. Match jusqu'au rapport final

### Lecture du terrain
- 🔵 Cercles bleus = Nangis
- 🔴 Cercles rouges = Lagny
- 🟡 Point jaune = Ballon
- 🟢 Anneau vert = Sélection
- Anneaux de couleur = Fatigue/pression

## 🤝 Contribution

Ce projet suit une méthode documentée :
1. Extraire du roman (docs/13)
2. Valider avec le gardien du licite
3. Verrouiller les décisions (docs/09)
4. Coder avec le moteur
5. Tester selon le protocole (docs/11)

## 📄 Licence

Projet privé. Tous droits réservés.

## 📞 Contact

Pour toute question, consulter la documentation dans `docs/`.
