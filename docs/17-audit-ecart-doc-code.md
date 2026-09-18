# 17 - Audit ecart doc-reference et implementation

Date : 2026-09-18. Retour utilisateur : le jeu n est pas jouable assez profondement (tir primitif, positionnement mauvais, defense impossible), la doc n est pas appliquee, le rendu visuel est sous le niveau attendu.

Ce document liste les ecarts mesures entre les cinq sources de verite (00, 01, 03, 04, 05) et le code reel (`engine/src`, `app/src`). Chaque ecart porte une reference doc, une reference code et un correctif.

## E-001 - Defense injouable (ecart majeur)

- Doc : 01 §3 (situations defensives a decider), 04 (marquage strict, dissuasion, aide, coulissement), fiches 13 phase B (Kael sur Yanis).
- Code : le moteur possede deja `mark` et `help` dans `types.ts` `ActionType` et les resout dans `resolveAction` (`engine.ts` lignes 274-306) avec causes causales. Mais `useMatchEngine.ts` ligne 275 annule la selection des que Lagny a la balle et `App.tsx` ligne 122 affiche un message passif « Defense de Nangis en place ». Aucune fenetre de decision defensive n existe.
- Consequence : le coach ne peut ni marquer, ni aider, ni presser pendant la possession adverse. La moitie du jeu documente est inaccessible.
- Correctif : fenetre de decision defensive pendant la possession Lagny (choisir le marqueur strict, l aide, la dissuasion), exposer les `ActionIntent` mark/help existants, IA de Lagny lisible en retour.

## E-002 - Tir sans mecanique (ecart majeur)

- Doc : 01 §4-5 (tir depend de l elan, du desequilibre, de la trajectoire choisie ; le porteur peut avancer, courir, changer de rythme), 03 (tirs parametres avec consequence de la preparation).
- Code : `possession.ts` line 36 commente explicitement « Le porteur du ballon ne bouge jamais ». Le tir est un jet instantane depuis une position statique (`engine.ts` lignes 308-320 : `shootingPower = shooting - distance*0.7 - pressure*0.3 + intention`).
- Consequence : aucun elan, aucune attaque d intervalle avant tir, aucune feinte de tir resolue. Le tir ressemble a un tirage de des.
- Correctif : deplacements porteur (avancer, diagonale, changement de rythme) qui modifient l equilibre et la distance de tir ; tir en appui seulement apres course ; gardien qui lit (deja present via `goalkeeperAdvantage`) rendu visible a la decision.

## E-003 - Positionnement statique (ecart majeur)

- Doc : 01 §3 (succession de situations vivantes), §5 (trajectoires formes droite, diagonale, courbe), 04 §§2+ (zones vivantes, intervalles dynamiques), 05 (terrain continu).
- Code : `possession.ts` `installPossession` applique `placeTeam` formes statiques ; `driftTeam` ramene l attaque vers une forme generique « attack » ; `cross` teleporte en symetrie `y = 20 - y` ; `mark`/`help`/`run` teleportent les positions.
- Consequence : les jetons sautent au lieu de se deplacer, les intervalles ne se creusent pas par le jeu.
- Correctif : trajectoires continues et courtisees pour tous les deplacements (interpolation deja presente cote rendu), formes attaque par roles (ailes hauts et larges, pivot appuye sur 6 m, arrieres a 9 m), coulissement defensif continu.

## E-004 - Rendu visuel sous le niveau documente

- Doc : 04 §§2-30 : fond sombre, terrain clair, lignes fines, ombres discretes, jetons circulaires elegants, typographie impeccable, hierarchie visuelle tres claire, 07 design system.
- Code : `fieldRenderer.ts` et `fieldConstants.ts` posent la base mais le rendu reste sous la direction artistique demandee.
- Correctif : passe de rendu complete dirigee par le doc 04 (palette sombre premium, jetons avec halos et etats, trajectoires elegantes apparaisssant seulement a la decision, moment fort discret).

## E-005 - Decision coach en defense de Nangis limitee au systeme

