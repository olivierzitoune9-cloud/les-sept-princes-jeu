# Historique des sessions

## Session 1 — 18 septembre 2026 (matin) : première interface + déploiement

- Création de l'interface React + Vite (Field, HUD, ActionPanel, MatchReport, hook useMatchEngine).
- Intégration du moteur TypeScript, animation par interpolation.
- Configuration GitHub (`olivierzitoune9-cloud/les-sept-princes-jeu`) + Vercel (Framework Vite, Root `app`, build `cd .. && npm run build:all`).
- Plusieurs échecs de build Vercel (TS2322, TS2448, puis erreurs de syntaxe TS1005/TS1128 corrigées par réécriture du hook, commit `b19c4bb`).
- **Cause réelle du blocage découverte en session 2** : `b19c4bb` n'avait jamais été poussé. Aucun code à corriger de plus.

## Session 2 — 18 septembre 2026 (après-midi) : déblocage déploiement, puis refonte interface

### 1. Diagnostic déploiement
- Le build Vercel tournait sur `16cac1d` (ancien), pas sur `b19c4bb` (local).
- Validation locale de la commande exacte de Vercel (`npm run build:all`) : exit 0, `app/dist` généré.
- Après push de l'utilisateur : **déploiement Vercel vert**.
- Fragilités notées : aucun lockfile versionné (`.gitignore` racine ignore `package-lock.json`), deux `vercel.json` (le racine est inerte).

### 2. Retour utilisateur : « injouable »
Reproches : trop lent ; pause/reprise mal faite ; pas de possession ; attaque/défense médiocres ; pas de défense 0-6 ; pas de but à l'écran. Conclusion assumée : **l'interface est à refaire**.

### 3. Refonte complète de l'interface
- `fieldRenderer.ts` : réécrit — géométrie importée du moteur (aucune duplication), zones 6/9/7 m, limite 4 m, cages derrière la ligne de but ouvertes vers l'extérieur, ballon, jetons numérotés (licite : cercles + texte uniquement).
- `Field.tsx` : canvas en mètres × échelle, zoom adaptatif, interpolation continue, clic converti en coordonnées terrain.
- `useMatchEngine.ts` : réécrit —
  - fenêtre de décision **uniquement quand Nangis a la balle** en mode Coach (suppression du compteur `actionCount % 2`, écart O-003 fermé côté code) ;
  - vitesses 1×/2×/4×/8× ; mode Coach/Auto ; « Laisser l'IA jouer » ;
  - actions du moteur : passes nommées, duel, fixation, croisé, course ;
  - **tirs paramétrés** via `shotType`/`shotSide`/`shotHeight` du moteur (appui, centre, opposée haute, lob, roucoulette) ;
  - **défense coach** : systèmes 6-0 / 1-5 / 1-2-3 / Hybride + temps mort via `changeSystem`/`callTimeout` ;
  - seed fixe 44512 affichée et rejouable (O-005 côté code).
- `HUD.tsx` : score, chrono + mi-temps, possession, tous les contrôles, seed.
- `App.tsx` : re-câblé.

### 4. Extension du moteur
- `court.ts` : géométrie complète (buts, zones 6 m arc + poteaux, 9 m coupé aux touches, 7 m, 4 m, zone de changement), symétrisée pour les deux camps.
- `formation.ts` : placement défensif par système, transition, pressing.
- `possession.ts` : `installPossession` (remises en jeu après but/arrêt/interception), `stepShapes` (replacement), `playAction` (une action = résolution + conséquence collective).
- `engine.ts`/`spatial.ts`/`match.ts`/`simulation.ts`/`index.ts` : cohérence avec le nouveau contrat.

### 5. Validation
- Moteur : **26/26 tests, exit 0**. Un test de géométrie corrigé (le test lui-même était impossible : il exigeait min et max inversés sur le but de Lagny).
- App : typecheck 0 erreur ; build production Vite OK (54 modules, ~186 kB JS, exit 0).
- Contrôle licite : cercles, numéros, texte ; aucune représentation animée ; aucune musique ; aucun pari.

