# 🚀 Déploiement sur Vercel

## Configuration créée

Tous les fichiers nécessaires sont prêts :

- ✅ `.gitignore` : Exclure node_modules, dist, .vercel
- ✅ `README.md` : Documentation principale du projet
- ✅ `package.json` racine : Scripts de build
- ✅ `app/vercel.json` : Configuration SPA routing

## 📋 Étapes de déploiement

### 1. Initialiser Git et pousser sur GitHub

```bash
# Initialiser le repo
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit: Interface jouable Les Sept Princes"

# Créer le repo sur GitHub puis :
git remote add origin https://github.com/TON_USERNAME/sept-princes-jeu.git
git branch -M main
git push -u origin main
```

### 2. Connecter à Vercel

#### Option A : Via l'interface Vercel (recommandé)

1. Aller sur https://vercel.com
2. Cliquer sur **"Add New Project"**
3. Importer le repo GitHub `sept-princes-jeu`
4. **Configuration du build** :
   - **Framework Preset** : Vite
   - **Root Directory** : `app`
   - **Build Command** : `npm run build:all` (dans racine)
   - **Output Directory** : `dist`
   - **Install Command** : Laisser par défaut
5. Cliquer sur **"Deploy"**

#### Configuration exacte Vercel

```
Framework Preset: Vite
Root Directory: app
Build Command: cd .. && npm run build:all
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

#### Option B : Via la CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
cd app
vercel

# Suivre les prompts :
# - Set up and deploy? Yes
# - Which scope? [Votre compte]
# - Link to existing project? No
# - Project name? sept-princes-jeu
# - Directory? ./ (app)
# - Override settings? Yes
#   - Build Command? npm run build
#   - Output Directory? dist
```

### 3. Configuration Build (Important !)

Le build Vercel doit :
1. Installer les dépendances du moteur (`engine/`)
2. Compiler le moteur TypeScript
3. Installer les dépendances de l'app (`app/`)
4. Builder l'app React

**Script dans package.json racine** (déjà configuré) :
```json
{
  "scripts": {
    "build:engine": "cd engine && npm install && npm run build",
    "build:app": "cd app && npm install && npm run build",
    "build:all": "npm run build:engine && npm run build:app"
  }
}
```

### 4. Variables d'environnement (si nécessaire)

Aucune variable d'environnement requise pour l'instant.

Si besoin futur :
- Aller dans Settings → Environment Variables
- Ajouter les variables nécessaires

## 🔧 Configuration Vercel manuelle

Si la détection automatique échoue :

### Dans les Project Settings :

**Build & Development Settings**
```
Framework Preset: Vite
Root Directory: app/
Build Command: cd .. && npm run build:all
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

**Node.js Version**
```
18.x (ou 20.x)
```

## 📝 Fichier vercel.json (dans app/)

Déjà créé avec configuration SPA :

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

Ceci assure que toutes les routes redirigent vers index.html (SPA routing).

## ✅ Vérifications post-déploiement

1. **Build réussi** : Vérifier les logs de build Vercel
2. **App se charge** : Ouvrir l'URL Vercel
3. **Terrain visible** : Le canvas doit s'afficher
4. **Joueurs présents** : 14 joueurs sur le terrain
5. **Actions fonctionnent** : Tester passe, duel, tir
6. **Match complet** : Jouer jusqu'au rapport de fin

## 🐛 Troubleshooting

### Build échoue : "Cannot find module @engine/..."

**Solution** : Le moteur n'est pas compilé.

Vérifier que le script `build:all` est utilisé :
```bash
cd .. && npm run build:all
```

### Page blanche après déploiement

**Solution** : Vérifier `app/vercel.json` existe avec rewrites.

### Erreur TypeScript pendant le build

**Solution** : Vérifier que :
- `engine/tsconfig.json` est correct
- `app/tsconfig.json` a le bon alias `@engine`
- Les imports dans `useMatchEngine.ts` ont `.js` à la fin

### Canvas ne s'affiche pas

**Solution** : Ouvrir la console navigateur (F12).
Vérifier les erreurs JavaScript.

## 📊 Monitoring

Une fois déployé :

- **URL de production** : `https://sept-princes-jeu.vercel.app`
- **Dashboard Vercel** : Voir les analytics, logs, builds
- **Logs en temps réel** : Dans l'interface Vercel

## 🔄 Déploiements futurs

Chaque push sur `main` déclenchera automatiquement :
1. Un nouveau build
2. Un déploiement de preview
3. Promotion en production si succès

### Branches de preview

Créer une branche `dev` pour tester avant production :
```bash
git checkout -b dev
git push origin dev
```

Vercel créera une URL de preview pour cette branche.

## 🎯 Commandes utiles

```bash
# Build local pour tester
npm run build:all

# Preview du build local
cd app && npm run preview

# Déployer en production (Vercel CLI)
vercel --prod

# Voir les logs de déploiement
vercel logs
```

## 📞 Support

Si problème :
1. Vérifier les logs de build dans Vercel Dashboard
2. Tester le build en local : `npm run build:all`
3. Vérifier que `engine/dist/` est créé après build
4. Vérifier que `app/dist/` contient `index.html`

## ✨ C'est prêt !

Tous les fichiers sont configurés. Il ne reste plus qu'à :
1. Push sur GitHub
2. Connecter à Vercel
3. Déployer

Le jeu sera accessible en ligne en quelques minutes ! 🎉