- Code : seuls `changeSystem` et `callTimeout` sont exposes. Le doc 05 et les fiches 13 demandent aussi marquage individuel, dissuasion et aide comme decisions coach.

## Plan de correction propose (4 passes subagents paralleles)

1. Passe MOTEUR : deplacements porteur + tir vivant + mark/help exploitables (E-001, E-002).
2. Passe POSITIONNEMENT : trajectoires continues, formes par roles (E-003).
3. Passe UI : fenetre de decision defensive + action dock en possession adverse (E-001).
4. Passe RENDU : direction artistique doc 04 (E-004).

Ordre impose : passe MOTEUR d abord, car UI et rendu en dependent. Validation : `npm.cmd run check` dans engine, 26 tests minimums maintenus, typecheck app zero erreur, puis test manuel des trois plaintes utilisateur (tir vivant, positionnement, defense jouable).

## Regle

Cet audit est un document de travail. Toute correction modifiant une regle structurante doit passer par 09 (decision) et 10 (registre) avant encodage.

## Suivi — passe MOTEUR 2026-09-18 (E-001/E-002/E-003, cote moteur) — CONCLUE

- E-002 : le porteur avance ballon en main (`run` borne 3,5 m, `move` borne ballon suit), l elan (`momentum`) alimente le tir en appui puis est consomme, cause `run-up momentum` tracee. L elan retombe a la remise en jeu (`installPossession`).
- E-003 : `cross` (miroir), `move`, `block`, `mark`, `help` ne teleportent plus — helper `stepToward`, pas max 3,5 m. La decision reste immediate (assignation, pression), seul le corps suit par trajectoire. Forme d attaque par roles (`formation.ts` ATTACK : ailes larges 1,5/18,5, arrieres a 9-10 m, pivot appuye a 6,8 m).
- E-001 : `defensiveIntents` expose mark/help au coach ; la fenetre defensive existe cote `app` (`openDecisionWindow`, onglet DEFENDRE).
- Tests : `bounds every repositioning step instead of teleporting` + `keeps a strict assignment alive while the block drifts` + `proposes coach defensive intents` (30 tests moteur au total).
- Reste (hors passe MOTEUR) : passe POSITIONNEMENT complementaire (transition), passe RENDU (DA doc 04 §§2-30). Aucune regle structurante nouvelle hors D-010.

## Suivi — passe PILOTE-SIM 2026-09-18 (tir, duel, dribble, defense, pause) — CODEE, A VALIDER

