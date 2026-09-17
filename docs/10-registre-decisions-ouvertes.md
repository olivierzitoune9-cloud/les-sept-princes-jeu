# 10 - Registre des decisions ouvertes

Ce registre liste les questions qui peuvent etre tranchees pendant l implementation. Une question ouverte ne doit pas etre resolue implicitement dans le code.

## O-001 - Source complete du match

- Statut : resolue le 2026-09-17
- Question : le texte exploitable des chapitres 44 a 48 est-il disponible dans le workspace ou faut-il l importer ?
- Resolution : le fichier `les sept princes/Saison 2 résumé.md` est present ; les fiches 13 et le rapport 14 ont ete produits.
- Reserve : les scores et certains details de possession restent incertains quand le texte se contredit ou resume une sequence.

## O-002 - Echelle spatiale interne

- Statut : a trancher en 0.1
- Question : quelle representation numerique du terrain continu permet les zones et les distances sans imposer des cases ?
- Contrainte : conserver 40 par 20, les lignes et les intervalles tactiques.
- Test : le duel Yanis-Aaron-Mael doit distinguer position, distance et intervalle.

## O-003 - Granularite des pauses

- Statut : a tester en 0.1
- Question : quels evenements declenchent automatiquement une pause decisionnelle ?
- Contrainte : ne pas interrompre chaque micro-deplacement.
- Test : une possession calme avance, une situation significative expose une decision.

## O-004 - Information visible

- Statut : a tester en 0.1
- Question : quelles estimations montrer en mode normal et en mode expert ?
- Contrainte : ne pas donner une certitude numerique qui remplace la lecture du terrain.
- Test : le joueur comprend le risque d une passe sans voir toute la resolution.

## O-005 - Mode de resolution deterministe

- Statut : a trancher en fondations
- Question : comment combiner seed, contexte et variance sans rendre le resultat arbitraire ?
- Contrainte : une meme entree et une meme seed doivent produire le meme resultat.
- Test : replay reproductible et seeds differentes produisant des parties distinctes.

## O-006 - Definition de la faute

- Statut : a trancher en 0.2
- Question : quelles fautes sont indispensables au prototype et comment les expliquer ?
- Contrainte : ne pas ajouter une liste de regles sans impact sur la decision tactique.
- Test : une faute modifie possession, fatigue ou position de maniere lisible.

## Regle

Toute decision fermee doit etre ajoutee a `09-historique-decisions.md` avant d etre encodee comme invariant.
