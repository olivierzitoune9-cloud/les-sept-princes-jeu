# Notes pour nouvelle conversation — à lire en premier

## Contexte en 5 lignes

- Projet : Les Sept Princes, jeu de handball tactique. Match pilote Nangis vs Lagny (chapitres 44-48).
- Le jeu est **déployé sur Vercel** (problème de build résolu le 18/09 : c'était un commit non poussé, pas le code).
- Le retour utilisateur sur la première version : « injouable » → **l'interface a été entièrement refaite** dans la foulée.
- Moteur `engine/` : 26/26 tests, étendu (géométrie du terrain, formations, possession, remises en jeu).
- App `app/` : fenêtres de décision sur possession, vitesses 1-8×, tirs paramétrés, défenses 6-0/1-5/1-2-3/Hybride, seed rejouable.

## Ce qui existe (ne pas refaire)

- **Moteur** : `engine/src/` — court.ts (géométrie), formation.ts (placement), possession.ts (boucle d'action), engine.ts (résolution), ai.ts (décision IA), goalkeeper.ts, coaching.ts (systèmes, temps morts), spatial.ts (intervalles), match.ts (création du match pilote), simulation.ts, validation.ts (campagne de seeds).
- **Interface** : `app/src/` — Field.tsx (canvas), HUD.tsx, ActionPanel.tsx, MatchReport.tsx, useMatchEngine.ts, fieldRenderer.ts, fieldConstants.ts.
- **Contrat clé** : l'interface consomme `getSituation` (actions), `playAction` (résolution + remise en jeu), `changeSystem`, `callTimeout`, `chooseNextAction`. Elle ne recode aucune règle. `ActionIntent` porte `shotType`/`shotSide`/`shotHeight` (tirs paramétrés déjà gérés par le moteur).

## Choix d'interface à connaître

- Fenêtre de décision UNIQUEMENT quand Nangis a la balle en mode Coach (jamais sur compteur de temps — c'était le principal reproche).
- Lagny joue en continu ; bouton « Laisser l'IA jouer » pour rendre la main.
- Seed fixe 44512, affichée dans le HUD, rejouable.
- Fins : 60 possessions ou 60 minutes.

## Prochaines actions (dans l'ordre)

1. **Trajectoires visibles** pendant la fenêtre de décision (passe, tir, course) — exigées par docs 01/04/16 Phase B, encore absentes.
2. **Rapport causal** dans MatchReport : afficher les causes du moteur (dernier événement, pourquoi l'arrêt, pourquoi l'espace).
3. **Fermer O-003 et O-005** dans `docs/10-registre-decisions-ouvertes.md` avec la règle exacte (déclencheur de pause = situation du moteur, pas un compteur ; reproductibilité de la seed côté interface), et ajouter D-010/D-011 dans `docs/09-historique-decisions.md`.
4. **Phase C** (doc 16) : 20 parties simulées, 100 seeds, rapport de validation doc 11.
5. **Phase D** : calibration avec fiches 13 et rapport 14 (strict Kael-Yanis, remplacement Yanis→Leo, 1-2-3 hybride, jeu à 7, lecture finale Liam-Malone).
6. Exposer `mark`/`help` au coach pendant la possession adverse (déjà dans le moteur).
7. Aligner les deux `vercel.json` (racine = mort aujourd'hui, garder une seule source de vérité) et versionner les `package-lock.json` (le `.gitignore` racine les ignore — fragile en CI).

## Pour tester

```bash
cd engine && npm install && npm run build   # puis: npm run test (26 tests)
cd ../app && npm install && npm run dev     # http://localhost:5173
npm run build:all                           # depuis la racine = commande Vercel
```

## Avertissements

- `STATUS.md` et `HISTORIQUE_SESSION.md` sont des notes de session, pas des documents canon : en cas de conflit, les `docs/00-16` font foi.
- Le terminal de l'agent : une seule commande à la fois (le shell ferme la commande précédente) ; préférer PowerShell + redirection vers un fichier temporaire + lecture du fichier.
- Ne jamais redéclarer la géométrie côté app : importer depuis `@engine/court.js` (buts, zones, distances de tir).
