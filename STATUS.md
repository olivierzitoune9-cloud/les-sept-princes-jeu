# Status du projet — 18 septembre 2026 (session refonte interface)

## ⚡ Résumé en 10 lignes

1. **Déploiement Vercel : RÉSOLU.** La cause était un commit local non poussé (`b19c4bb`), pas le code. Le build local avec la commande exacte de Vercel passe (`npm run build:all`, exit 0).
2. Le jeu en ligne était **injouable** : pauses sur compteur, trop lent, pas de possession, défense absente, pas de but dessiné. Retour utilisateur franc : « tout est à refaire ? l'interface, oui ».
3. **L'interface a été entièrement refaite** (rendu, Field, HUD, hook, App). Le moteur existant a été conservé et étendu, jamais contourné.
4. **Moteur enrichi** : géométrie complète du terrain dans `engine/src/court.ts` (buts, 6 m, 9 m, 7 m, 4 m, zone de changement), `formation.ts` (placement/transition), `possession.ts` (boucle d'action + remise en jeu), spatial symétrisé pour les deux camps.
5. **Interface** : fenêtre de décision quand Nangis a la balle (plus aucun compteur périodique), vitesses 1×/2×/4×/8×, mode Coach/Auto, passes nommées, duel, fixation, croisé, course, **5 tirs paramétrés** (appui, centre, opposée haute, lob, roucoulette), **défense 6-0/1-5/1-2-3/Hybride** + temps mort.
6. **Buts dessinés** derrière la ligne de but, ouverts vers l'extérieur, avec filet ; visibles des deux côtés.
7. **Seed affichée dans le HUD (#44512)** : partie rejouable à l'identique (O-005 respecté côté interface).
8. **Validation** : moteur 26/26 tests (exit 0), typecheck app 0 erreur, build production Vite OK (54 modules, ~186 kB JS).
9. **Reste à faire** : trajectoires visibles, rapport de match causal, fermer O-003/O-005 dans docs/09 et docs/10, Phase C (20 parties, 100 seeds), Phase D (calibration chapitres 44-48).
10. **Licite vérifié** : cercles + numéros + texte uniquement, aucune représentation animée, aucune musique imposée, aucun pari.

## État des fichiers (cette session)

### Modifiés ou créés
- `app/src/utils/fieldConstants.ts` : palette + `backdrop`, géométrie consommée depuis le moteur
- `app/src/utils/fieldRenderer.ts` : réécrit (terrain, zones, buts, ballon, jetons)
- `app/src/components/Field.tsx` + `Field.css` : réécrits (canvas en mètres × échelle, interpolation)
- `app/src/components/HUD.tsx` + `HUD.css` : réécrits (score, chrono, mi-temps, possession, vitesse, mode, tactique, seed)
- `app/src/hooks/useMatchEngine.ts` : réécrit (fenêtres de décision, boucle pilotée par l'état)
- `app/src/App.tsx` : re-câblé sur la nouvelle API du hook
- `engine/src/court.ts` (nouveau), `formation.ts` (nouveau), `possession.ts` (nouveau)
- `engine/src/engine.ts`, `engine/src/spatial.ts`, `engine/src/match.ts`, `engine/src/simulation.ts`, `engine/src/index.ts`
- `engine/src/engine.test.ts` : 26 tests (1 test de géométrie corrigé : les rôles min/max du but étaient inversés dans le test, pas dans le code)
- `docs/06-document-fonctionnel.md`

## Ce qui marche aujourd'hui

- Match Nangis vs Lagny complet : 60 possessions ou 60 minutes, mi-temps, rapport de fin
- Décisions du coach en mode Coach ; simulation intégrale en mode Auto
- Remise en jeu cohérente après but (engagement), arrêt (relance gardien) ou interception
- Défense de Lagny pilotée par l'IA avec lecture des patterns mémoire
- Défense de Nangis dirigée par le coach (système + temps mort)

## Prochaines étapes (dans l'ordre)

1. **Trajectoires** : afficher passe/tir/course en pointillé pendant la fenêtre de décision (docs 01 §5, 04, 16 Phase B)
2. **Rapport causal** : dernières causes du moteur dans MatchReport (doc 11 « rapport minimal »)
3. **Fermer O-003 et O-005** dans `docs/10` avec la règle exacte ; entrées D-010/D-011 dans `docs/09`
4. **Phase C** : 20 parties, 100 seeds, rapport doc 11
5. **Phase D** : calibration chapitres 44 à 48 (fiches 13, rapport 14)
6. **Actions défensives du coach** : exposer `mark`/`help` du moteur pendant la possession adverse

## Pour tester en local

```bash
cd engine && npm install && npm run build
cd ../app && npm install && npm run dev
```

## Fichiers racine de session

- `STATUS.md` : ce fichier
- `HISTORIQUE_SESSION.md` : chronologie des sessions
- `NOTES_POUR_NOUVELLE_CONV.md` : à lire en premier pour reprendre
