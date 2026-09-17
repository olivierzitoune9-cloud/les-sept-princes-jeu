# 11 - Protocole de validation

## But

Verifier que le moteur produit des situations de handball comprenables, non scriptes et reproductibles. Une fonctionnalite n est pas terminee parce qu elle fonctionne une fois : elle doit expliquer son resultat et survivre a plusieurs seeds.

## Gate 0 - avant le code

- les sources 00, 01, 03, 04 et 05 sont identifiees ;
- 02 n est pas utilise comme source normative ;
- les contraintes licites sont relues ;
- les decisions ouvertes pertinentes sont listees ;
- le jalon et son critere de sortie sont connus.

## Gate 1 - fondations

Verifier :

- seed enregistree et replay reproductible ;
- etat de match serialisable ;
- positions, ballon et possession coherents ;
- pause et reprise sans perte d etat ;
- chaque action porte acteur, intention, cible, timing et resultat ;
- chaque resultat important conserve une cause.

## Gate 2 - possession 0.1

Executer le scenario : Yanis recoit, passe a Aaron, Aaron attaque l interieur contre Mael.

Verifier au minimum :

- passe possible et reception valide ;
- duel dependant de la position, de l aide, de la fatigue et de l intention ;
- gardien present sur une conclusion de tir ;
- perte, faute ou tir produisent une nouvelle situation ;
- la resolution explique ce qui a fait la difference.

## Gate 3 - diversite

Lancer au minimum cinq seeds avec les memes reglages. Verifier que :

- Nangis et Lagny peuvent gagner ;
- les memes intentions ne garantissent pas le meme deroule ;
- les profils de joueurs produisent des comportements differents ;
- une reaction defensive peut interrompre une combinaison ;
- aucune action n est liee a une minute fixe.

## Gate 4 - licite et interface

Verifier :

- cercles, numeros, ballon, trajectoires, zones et texte uniquement ;
- aucune representation animee, d ame, de magie ou de shirk ;
- musique absente ou desactivable immediatement ;
- aucune mise, lootbox ou recompense aleatoire commerciale ;
- les informations ne dependent pas de la couleur seule ;
- pause clavier et controles lisibles.

## Rapport minimal

Conserver pour chaque run : version, seed, reglages, score, chronologie des actions, possessions, systemes, remplacements, temps morts, tirs, duels, fatigue, patterns, adaptations et causes des moments decisifs.

Le rapport doit distinguer ce qui est arrive, ce que le moteur estimait, pourquoi la resolution a eu lieu et quelle decision a modifie la suite.

## Verdicts

- VALIDE : tous les controles du gate sont passes ;
- VALIDE AVEC RESERVE : le gate est exploitable mais une decision ouverte reste explicitement documentee ;
- BLOQUE : une contrainte licite, une invariance ou un critere de sortie est viole.
