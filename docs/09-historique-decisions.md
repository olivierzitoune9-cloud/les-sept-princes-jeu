# 09 - Historique des decisions

Ce fichier trace les decisions qui structurent le projet. Une nouvelle decision ne remplace pas silencieusement une ancienne : elle ajoute une entree, une date et une raison.

## D-001 - Hierarchie des sources

- Date : 2026-09-17
- Statut : adoptee
- Decision : les sources de verite sont 00, 01, 03, 04 et 05. Le document 02 est exclu comme source de decision.
- Raison : eviter qu une analyse intermediaire contredise le corpus retenu.
- Impact : 06, 07 et 08 sont des contrats derives ; toute contradiction remonte aux cinq sources.

## D-002 - Match pilote

- Date : 2026-09-17
- Statut : adoptee
- Decision : le premier match est Nangis contre Lagny, chapitres 44 a 48.
- Raison : disposer d un cas riche pour calibrer les situations, sans transformer le roman en script.
- Impact : le moteur doit pouvoir produire un deroule proche ou different avec les memes regles.

## D-003 - Boucle de simulation

- Date : 2026-09-17
- Statut : adoptee
- Decision : le jeu alterne simulation, pause decisionnelle et reprise ; le tour est une situation, pas un joueur.
- Raison : conserver le rythme du handball et la profondeur d anticipation.
- Impact : l etat, les actions, l interface et les tests doivent etre construits autour des situations.

## D-004 - Representation

- Date : 2026-09-17
- Statut : adoptee
- Decision : terrain vu du dessus, cercles, numeros, ballon, trajectoires, zones et texte ; aucune representation animee.
- Raison : respecter le cadre licite et faire porter la profondeur sur la decision.
- Impact : aucune fonctionnalite ne peut dependre d un personnage, sprite ou avatar.

## D-005 - Premier jalon

- Date : 2026-09-17
- Statut : adoptee
- Decision : commencer par le jalon 0.1, une possession jouable et resolue avec explication.
- Raison : tester le coeur avant la memoire, le mental et les statistiques avancees.
- Impact : les couches ulterieures ne doivent pas etre simulees par des placeholders trompeurs.

## D-006 - Corpus du match importe

- Date : 2026-09-17
- Statut : adoptee
- Decision : les chapitres 44 a 48 du resume de la saison 2 sont disponibles et servent a produire les fiches 13 et le rapport 14.
- Raison : rendre les situations, adaptations et fins de match exploitables sans inventer une extraction a partir d un souvenir partiel.
- Impact : le modele doit couvrir le 1-2-3 hybride, le changement de cerveau d equipe, le jeu a 7, les gardiens decisionnels et les contre-adaptations.

## D-007 - Noyau TypeScript

- Date : 2026-09-17
- Statut : adoptee
- Decision : le premier code vit dans `engine/` et separe l etat, la resolution, le coaching, le hasard seed et les tests.
- Raison : tester les regles avant de les dupliquer dans une interface.
- Impact : l interface future consomme le journal et les situations du moteur ; elle ne recode pas les decisions.

## D-008 - Recherche handball externe

- Date : 2026-09-17
- Statut : adoptee
- Decision : toute regle de handball non specifique au roman doit etre recroisee avec les regles IHF et des ressources techniques federales ou EHF, en francais et dans les langues de reference utiles.
- Raison : la fidelite du jeu depend autant de la justesse du handball que de la fidelite au texte.
- Impact : le memo 15 devient la porte d entree de la recherche ; chaque nouvelle regle doit avoir une source, une distinction entre reglement et choix ludique, et un test.

## D-009 - Vertical slice avant extension du contenu

- Date : 2026-09-17
- Statut : adoptee
- Decision : construire et tester une vertical slice jouable avec les profils principaux avant d implementer tout le scenario et les autres personnages.
- Raison : valider le coeur tactique, l interface et la fidelite du handball avant de multiplier le contenu.
- Impact : le plan 16 devient le sequenceur de production ; les nouveaux personnages arrivent seulement apres validation des phases B et C.

## D-010 - Porteur mobile, elan du tir, deplacements bornes

