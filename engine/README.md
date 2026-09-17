# Moteur des Sept Princes

Noyau TypeScript deterministe du jeu de handball tactique.

## Commandes

Depuis `engine/` :

- `npm.cmd run build` : compiler le moteur ;
- `npm.cmd run test` : executer les tests ;
- `npm.cmd run check` : compiler puis tester.

## Architecture

- `src/types.ts` : etat du match, joueurs, actions, situations et evenements ;
- `src/match.ts` : roster pilote Nangis-Lagny et factory seedee ;
- `src/random.ts` : generateur pseudo-aleatoire reproductible ;
- `src/ai.ts` : choix contextuel, raison et confiance de la decision ;
- `src/engine.ts` : situations et resolution passe, duel, tir et deplacement ;
- `src/coaching.ts` : systemes, temps morts, substitutions et jeu a 7 ;
- `src/simulation.ts` : possession complete, runner multi-possessions et rapport ;
- `src/engine.test.ts` : tests de reproductibilite et de comportement.

## Etat actuel

Le noyau couvre les fondations et une partie des couches avancees : journal causal, fatigue, pression, confiance, memoire de patterns, systemes defensifs, coaching, banc, jeu a 7, possessions completes et runner multi-possessions.

La prochaine extension doit ajouter la resolution de possession complete, les transitions, les fautes, la memoire contextuelle des habitudes et le rapport de match avant de construire l interface.

Les decisions et criteres de validation sont dans `../docs/09-historique-decisions.md`, `../docs/10-registre-decisions-ouvertes.md` et `../docs/11-protocole-validation.md`.
