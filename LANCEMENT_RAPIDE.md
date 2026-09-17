# 🎮 Lancement rapide — Les Sept Princes

## Pour jouer MAINTENANT

### 1️⃣ Compiler le moteur (une seule fois)
```bash
cd engine
npm install
npm run build
cd ..
```

### 2️⃣ Lancer le jeu
```bash
cd app
npm install
npm run dev
```

### 3️⃣ Ouvrir le navigateur
👉 http://localhost:5173

## Comment jouer

1. **Cliquer sur ▶ Reprendre** pour démarrer
2. Le jeu tourne automatiquement
3. **Toutes les 2-3 actions**, le jeu met en pause pour toi
4. **Choisir une action** dans le panneau :
   - Passe vers un coéquipier
   - Duel contre un adversaire
   - Tir (si en zone)
   - Fixation (attirer la défense)
5. Le match continue jusqu'à la fin
6. **Rapport complet** avec statistiques

## Contrôles

- **⏸ Pause / ▶ Reprendre** : Arrêter/relancer
- **0.5× / 1× / 2×** : Vitesse de simulation
- **Clic sur joueur** : Voir ses stats

## Lecture du terrain

- 🔵 **Cercles bleus** = Nangis (ton équipe)
- 🔴 **Cercles rouges** = Lagny
- 🟡 **Point jaune** = Ballon
- 🟢 **Anneau vert** = Joueur sélectionné
- ⚠️ **Anneau rouge** = Fatigue basse
- ⚠️ **Anneau orange** = Pression haute

## C'est tout !

Le reste est dans `GUIDE_DEMARRAGE.md` et `STATUS.md`.

Amuse-toi bien ! 🎉