- Date : 2026-09-18
- Statut : adoptee (passe MOTEUR conclue, doc 17)
- Decision : le porteur avance ballon en main par pas bornes de 3,5 m (`run`, `move`) ; la course construit un elan (`momentum`) qui alimente le tir en appui puis est consomme ; l elan retombe a chaque remise en jeu. Aucune action `cross`, `block`, `mark`, `help`, `move` ne teleporte : helper `stepToward`, 3,5 m max, la decision (assignation, pression) est immediate, seul le corps suit par trajectoire. Forme d attaque par roles : ailes larges, arrieres a 9 m, pivot appuye sur 6 m.
- Raison : fermer les ecarts E-002 (tir-des) et E-003 (teleportations) mesures contre doc 01 §4-5 et doc 05 terrain continu ; rendre E-001 exploitable (marquage strict suivi par trajectoire).
- Impact : `engine.ts` (`stepToward`, `run`, `move`, `shoot`, `defensiveIntents`), `possession.ts` (`installPossession`), `formation.ts` (ATTACK), `engine.test.ts` (3 tests). Aucun changement de perimetre hors moteur.

## D-011 - Tir a distance effective, duel qui bat, contestation defensive

- Date : 2026-09-18
- Statut : adoptee (mandat pilote-sim : tir, defense, espace)
- Decision : le tir utilise la distance effective de `court.ts` (`shotContext` : axial + penalite d'angle, l'aile paie son angle ferme) et 8 gestes (`jump`, `standing`, `extension`, `placed`, `power`, `lob`, `roucoulette`, `chabala`) avec bonus par poste ; le duel gagne bat le defenseur (`beatenUntil` +6 s, recul, pas de presse, decrochage ralenti dans `driftTeam`) ; le dribble decale sans battre ; toute action offensive duel/tir/dribble/passe traverse `contestAction` (defenseur non battu le plus proche : `press`/`contain`/`help`/`intercept`/`retreat`/`block-shot`/`none`) appliquee par l'IA, les sequences et `playAction`, et proposee au coach via la fenetre de contestation avant resolution ; `press`/`retreat`/`intercept` deviennent des decisions jouables ; le croise fait courir les deux partenaires vers les couloirs opposes.
- Raison : fermer les ecarts E-006 (tir-des sans distance ni poste), E-007 (duel qui ne bat pas, pas de dribble), E-008/E-009 (defense sans reponse, pause unilaterale), E-010 (croise invisible) mesures contre docs 00 (anticipation gardien/bloc), 01 §4-5 et §29-35 (gestes, trajectoires, tirs), 03 §1 (reponses defenseur + gardien), 05 (passe-et-va, croises, pauses), 13 S44-01/S48-13 et 14 phases A/C.
- Impact : `types.ts` (nouveaux `ActionType`, `beatenUntil`, `contestedBy`/`contestAction`, tirs etendus), `court.ts` (`shotAngle`, `shotContext`), `engine.ts` (`SHOT_PROFILES`, duel/dribble/tir contestes, `press`/`retreat`/`intercept`, `contestAction`, `defensiveIntents` etendus), `formation.ts` (battu decroche, jamais presseur), `possession.ts`/`sequence.ts`/`ai.ts` (contestation systematique), `goalkeeper.ts` (`ShotAttempt`), `engine.test.ts` (5 tests), `useMatchEngine.ts` (estimations alignees, tirs par poste, fenetre de contestation), `App.tsx` (barre de contestation), `ActionDock.tsx` (dribble + defense complete).

## D-012 - Consolidation pilote-sim : croise geometrique, angle aile durci, traces de repli

- Date : 2026-09-18
- Statut : adoptee (suite D-011, apres suite de tests verdee)
- Decision : le croise echange vraiment les couloirs (chaque coureur vise le couloir actuel de l'autre, convergence sur l'axe x partage, pas bornes 3,5 m) au lieu d'un miroir abstrait ; la penalite d'angle du tir passe de (3 + 9*closeness) a (4 + 10*closeness) pour rendre l'aile proche injouable hors extension/roucoulette ; le tir trace `retreat conceded` dans ses causes quand le defenseur a replie, et `run-up momentum faded` sur un echec malgre l'elan ; `PendingContest` deplacee au niveau module dans `useMatchEngine.ts` (elle etait declaree a l'interieur du hook, erreur de compilation).
- Raison : fiabiliser D-011 apres la suite vitest : 5 echecs (croise mono-coureur, aile encore a portee, causes de repli absentes, interface mal placee) fermes.
- Impact : `engine.ts` (geometrie du croise, causes du tir), `court.ts` (`shotContext`), `useMatchEngine.ts` (deplacement `PendingContest`), aucun changement de regle hors D-011.

Ajouter une entree avant toute modification de perimetre, de source, de regle de simulation ou de contrainte licite. Indiquer le document affecte et le test qui doit changer.
