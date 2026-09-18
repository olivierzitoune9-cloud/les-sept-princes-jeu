# 19 - Spec de la refonte : la volée planifiée

Date : 2026-09-18. Statut : spec active, fondée sur D-019. Sources : analyse joueur (session du 18/09), contre-analyse externe (Frozen Synapse / Frozen Cortex), doc système volée, docs 15, 18.

Formule directrice, au-dessus du code :

> Le joueur ne commande pas des joueurs pour réaliser des actions de handball. Il manipule l'espace et le temps pour créer des situations de handball.

## 1. Le cœur conceptuel

- L'atome du jeu n'est ni le duel ni le siège ni la jauge : c'est la chaîne d'avantages. Créer une menace, forcer la réponse, exploiter la réponse.
- Le décalage parfait (fixation ailier, arrière, demi, arrière, ailier qui reçoit avec une seconde d'avance) est le prototype mental du jeu.
- La grandeur fondamentale est temporelle : la fenêtre. Fenêtre = temps de fermeture défensive moins temps d'accès offensif. Une fissure de 2 m sans avance temporelle ne vaut rien.
- Le duel, le passement de bras, la feinte, le bloc, le renversement ne sont pas des mini-jeux : ce sont des manières de modifier la géométrie et le temps de réaction du bloc défensif.
- Le système défensif est un champ de contrôle, pas un type. Le 6-0, 5-1, 3-2-1, 2-4, homme sont des initialisations du champ. Test architectural : les mêmes commandes fonctionnent contre tous les systèmes, zéro `if (shape === '2-4')` dans la mécanique.

## 2. La boucle

Installation, puis :

Lecture (temps figé) → planification attaque + doctrine défense (verrouillage aveugle) → simulation 3 à 5 s → événements → nouvel état → volée suivante.

- Une volée fait 3 à 5 s de temps simulé, 6 s en transition (contre-attaque).
- Arrêt anticipé sur événement majeur : tir, but, perte de balle, interception, faute, sortie.
- Une possession typique : 5 à 9 volées ; construite : 8 à 12 ; exceptionnelle : 13 à 15.
- Fin de possession uniquement sur événement terminal (but, perte, arrêt, faute, sortie, passif). Le passif est une pression temporelle croissante, jamais un compteur artificiel.

## 3. Horloge de match (D-019)

- Pas de vitesses x1/x2/x4. Le temps de match n'avance que par volées ; la planification est hors temps de match.
- Durée configurable à la FIFA : nombre de minutes par mi-temps au choix. Défaut : deux mi-temps de 10 minutes simulées (soit 20 minutes de jeu simulé, au lieu des 60 réglementaires).
- Le temps réel d'une session dépend du rythme de planification du joueur, jamais d'un facteur de vitesse.

## 4. Grammaire d'intentions

Offensive (une flèche = une intention, le moteur interprète) :

- move (déplacement), attackSpace (attaque d'intervalle ou d'espace), fix (fixation), cut (course intérieure), screen (écran), support (soutien), stretch (étirement, largeur), pass (passe vers cible), shoot (tir).

Défensive :

- shift (coulisser vers le ballon), pressBall (pression porteur), help (aide), deny (fermer une ligne de passe), contain (contenir son vis-à-vis), hold (tenir la ligne).

Règles :

- 3 intentions majeures + 2 intentions mineures par volée (mineures : move, stretch, support).
- Au plus 1 ordre conditionnel par volée, déclencheurs simples : défenseur sort, aide arrive, fenêtre s'ouvre, ligne de passe fermée.
- Une flèche = une intention continue. Pas de trajectoire zigzag gratuite ; un changement de direction net est une intention spéciale (feinte, changement de course), V1.

## 5. Fenêtres et initiative (recast de D-018)

- Pour chaque paire de défenseurs adjacents : largeur, point, temps d'accès attaquant, temps de fermeture défenseur, fenêtre.
- Initiative = avantage temporel local. T_réaction = perception + décision + déplacement, dérivé des attributs (accélération, anticipation). Plus de +35 %/-30 % global.
- OrdreScale au moment de la collision géométrique : défenseur ferme avant l'arrivée (fenêtre négative) → poids défensif 1,35 ; attaquant arrive large (fenêtre positive) → poids défensif 0,7 ; serré → 1,0.
- Le duel naît de la géométrie (contact à moins de 2 m et trajectoire vers un intervalle), jamais d'un menu.

## 6. Jauges : observables, jamais mécanismes

Le moteur calcule des faits ; les jauges n'en sont que des résumés lisibles.

- Fixation : masse défensive engagée vers la menace (poids proximité-côté, engagement angulaire).
- Fissure : largeur et accessibilité des intervalles dynamiques (remplace les intervalles statiques 1-2/2-3 de `observeIntervals` pour la lecture).
- Déséquilibre : temps moyen de restauration des relations défensives (retard en secondes).
- Ardeur : coût locomoteur récent de la défense (coulissements, changements de direction, accélérations), fenêtre glissante 15 s.
- Fenêtre : durée restante d'exploitation de la meilleure opportunité. Affichée sur le terrain, format « FISSURE 3-2 : 1,8 m / 0,72 s », pas en tableur.

Interdits : jamais « Fissure 72 donc tir réussi ». Le tir résulte de la situation (position, angle, distance, vitesse d'arrivée, pression, gardien, temps disponible), avec la chaîne des causes tracée.

## 7. Défense et IA

- La défense planifie des doctrines, pas des réponses : compact, agressif, protecteur du pivot, piège, conservateur. Chaque doctrine optimise une fonction différente (fermer la fissure, limiter le déséquilibre, compacité).
- La défense choisit ce qu'elle concède : sortir sur le porteur ou protéger le pivot, presser ou rester, fermer le renversement ou accepter le tir lointain.
- L'IA défensive ne voit jamais les intentions offensives au verrouillage. Elle lit positions, tendances et mémoire. Elle se trompe de façon cohérente avec sa doctrine.
- Le moteur déterministe à seed : même état + mêmes plans + même seed = même volée. Rejouer une volée est exact.

## 8. Incertitude et lecture

- Le joueur voit des estimations, jamais la valeur exacte : « fermeture estimée ~0,6 à 0,8 s » (doc 05, modes normal/expert).
- Les lignes de passe sont visibles géométriquement (sûre, risquée, coupable), pas en pourcentages.

## 9. Roadmap

- V0 (sandbox preuve de noyau) : 6 + 6 + gardien, 6-0, intents move/attackSpace/fix/pass/shoot et shift/pressBall/help/deny/contain/hold, simulation à tick, verrouillage aveugle, gaps dynamiques et fenêtres calculées, arrêt anticipé, 1 conditionnel. Critères de sortie : (1) 100 possessions seedées où le joueur provoque volontairement une ouverture et le journal causal trace la chaîne ; (2) la défense ferme sans suivre bêtement le ballon ; (3) un pratiquant comprend après coup pourquoi l'intervalle s'est ouvert ou resté fermé. Si ces trois propriétés tiennent, le noyau est bon ; sinon aucune statistique ne sauvera le système.
- V1 : pivot (occupation, écran, ΔT d'écran), croisé, renversement, passement comme propriété de duel, feintes, doctrines défensives multiples, conditionnels porteur et pivot, Ardeur.
- V2 : 5-1, 3-2-1, 2-4, homme, changement de structure payant. Test architectural 6-0 contre 2-4.
- V4 : remplacements, temps morts, jeu à 7, mental, passif, rapport narratif, boss Lagny qui lit les tendances (mémoire déjà présente).
- Le match pilote Nangis-Lagny (docs 13, 14) reste le calibreur de fiction : dès que le sandbox tient, on rejoue les possessions 44-48.

## 10. Licite

Ronds numérotés, flèches, zones, texte. Aucune représentation d'être animé, aucun pourcentage trompeur affiché comme du réel, aucune musique imposée, aucun pari.

