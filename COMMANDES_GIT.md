# 🔧 Commandes Git pour GitHub

## Initialiser et pousser sur GitHub

### 1. Initialiser le repo local

```bash
git init
```

### 2. Ajouter tous les fichiers

```bash
git add .
```

### 3. Premier commit

```bash
git commit -m "feat: Interface jouable complète Les Sept Princes

- Terrain Canvas 40×20m avec zones réglementaires
- 14 joueurs (Nangis vs Lagny) avec jetons tactiques
- Animation fluide avec interpolation
- Pauses décisionnelles automatiques
- Actions: passe, duel, tir, fixation
- Rapport de fin de match avec statistiques
- 3 vitesses de simulation (0.5×, 1×, 2×)
- 100% conforme aux specs licites
- Documentation complète (GUIDE_DEMARRAGE.md, STATUS.md)
- Configuration Vercel prête"
```

### 4. Créer le repo sur GitHub

1. Aller sur https://github.com/new
2. Nom du repo : **sept-princes-jeu**
3. Description : **Jeu de handball tactique Les Sept Princes - Interface jouable**
4. Visibilité : **Private** (ou Public selon préférence)
5. **NE PAS** initialiser avec README, .gitignore ou license
6. Cliquer sur **"Create repository"**

### 5. Lier et pousser

```bash
# Remplace TON_USERNAME par ton nom d'utilisateur GitHub
git remote add origin https://github.com/TON_USERNAME/sept-princes-jeu.git

# Renommer la branche principale en main
git branch -M main

# Pousser vers GitHub
git push -u origin main
```

## Commandes Git utiles

### Vérifier le status
```bash
git status
```

### Voir l'historique
```bash
git log --oneline
```

### Créer une branche dev
```bash
git checkout -b dev
git push origin dev
```

### Revenir à main
```bash
git checkout main
```

### Mettre à jour après modifications
```bash
git add .
git commit -m "Description des changements"
git push
```

## 🚀 Après le push GitHub

1. Le repo est créé sur GitHub ✅
2. Aller sur https://vercel.com
3. **New Project** → **Import Git Repository**
4. Sélectionner **sept-princes-jeu**
5. Configuration :
   - **Framework Preset** : Vite
   - **Root Directory** : app
   - **Build Command** : `cd .. && npm run build:all`
   - **Output Directory** : dist
6. **Deploy** 🎉

## 📝 Structure du commit initial

Le commit inclut :
- ✅ `engine/` : Moteur TypeScript complet
- ✅ `app/` : Interface React complète
- ✅ `docs/` : Documentation du projet
- ✅ Configuration Vercel
- ✅ README.md principal
- ✅ .gitignore
- ✅ Guides de démarrage

## 🔐 Ignorer les fichiers sensibles

Le `.gitignore` est configuré pour exclure :
- `node_modules/`
- `dist/` et `build/`
- `.env` et fichiers locaux
- `.vercel/`
- Fichiers d'éditeur

## ✅ Vérification avant push

```bash
# Vérifier que .gitignore fonctionne
git status

# Ne devrait PAS montrer :
# - node_modules/
# - engine/dist/
# - app/dist/
# - .env files
```

Si ces dossiers apparaissent, vérifier que `.gitignore` est à la racine.

## 🎯 Prêt pour GitHub !

Une fois ces commandes exécutées :
1. Ton code sera sur GitHub
2. Tu pourras le connecter à Vercel
3. Le jeu sera déployé automatiquement
4. Chaque push futur redéploiera automatiquement

**Note** : Si tu as déjà un repo GitHub existant, saute l'étape 4 et utilise l'URL de ton repo existant.
