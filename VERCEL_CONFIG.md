# ⚙️ Configuration Vercel exacte

## 🎯 Configuration recommandée

Quand tu importes le projet dans Vercel, utilise ces paramètres **EXACTS** :

### Dans l'interface Vercel "Configure Project"

```
Framework Preset: Vite
Root Directory: app
Build Command: cd .. && npm run build:all
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
Node.js Version: 18.x
```

### Capture d'écran des settings (pour référence)

```
┌─────────────────────────────────────────────────┐
│ Framework Preset                                │
│ ┌─────────────────────────────────────────────┐ │
│ │ Vite                                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Root Directory (optional)                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ app                                         │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Build & Development Settings                    │
│ Override? [✓] Yes                              │
│                                                 │
│ Build Command                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ cd .. && npm run build:all                  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Output Directory                                │
│ ┌─────────────────────────────────────────────┐ │
│ │ dist                                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Install Command                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ npm install                                 │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## 🔍 Pourquoi ces paramètres ?

### Root Directory: `app`
Le code de l'interface est dans le dossier `app/`. C'est là que Vercel doit chercher le `package.json` principal pour l'app.

### Build Command: `cd .. && npm run build:all`
- `cd ..` : Remonter à la racine du projet
- `npm run build:all` : Exécuter le script qui :
  1. Compile le moteur (`engine/`)
  2. Build l'app React (`app/`)

### Output Directory: `dist`
Le build Vite produit les fichiers statiques dans `app/dist/`. C'est ce que Vercel doit servir.

### Install Command: `npm install`
Install les dépendances de l'app. Le script `build:all` s'occupe du reste.

## 🚨 Erreurs courantes et solutions

### Erreur : "Cannot find module '@engine/...'"

**Cause** : Le moteur n'est pas compilé avant le build de l'app.

**Solution** : Vérifier que `Build Command` est bien :
```
cd .. && npm run build:all
```

Et PAS seulement `npm run build`.

### Erreur : "vercel.json not found" ou routing ne marche pas

**Cause** : Le fichier `app/vercel.json` n'existe pas ou est mal placé.

**Solution** : Vérifier que `app/vercel.json` contient :
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Page blanche après déploiement

**Causes possibles** :
1. Le build a échoué silencieusement
2. Le routing SPA n'est pas configuré
3. Erreur JavaScript non visible

**Solutions** :
1. Vérifier les logs de build dans Vercel Dashboard
2. Vérifier que `app/vercel.json` existe
3. Ouvrir la console navigateur (F12) et chercher les erreurs

### Build timeout

**Cause** : Le build prend trop de temps (limite Vercel : 5 minutes en gratuit).

**Solution** : Le build normal prend ~2-3 minutes. Si timeout :
- Vérifier qu'il n'y a pas de tests lents
- Vérifier que `node_modules` n'est pas commité (`.gitignore`)

## 📊 Logs de build attendus

Un build réussi affichera :

```
Running build command...
> cd .. && npm run build:all

> build:engine
> cd engine && npm install && npm run build

added 150 packages
> tsc

> build:app
> cd app && npm install && npm run build

added 200 packages
> vite build

dist/index.html                  0.45 kB
dist/assets/index-a1b2c3d4.css   12.34 kB
dist/assets/index-e5f6g7h8.js    145.67 kB

Build completed in 2m 15s
```

## 🎯 Checklist avant déploiement

- [ ] `.gitignore` créé et configuré
- [ ] `package.json` racine avec scripts `build:all`
- [ ] `app/vercel.json` avec rewrites SPA
- [ ] `README.md` à jour
- [ ] Code poussé sur GitHub
- [ ] Repo GitHub accessible par Vercel

## 🔗 Liens utiles

- **Dashboard Vercel** : https://vercel.com/dashboard
- **Documentation Vite** : https://vitejs.dev/guide/build.html
- **Vercel Build Logs** : Dans ton projet > Deployments > [dernier build] > Building

## ✅ Validation post-déploiement

Une fois déployé, tester :

1. **URL s'ouvre** ✅
2. **Terrain visible** ✅
3. **14 joueurs affichés** ✅
4. **Bouton Play fonctionne** ✅
5. **Simulation tourne** ✅
6. **Pauses décisionnelles** ✅
7. **Actions fonctionnent** ✅
8. **Match va jusqu'au bout** ✅
9. **Rapport s'affiche** ✅
10. **Nouveau match fonctionne** ✅

## 🎉 Prêt à déployer !

Avec cette configuration, le déploiement sur Vercel devrait fonctionner du premier coup.

Si tu rencontres un problème, vérifie d'abord les logs de build dans le dashboard Vercel.
