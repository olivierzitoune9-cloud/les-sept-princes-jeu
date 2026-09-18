# 08 - Plan d implementation

## Statut et methode

Ce plan organise la construction du prototype a partir des contrats 00, 01, 03, 04 et 05. Il ne transforme pas les possibilites du corpus en exigences simultanees. Chaque version doit etre jouable, observable et testable avant la suivante.

Principe : construire d abord la boucle de situation, puis ajouter les couches qui enrichissent sa lecture. Aucun polish ne doit masquer une resolution incomprehensible.

## 1. Fondations communes

Avant le premier jalon de gameplay :

- creer un modele deterministe avec seed ;
- separer simulation, etat, resolution, interface et rapport ;
- donner un identifiant a chaque action et situation ;
- enregistrer les evenements sans les confondre avec les effets visuels ;
- rendre la vitesse, la pause et la reprise testables ;
- conserver un journal exploitable pour expliquer chaque resolution.

La seed permet de reproduire une partie, tandis que des seeds differentes permettent de mesurer la diversite des deroules.

## 2. Jalon 0.1 - boucle minimale jouable

Implementer : terrain, positions continues, jetons abstraits, ballon, possession, deplacement, passe, reception, duel, fixation, tir, marquage, sortie, aide, interception, gardien, score, chrono et possession.

Scenario de fumee : ballon a Yanis, passe a Aaron, duel interieur contre Mael, resolution expliquee, nouvelle situation. Ce scenario doit etre jouable mais ne doit pas etre impose dans une partie complete.

Sortie attendue : une possession peut naitre, changer de situation et se terminer par tir, perte, faute ou recuperation adverse.

Tests : possession coherente, ballon jamais duplique, cible valide, pause sans perte d etat, seed reproductible, resolution identique a entree identique.

## 3. Jalon 0.2 - structure du handball

Ajouter blocs, croisements, feintes, courses sans ballon, pivot, rythme, systemes 6-0, 1-5 et 1-2-3, transitions, fatigue, remplacements et temps morts.

Sortie attendue : le changement de systeme modifie les espaces, les aides, le cout physique et les options ; un remplacement modifie effectivement la solution collective.

Tests : aide avec zone abandonnee, bloc trop tot ou trop tard, transition offensive et defensive, gardien avance ou sur ligne, fatigue qui change les decisions, temps mort qui change les priorites.

## 4. Jalon 0.3 - memoire et adaptation

Ajouter historique recent, oubli progressif, patterns, faux patterns, hypotheses de l IA, contre-adaptation, coaching conditionnel, jeu a sept et deux pivots.

Sortie attendue : une repetition peut etre detectee, exploitee ou volontairement utilisee comme leurre. L IA ne connait pas automatiquement la bonne reponse.

Tests : trois repetitions puis variation, mauvaise hypothese punitive, adaptation progressive, risque reel du but vide, comportement distinct selon la memoire disponible.

## 5. Jalon 0.4 - profondeur des joueurs

Ajouter mental, confiance, sang-froid, concentration, resilience, relations, synergies, leadership, personnalite, scouting et statistiques avancees.

Les statistiques avancees doivent inclure au minimum efficacite par systeme et par zone, valeur des fixations, deplacements sans ballon, duels et actions invisibles qui liberent un partenaire.

Sortie attendue : deux joueurs ayant une note globale voisine ne produisent pas les memes solutions, et une synergie change le collectif sans annuler les decisions du joueur.

## 6. Jalon 1.0 - match pilote complet

Assembler les joueurs de Nangis et Lagny, les bancs, les gardiens, les systemes, la simulation de 60 minutes, les pauses decisionnelles, le coaching, le rapport final et l interface complete.

Le moteur doit connaitre les regles et les profils, mais pas le deroule des chapitres 44 a 48. Le match de reference doit parfois emerger et parfois diverger.

## 7. Validation par partie

Pour chaque jalon, lancer au minimum :

1. une partie avec Nangis controle ;
2. une partie avec Lagny controle ;
3. une partie avec chaque equipe controlee par l IA ;
4. plusieurs seeds identiques pour la reproductibilite ;
5. plusieurs seeds differentes pour la diversite.

Verifier :

- chaque equipe peut gagner ;
- les memes tactiques ne sont pas invincibles ;
- les joueurs ont des identites visibles ;
- fatigue, gardiens, aides et systemes changent les resultats ;
- les combinaisons bifurquent face a une reaction ;
- le rapport explique les moments decisifs ;
- aucune sequence n est liee a une minute fixe ;
- les contraintes licites et visuelles sont respectees.

## 8. Rapport de validation

Chaque partie de validation conserve : seed, version, reglages, score, possessions, chronologie d actions, systemes, temps morts, remplacements, efficacite par zone, duels Aaron-Mael, actions Yanis-Aaron, gardien, fatigue, patterns et adaptations.

Le rapport doit distinguer :

- ce qui est arrive ;
- ce que le moteur estimait ;
- pourquoi la resolution a eu lieu ;
- quelle decision a modifie la suite.

## 9. Definition de pret a implementer

Les documents sont prets lorsque le code peut commencer sans inventer de regle structurante : les invariants sont connus, les variantes sont ordonnees, les interdits sont explicites et chaque jalon possede un test de sortie.

La version 0.1 est le premier objectif d implementation. Les idees des jalons 0.3, 0.4 et 1.0 restent dans le plan et ne doivent pas etre simulees par des placeholders trompeurs.

## 10. Refonte volée (D-019, 2026-09-18)

Le format D-018 (manches 1c1 à la Pokemon) est remplacé par la volée planifiée (spec 19). Jalons remplacés en conséquence :

- V0 : sandbox preuve de noyau (6-0, intents spatiaux, gaps dynamiques, fenêtres, verrouillage aveugle, 100 possessions seedées, 3 propriétés de sortie).
- V1 : pivot, écran, croisé, renversement, ruses comme propriétés de duel, doctrines défensives.
- V2 : autres systèmes défensifs comme initialisations du champ de contrôle, test architectural 6-0 contre 2-4.
- V4 : match complet (remplacements, temps morts, jeu à 7, mental, passif, rapport), calibré sur Nangis-Lagny.

Horloge : pas de vitesses x1/x2/x4 ; durée configurable à la FIFA, défaut 2 fois 10 minutes simulées.