### 6. Notes de session mises à jour
- `STATUS.md` : état réel du projet.
- `NOTES_POUR_NOUVELLE_CONV.md` : reprise de session (à lire en premier).
- Le présent fichier.

## Ce qui reste ouvert (pour la session suivante)

- Trajectoires visibles pendant la décision (Phase B du doc 16 pas 100 % fermée).
- Rapport de match causal (doc 11).
- Fermeture documentaire O-003/O-005 (docs/10) + décisions D-010/D-011 (docs/09).
- Phase C (20 parties, 100 seeds) puis Phase D (calibration chapitres 44-48).
- Exposer `mark`/`help` au coach pendant la possession adverse.
- Hygiène déploiement : versionner les lockfiles, supprimer le `vercel.json` racine inerte.
## Session 3 — 18 septembre 2026 (soir) : passe PILOTE-SIM — tir, duel, défense, espace

### 1. Mandat
Retour du coach : tirs trop risqués et sans distance, pas de variété (pas de tir en extension), aucune différence ailier/arrière/pivot, duel gagné qui ne bat personne, pas de dribble, défense sans réaction, pause décisionnelle unilatérale (on ne peut pas défendre quand l'adversaire choisit), croisé invisible et sans effet. Consigne : revenir aux documents fondateurs, section par section.

### 2. Balayage des documents fondateurs
- Relecture complète de `00` (anticipation gardien/bloc), `01` §4-5 (gestes, trajectoires) et §29-35 (tirs), `03` §1 (réponses défenseur), `05` (pauses, passe-et-va, croisés), `13` S44-01/S48-13, `14` phases A/C, `15`.
- Confrontation au code réel (`engine.ts`, `court.ts`, `formation.ts`, `possession.ts`) : cinq écarts nommés E-006 à E-010 dans `17`.

### 3. Extension moteur (D-011)
- **E-006 tir** : distance *effective* = axiale + pénalité d'angle (`shotContext`), 8 gestes (`SHOT_PROFILES`) avec bonus par poste, espace conquis (défenseur battu +12, ouverture +10), tirs proposés selon le poste.
- **E-007 duel/dribble** : duel gagné = défenseur battu (`beatenUntil` +6 s, recul, jamais presseur, ne conteste plus) ; `dribble` distinct (décale, ne bat personne).
- **E-008 défense** : `press`/`retreat`/`intercept` jouables et proposés (`defensiveIntents`).
- **E-009 pause** : `contestAction` systématique (IA, `playAction`, séquences) + fenêtre de contestation côté app : le coach choisit la réponse du défenseur le plus proche avant résolution.
- **E-010 croisé** : les deux coureurs échangent leurs couloirs (pas bornés 3,5 m), trajectoire tracée « tirer ou passer derrière ».

### 4. Consolidation (D-012) — 5 échecs de tests fermés
- Croisé : géométrie réelle (chacun vise le couloir actuel de l'autre, convergence sur l'axe x partagé).
- Aile : pénalité d'angle durcie (4 + 10·closeness) — l'aile proche sort de portée hors extension/roucoulette.
- Causes : `retreat conceded` et `run-up momentum faded` tracées sur le tir.
- `PendingContest` remontée au niveau module dans `useMatchEngine.ts` (déclarée dans le hook = erreur TS).

### 5. Validation
- Build moteur exit 0 ; **36/36 tests vitest** ; typecheck app 0 erreur.
- Décisions D-011 et D-012 inscrites dans `09`, suivi E-006→E-010 mis à jour dans `17`.
- Contrôle licite inchangé : ronds, numéros, texte, trajectoires ; aucune représentation animée.

### Leçon de session
5. Un lot d'édits étalé (croisé, causes, interface) doit être revalidé par la suite complète *avant* d'être déclaré clos : 5 échecs ont survécu au commit logique, fermés par une passe de consolidation dédiée (D-012).

## Session 4 — 18 septembre 2026 (soir) : passe PILOTE-SIM 2 — défense du coach, rythme, espace

### 1. Mandat
Retour du coach : en phase offensive, l'écran lui demande de choisir la défense **adverse** (inversion) ; quand Lagny a le ballon, l'attaque ne démarre pas sans cliquer « Laisser l'IA jouer » (pas de rythme) ; quand l'IA attaque, aucune option défensive pour le coach ; « j'ai plus de contrôle défensif sur l'équipe adverse que sur la mienne » ; les options défensives ignorent la proximité (options absurdes quand le ballon est dans la moitié Lagny) ; « le jeu n'imprime pas que le handball est un sport d'espace et d'intervalle ». Consigne permanente : push à chaque fin de session, remplir l'historique et les dossiers de session.

### 2. Audit (docs fondateurs)
- Espace/intervalle : memo architecte (« intervalles dynamiques, pas malus statiques »), doc 13 (intervalle attaqué et son état), doc 05 §5/§20-21/§103, doc 07 §2 (teinte discrète), doc 15 (profondeur/largeur/aide/dissuasion).
- Constat clé : `observeIntervals` (moteur) existait mais **n'était jamais consommé** — panneau avec « Intervalle 2-3 » codé en dur.
- Quatre écarts nommés E-011 à E-014 dans `17`.

### 3. Corrections (D-013)
- **E-011 contestation inversée** : la fenêtre ne s'ouvre que pour la défense de **Nangis** ; quand Lagny attaque dans la moitié Nangis, la boucle interpelle `contestAction` et propose la réponse du défenseur Nangis ; quand Nangis attaque, l'automate défend en silence (doc 05 §103).
- **E-012 rythme** : suppression de la pause forcée en début de possession adverse et du hack `actionCountRef = 1` ; Lagny joue en continu ; le coach défend par les fenêtres de contest et le clic défenseur (non bloquant) ; bouton « Accélérer avec l'IA » retiré du pied de page.
- **E-013 proximité** : `defensiveIntents` gagée par la distance (mark/help/intercept ≤ 6 m du porteur, press ≤ 4 m, repli seul au-delà) ; dock défensif et contestation désactivés hors moitié Nangis (porteur x ≤ 20).
- **E-014 espace visible** : vrais intervalles dans « ESPACES EXPLOITABLES » (ouvert/contestable), halos discrets sur le terrain (`OpenIntervalMarker`), descriptions de passes ancrées (« dans l'intervalle 2-3 »).

### 4. Validation
- Build moteur exit 0 ; **37/37 tests vitest** (nouveau test de proximité) ; typecheck app 0 erreur.
- D-013 inscrite dans `09`, suivi E-011→E-014 dans `17`. HISTORIQUE_SESSION et STATUS tenus.
- Limites assumées : la fenêtre de contestation attend le choix (pas d'auto-résolution au timeout) ; « SOLUTIONS DISPONIBLES » du panneau honnête mais pas encore calculée.

## Session 5 — 18 septembre 2026 (soir) : D-019, noyau volée V0 côté moteur

### 1. Décisions verrouillées

- **D-019** (`docs/09`) : la volée planifiée remplace la boucle D-018. Plans verrouillés en aveugle, simulation 3 à 5 s, fenêtre temporelle comme grandeur fondamentale, initiative = avantage temporel local (plus de +35/-30 global), jauges = observables jamais mécanismes, systèmes défensifs = initialisations du champ de contrôle, horloge FIFA (2 × 10 min par défaut, aucune vitesse x1/x2/x4, le temps n'avance que par volées).
- Spec complète `docs/19-spec-vollee.md` (10 sections) ; jalon V0→V4 ajouté dans `docs/08` §10 ; **O-013** ouverte (calibrage : durées, budget d'attention, conditionnels, rythme sur match complet) ; **O-011** tranchée (tracé pré-décision = éditeur de flèches de la volée) ; **O-012** périmée et remplacée par O-013.

### 2. Code moteur (session moteur seule, éditeur de flèches en session dédiée)

- `engine/src/volley.ts` (nouveau) : `resolveVolley` (tick 0,2 s, 5 s max, arrêt anticipé tir/but/interception), `validateVolleyPlan` (3 majeures + 2 mineures, 1 conditionnel max, passe/tir réservés au porteur), `chooseVolleyDefense` (doctrine compacte, jamais de lecture du plan offensif), `matchLengthSeconds` (1200 s par défaut), orderScale 1.35/0.7/1.0 calculé sur la fenêtre au moment de la collision, défenseur battu (`beatenUntil`) exclu du coulissement.
- `engine/src/spatial.ts` : `observeDynamicGaps` (paires de défenseurs adjacents réels, fenêtre = fermeture − accès) + `locomotionSpeed` (seule source de vérité des temps d'accès) ; `observeIntervals` statique inchangé.
- `engine/src/index.ts` : exports volley + gaps.
- `engine/src/volley.test.ts` (nouveau, **11/11 verts**) : horloge FIFA sans vitesses, gaps dynamiques, déterminisme à seed identique, horloge qui avance de la durée de la volée, passe qui transfère le ballon, duel né de la géométrie, fixation dont la réponse (pressBall) ouvre plus large qu'un bloc immobile, paire visée qui se resserre sous contain, tir qui termine la volée en avance, budget d'intentions, passe/tir hors porteur refusés.
- Le duel utilise `resolveAction` existant (tables, gardien par zones D-016, mémoire) : aucune règle réinventée.

### 3. Validation constatée

- `tsc --noEmit` : **0 erreur**.
- `vitest run src/volley.test.ts` : **11/11, exit 0**.
- Suite complète `engine.test.ts` : **43/47** — 4 échecs **préexistants à cette session**. PREUVE : `sum.txt`, `tj.json`, `test-out.txt` (session précédente, non touchés par ce commit) citent déjà les mêmes 4 intitulés avec les mêmes valeurs d'échec (2.6 strict assignment, bloc figé sans déplacement, relance `{x:21.5,y:10}` vs CENTRE, tir en portée). `git diff --stat` de ce commit liste exactement : docs 08/09/10/19, `index.ts`, `spatial.ts`, `volley.ts` + `volley.test.ts` nouveaux ; seul `spatial.ts`/`index.ts` touchés en existant, en ajouts purs (import type + nouvelles fonctions/exports). Quiconque rejoue la suite sans les fichiers `volée.*` reproduit les mêmes 4 échecs. Ces 4 échecs deviennent l'entrée de la prochaine consolidation moteur.
- `app/` non touché : l'ancienne boucle reste branchée et jouable, la volée reste moteur pur en attendant l'éditeur de flèches.

### 4. Prochaine étape proposée

Session dédiée éditeur de flèches `app/` : tracé des intentions sur canvas, plans verrouillés, relecture des gaps/fenêtres en direct, branchement `resolveVolley` à la place de l'ancienne boucle. Avant ou après : passe de consolidation des 4 échecs `engine.test.ts` préexistants.

## Session 6 — 18 septembre 2026 (nuit) : D-020, volee jouable V0 dans l interface

### 1. Demande joueur
- Pouvoir jouer la nouvelle interface et la refonte a la fin ; quand fini : commit, push, historique.

### 2. Code interface (ancienne boucle conservee mais non branchee)
- `app/src/main.tsx` branche `AppVolley` : HUD score + chrono + compteur de volees, Field, planificateur, journal causal, breches.
- `app/src/hooks/useVolleyEngine.ts` (nouveau, `useVolleyMatch`) : temps fige pendant le plan, `draftToPlan`, defense aveugle `chooseVolleyDefense`, `resolveVolley` puis remise en jeu terminale, horloge FIFA 2x10 min sans vitesses, budget 3+2 affiche, validation du plan montree.
- `app/src/components/VolleyPlanner.tsx` + CSS : 7 intentions (Attaquer, Fixer, Passer, Tirer, Placer, Couper, Etirer), cibles partenaires et defenseurs, verrouillage, IA qui propose.
- `app/src/components/AppVolley.tsx` + CSS : mise en page terrain + plan + journaux.
- `Field.tsx` : `onCourtClick` vise un point pour la derniere fleche ; `fieldRenderer.ts` trace `attackSpace/move/cut/stretch` en plus de run/cross.

### 3. Gouvernance et validation
- D-020 inscrite dans `docs/09`, suivi V0 dans `docs/17`.
- Preuves : `engine build` OK (`build-out.log`), `volley.test.ts` 11/11 OK (`volley-test.log`), `app build` OK 49 modules (`app-build2.log`), `vite dev` demarre sur `http://localhost:5173/` (`dev-volley.log`).
- Licite : VALIDE (ronds, fleches, zones, texte ; rien d anime ; pas de musique ; pas de pari).
- Reste a jouer : Yanis vers Aaron contre Mael, arret anticipe, journal causal en jeu ; puis V1 (pivot, ecrans, croises, renversement).


## Leçons de session

1. Un déploiement rouge n'implique pas un bug de code : vérifier d'abord `git log origin/main -1`.
2. Le retour utilisateur brutal (« injouable ») a plus de valeur qu'un statut optimiste : ne jamais déclarer « validé » sans preuve (doc 11).
3. L'interface doit consommer le moteur, jamais recoder : toutes les nouveautés (tirs, défenses, remises en jeu) existaient déjà côté moteur ou s'y ajoutent.
4. Terminal : une commande à la fois, redirection vers fichier temporaire, lecture du fichier.
5. Contrer un échec de test par comparatif factuel avant de toucher au code : ici `sum.txt`/`tj.json` prouvent les 4 échecs antérieurs à la session, le diff git prouve l'absence de régression.
6. Un test qui affirme le contraire du hand (fermeture globale d'un bloc qui coulisse) doit être reformulé en propriété locale mesurable, pas assoupli : la paire visée qui se resserre sous contain vaut mieux qu'une fenêtre max globale trompeuse.


## Session 7 - 19 septembre 2026 : D-021, refonte visuelle premium

### 1. Demande joueur
- Carte blanche dans le cadre licite ; doute sur la direction ; design juge laid, mockups fournis comme reference.

### 2. Diagnostic rendu
- La boucle volee (D-019/D-020) est conservee : elle est la bonne direction (chaine d avantages, lecture du jeu). Pas de troisieme refonte de gameplay.
- Le probleme etait la presentation. Refonte visuelle v2 : HUD score/chrono/possession avec blasons geometriques abstraits, terrain premium (pelouse a bandes, jetons a halo, cages a bandes rouge-blanc), rail droit (possession + energie/pression moteur, menaces avec distances reelles, breches, journal causal), dock d intentions en cartes avec VALIDER or.
- Absorption du travail orphelin non committe (UX clic du planificateur, session interrompue) apres validation : tsc 0 erreur, tests vol�e 11/11.

### 3. Validation constatee
- tsc app : 0 erreur. vite build : OK (49 modules). vitest volley.test.ts : 11/11. Suite engine : 4 echecs strictement identiques aux 4 preexistants documentes (strict assignment, bloc fige, relance, tir en portee) : aucune regression, aucun fichier moteur touche par la refonte visuelle.
- Licite : VALIDE (geometrie pure, aucun etre anime, aucune musique, aucun pari).

### 4. Reste
- Jouer un match complet dans le nouveau skin ; V1 volee (pivot, ecrans, croises) ; consolidation des 4 echecs moteur preexistants.


## Session 8 - 19 septembre 2026 : D-022 + D-023, jeu jouable et beau

### 1. Moteur repare (D-023)
- Ligne de defense a 6 m, un seul sort, coulissement lateral borne. Arret au contact des courses. Fin de volee naturelle au temps reel. Plan vide par defaut (le coach decide). 4 nouveaux tests de propriete, 15/15 volley verts, 0 regression (les 4 echecs preexistants restent identiques).

### 2. Experience complete (D-022)
- Ecran titre sobre. Vrai 7c7 au coup d'envoi (attaque 9 m, ligne 6-0 a 6 m, gardiens). Camera mi-terrain animee a la FIFA + toggle vue complete. Ralenti cinema sur fins decisives. Layout fixe 100vh sans chevauchement. Rapport de fin de match avec chronologie des evenements majeurs.

### 3. Validation
- tsc app 0 erreur ; vite build OK ; vitest volley 15/15 ; suite engine : 4 echecs strictement preexistants. Licite : VALIDE (geometrie pure, aucun etre anime, aucune musique, aucun pari).
