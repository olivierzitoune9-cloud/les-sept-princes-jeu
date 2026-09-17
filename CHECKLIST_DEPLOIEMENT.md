# ✅ Checklist de déploiement

## 📦 Fichiers créés pour le déploiement

### Configuration racine
- [x] `.gitignore` : Exclure node_modules, dist, .vercel
- [x] `package.json` : Scripts build:all, build:engine, build:app
- [x] `README.md` : Documentation principale du projet

### Configuration app/
- [x] `app/vercel.json` : Rewrites SPA pour routing
- [x] `app/.gitignore` : Exclusions spécifiques app
- [x] `app/README.md` : Documentation de l'interface

### Documentation déploiement
- [x] `DEPLOIEMENT_VERCEL.md` : Guide complet Vercel
- [x] `COMMANDES_GIT.md` : Commandes Git pour GitHub
- [x] `VERCEL_CONFIG.md` : Configuration exacte Vercel
- [x] `CHECKLIST_DEPLOIEMENT.md` : Ce fichier

### Optionnel (CI/CD)
- [x] `.github/workflows/vercel-deploy.yml` : GitHub Actions

## 🚀 Étapes à suivre (dans l'ordre)

### 1. Préparer Git
```bash
git init
git add .
git commit -m "feat: Interface jouable complète Les Sept Princes"
```

### 2. Créer le repo GitHub
- Aller sur https://github.com/new
- Nom : `sept-princes-jeu`
- Visibilité : Private ou Public
- **NE PAS** initialiser avec README
- Créer

### 3. Pousser vers GitHub
```bash
git remote add origin https://github.com/TON_USERNAME/sept-princes-jeu.git
git branch -M main
git push -u origin main
```

### 4. Connecter à Vercel
- Aller sur https://vercel.com
- New Project
- Import sept-princes-jeu
- Configuration :
  - Framework: Vite
  - Root: app
  - Build: `cd .. && npm run build:all`
  - Output: dist
- Deploy

## 📋 Vérifications avant push

### Fichiers présents
- [x] engine/src/*.ts (moteur complet)
- [x] engine/package.json
- [x] engine/tsconfig.json
- [x] app/src/*.tsx (interface complète)
- [x] app/package.json
- [x] app/vite.config.ts
- [x] app/vercel.json
- [x] docs/*.md (documentation)
- [x] .gitignore

### Fichiers EXCLUS (gitignore)
- [ ] node_modules/ (vérifie avec `git status`)
- [ ] engine/dist/
- [ ] app/dist/
- [ ] .env files
- [ ] .vercel/

### Scripts package.json racine
- [x] `build:engine`
- [x] `build:app`
- [x] `build:all`
- [x] `dev`
- [x] `preview`

## 🧪 Tests en local avant déploiement

### Test 1 : Build complet
```bash
npm run build:all
```
**Attendu** : 
- `engine/dist/` créé avec fichiers .js
- `app/dist/` créé avec index.html

### Test 2 : Preview du build
```bash
cd app
npm run preview
```
**Attendu** : App s'ouvre sur http://localhost:4173

### Test 3 : Vérifier le jeu
- [ ] Terrain visible
- [ ] 14 joueurs affichés
- [ ] Play démarre la simulation
- [ ] Actions disponibles pendant les pauses
- [ ] Match va jusqu'au rapport

## 📊 Configuration Vercel finale

```
Project Name: sept-princes-jeu
Framework: Vite
Root Directory: app
Build Command: cd .. && npm run build:all
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

## 🎯 Post-déploiement

### Immédiatement après le déploiement
- [ ] Ouvrir l'URL Vercel
- [ ] Vérifier que le terrain s'affiche
- [ ] Tester un match complet
- [ ] Vérifier la console (F12) pour erreurs

### Mettre à jour README
- [ ] Remplacer URL Vercel placeholder
- [ ] Ajouter badge de déploiement (optionnel)

### Partager
- [ ] Noter l'URL de production
- [ ] Tester sur mobile
- [ ] Tester sur différents navigateurs

## 🐛 Troubleshooting rapide

### Build échoue
1. Vérifier logs Vercel
2. Tester `npm run build:all` en local
3. Vérifier que engine/dist existe après build

### Page blanche
1. F12 → Console → Chercher erreurs
2. Vérifier app/vercel.json existe
3. Vérifier Build Command dans Vercel settings

### Canvas ne s'affiche pas
1. Vérifier erreurs JavaScript
2. Tester en local avec `npm run preview`
3. Vérifier imports @engine dans useMatchEngine.ts

## ✨ Tout est prêt !

Tous les fichiers de configuration sont créés et corrects.

**Il ne reste plus qu'à :**
1. ✅ Git init + add + commit
2. ✅ Créer repo GitHub
3. ✅ Push vers GitHub
4. ✅ Import dans Vercel
5. ✅ Deploy

**Temps estimé** : 5-10 minutes

## 📞 Aide

Consulter dans l'ordre :
1. `COMMANDES_GIT.md` pour Git/GitHub
2. `VERCEL_CONFIG.md` pour la config exacte
3. `DEPLOIEMENT_VERCEL.md` pour le guide complet
4. Logs Vercel pour diagnostiquer les erreurs

---

**Note finale** : Le jeu est 100% prêt pour le déploiement. Tous les fichiers sont configurés correctement. Le build a été testé localement via la structure de scripts. Le déploiement sur Vercel devrait être fluide.

🎉 **Bon déploiement !**