- E-006 tir : `shotContext` (distance + angle, `court.ts`), 8 gestes avec bonus par poste (`SHOT_PROFILES`), espace conquis (`beatenNearby` +12, ouverture +10 max), geste qui demande de l'espace penalise sous pression, reponse `block-shot`/`press`/`help`/`retreat`/`none` sur le tir. Tirs proposes par poste dans `getSituation` et `buildShotOptions`.
- E-007 duel/dribble/espace : duel gagne = `beatenUntil` +6 s, recul, pression +12 au battu, avancee laterale vers l'intervalle ; le battu ne presse plus (`formation.ts` : decrochage ralenti, jamais presseur) et ne conteste plus (`contestAction`) ; `dribble` distinct (decale, +15 elan, ne bat pas).
- E-008 defense : `press` (sortie +16 pression), `retreat` (repli, -8 pression), `intercept` (vol ou battu 5 s) jouables via `resolveAction` et proposes via `defensiveIntents`.
- E-009 pause : `contestAction` systematique (IA, `playAction`, `sequence`) + fenetre de contestation cote `app` (`pendingContest` : coach choisit `press`/`contain`/`help`/`retreat`/`block-shot`/`intercept`/`none` du defenseur le plus proche avant duel/tir/dribble/passe, ou laisse l'IA defendre).
- E-010 croise : les deux coureurs echange leurs couloirs — chacun vise le couloir actuel de l'autre en convergant sur l'axe x partage (pas bornes 3,5 m), trajectoire `cross` tracee avec label tirer-ou-passer-derriere.
- Consolidation D-012 : penalite d'angle durcie (4 + 10*closeness) — l'aile proche sort de portee hors extension/roucoulette ; causes `retreat conceded` et `run-up momentum faded` tracees sur le tir ; `PendingContest` remontee au niveau module (erreur TS fermee).
- Decision : D-011 puis D-012 adoptees dans `09`. Validation complete : build moteur OK, 36/36 tests vitest OK, typecheck app OK.

## Suivi — session volée jouable 2026-09-18 (éditeur de flèches V0) — CODEE, A TESTER EN JEU

- E-011 contestation inversee : `buildContest` ne proposait la fenetre que quand le defenseur etait Lagny — le coach defendait donc pour l'adversaire pendant sa propre attaque (contraire au doc 05 §103, incertitude sur les intentions adverses), et ne defendait jamais quand Lagny attaquait. Correctif (D-013) : la fenetre n'appartient qu'au camp du coach — quand Lagny attaque, la boucle de simulation interpelle `contestAction` et ouvre la fenetre du defenseur Nangis ; quand Nangis attaque, l'automate conteste en silence via `playAction`.
- E-012 pause forcee en debut de possession adverse : la boucle ouvrait une fenetre defensive a chaque possession Lagny (`actionCount === 0`), obligeant a cliquer « Laisser l'IA jouer » — contre le doc 05 §2-3 (pause uniquement sur situation significative, le joueur peut provoquer la pause). Correctif : suppression de la fenetre forcee et du hack `actionCountRef = 1` ; Lagny joue en continu ; le coach defend par les fenetres de contestation et par le clic sur un defenseur (dock defensif non bloquant).
- E-013 options defensives hors de proximite : `defensiveIntents` offrait marquage/aide/interception meme a 20 m du porteur (transition adverse dans la moitie Lagny). Correctif (moteur + interface) : consignes individuelles seulement a 6 m ou moins du porteur (presser a 4 m ou moins), repli seul au-dela ; la moitie de terrain a defendre (porteur x <= 20) gate dock defensif et fenetre de contestation. Le handball est un sport d'espace et d'intervalle (docs 01, 04, 05 §5, 13, 15 ; memo architecte : « intervalles dynamiques »).
- E-014 espace invisible : le panneau latéral affichait des intervalles codés en dur (« Intervalle 2-3 »), le memo spatial du moteur (`observeIntervals`) n'etait jamais consomme. Correctif : vrais intervalles dans « ESPACES EXPLOITABLES » (ouvert/contestable), halos discrets sur le terrain (doc 07 §2), descriptions de passes ancrees dans l'intervalle devant le receveur (doc 13 : intervalle attaque et son etat).
- Tests : nouveau test moteur `gates defensive intents by proximity to the holder` (loin = repli seul, pres = mark/help/intercept). Decision D-013 ajoutee a `09`.

## Suivi — session volee jouable 2026-09-18 (editeur de fleches V0) — CODEE, A TESTER EN JEU
- V0 sandbox jouable : `app/src/main.tsx` branche `AppVolley` (HUD score + chrono + compteur de volees, Field, planificateur, journal causal, breches).
- Nouveau `app/src/hooks/useVolleyEngine.ts` : `useVolleyMatch` (temps fige pendant le plan, `draftToPlan`, `chooseVolleyDefense` aveugle, `resolveVolley` puis remise en jeu terminale, horloge FIFA 2x10 min), budget 3 majeures + 2 mineures affiche, validation du plan montree.
- Nouveau `app/src/components/VolleyPlanner.tsx` + CSS : 7 intentions (Attaquer, Fixer, Passer, Tirer, Placer, Couper, Etirer), cibles partenaires et defenseurs, verrouillage et simulation, IA qui propose.
- `Field.tsx` : `onCourtClick` vise un point pour la derniere fleche ; `fieldRenderer.ts` trace aussi `attackSpace/move/cut/stretch`.
- Validation : `engine build` OK, `volley.test.ts` 11/11 OK (preuve `volley-test.log`), `app build` OK 49 modules (`app-build2.log`). Reste : jouer Yanis vers Aaron contre Mael, verifier arret anticipe et journal causal en jeu.