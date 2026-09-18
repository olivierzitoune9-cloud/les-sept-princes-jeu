# Status du projet — 18 septembre 2026 (session refonte interface)

> **Mise à jour session 4 (soir)** : passe PILOTE-SIM 2 (D-013). La défense appartient au coach de Nangis — la fenêtre de contestation ne s'ouvre plus que quand Nangis défend (plus jamais pour choisir la défense adverse). Lagny attaque en continu (plus de pause forcée ni de bouton bloquant) ; le coach défend par les fenêtres de contest (duel/tir/dribble/passe adverse installée dans sa moitié) et en cliquant un défenseur. Les options défensives sont gagées par la proximité (≤ 6 m ; presser ≤ 4 m ; repli sinon). L'espace est enfin visible : vrais intervalles du moteur dans le panneau latéral, halos discrets sur le terrain, passes décrites par l'intervalle devant le receveur. Moteur 37/37 tests, typecheck app 0 erreur. Détails : `HISTORIQUE_SESSION.md` session 4, `docs/09` D-013, `docs/17` E-011→E-014.

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

- **Boucle interactive Jalon 0.1 rétablie** : le panneau d'actions s'ouvre automatiquement sur le porteur dès la possession Nangis, sans clic préalable nécessaire.
- **Trajectoires tactiques visibles sur le terrain** :
  - Passes : flèches en pointillés reliées aux coéquipiers receveurs, avec code couleur selon le risque (vert sûr, jaune modéré, rouge risqué).
  - Tirs : cône et rayon de tir orientés vers le but adverse de Lagny.
  - Duels / Fixations : ligne de contestation pointillée face au défenseur direct.
  - Clic direct sur le terrain : cliquer sur un partenaire receveur déclenche directement la passe vers lui.
- **Signalétique terrain** : noms des joueurs affichés sous chaque jeton, double halo or pour le porteur de balle, anneaux de cible pour les démarquages.
- **Feedback causal en temps réel** : bandeau d'analyse tactique traduisant les causes du moteur après chaque passe, tir, duel ou interception (ex: *« Passe réussie : Yanis ➔ Aaron — intervalle ouvert »*, *« Arrêt de Teddy — lecture du gardien »*).
- **Contrôle fluide** : bouton rapide *« ⚡ IA décide »* dans le bandeau et l'ActionPanel pour laisser l'IA jouer un coup instantanément si souhaité.
- Match Nangis vs Lagny complet : 60 possessions ou 60 minutes, mi-temps, rapport de fin.
- Défense de Lagny pilotée par l'IA avec lecture des patterns mémoire.
- Défense de Nangis dirigée par le coach (système + temps mort).

## Prochaines étapes (dans l'ordre)

1. **Rapport causal enrichi** : intégrer l'historique des causes moteur dans le `MatchReport` final (doc 11 « rapport minimal »).
2. **Fermer O-003 et O-005** dans `docs/10` avec la règle exacte ; entrées D-010/D-011 dans `docs/09`.
3. **Phase C** : 20 parties, 100 seeds, rapport doc 11.
4. **Phase D** : calibration chapitres 44 à 48 (fiches 13, rapport 14).
5. **Actions défensives du coach** : exposer `mark`/`help` du moteur pendant la possession adverse.

## Pour tester en local

```bash
cd engine && npm install && npm run build
cd ../app && npm install && npm run dev
```

## Fichiers racine de session

- `STATUS.md` : ce fichier
- `HISTORIQUE_SESSION.md` : chronologie des sessions
- `NOTES_POUR_NOUVELLE_CONV.md` : à lire en premier pour reprendre
