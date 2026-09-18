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

## Suivi — passe MOTEUR 2026-09-18 (E-001/E-002/E-003, cote moteur)

- E-002 : le porteur avance ballon en main (`run` borne 3,5 m, `move` borne ballon suit), l elan alimente le tir en appui puis est consomme, cause `run-up momentum` tracee. Le commentaire « le porteur ne bouge jamais » est supprime de `possession.ts`, l elan retombe a la remise en jeu.
- E-003 : `cross` (miroir), `move`, `block`, `mark`, `help` ne teleportent plus — helper `stepToward`, pas max 3,5 m. La decision reste immediate (assignation, pression), seul le corps suit par trajectoire.
- E-001 : `defensiveIntents` expose mark/help au coach ; la fenetre defensive existe cote `app` (`openDecisionWindow`, onglet DEFENDRE).
- Test ajoute : `bounds every repositioning step instead of teleporting` (30 tests moteur au total).
- Reste : passe POSITIONNEMENT (formes par roles), passe RENDU (DA doc 04).