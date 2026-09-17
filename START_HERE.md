# 🚀 START HERE — Déploiement en 3 commandes

## Commandes à exécuter

### 1. GitHub (dans le terminal, depuis sept-princes-jeu/)

```bash
git init
git add .
git commit -m "feat: Interface jouable Les Sept Princes"
```

Puis créer le repo sur https://github.com/new (nom : `sept-princes-jeu`)

```bash
git remote add origin https://github.com/TON_USERNAME/sept-princes-jeu.git
git branch -M main
git push -u origin main
```

### 2. Vercel (dans l'interface web)

1. https://vercel.com → **New Project**
2. Import `sept-princes-jeu`
3. Configuration :
   - **Framework** : Vite
   - **Root** : `app`
   - **Build Command** : `cd .. && npm run build:all`
   - **Output** : `dist`
4. **Deploy**

### 3. C'est tout ! 🎉

Le jeu sera en ligne en 2-3 minutes.

---

## 📖 Documentation complète

- **POUR_AARON.md** ← Commence par là
- **COMMANDES_GIT.md** ← Détails Git/GitHub
- **VERCEL_CONFIG.md** ← Configuration Vercel exacte
- **DEPLOIEMENT_VERCEL.md** ← Guide complet

## ✅ Fichiers déjà créés

Tous les fichiers nécessaires sont prêts :
- `.gitignore` ✅
- `package.json` (scripts de build) ✅
- `app/vercel.json` (routing SPA) ✅
- Documentation complète ✅

## 🎮 Tester en local avant

```bash
cd engine && npm install && npm run build
cd ../app && npm install && npm run dev
```

Ouvrir http://localhost:5173

---

**Temps total** : 10 minutes  
**Difficulté** : Copy-paste de commandes  
**Résultat** : Jeu en ligne sur Vercel  

**Let's go !** 🚀
