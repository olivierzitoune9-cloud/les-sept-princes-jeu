# 06 - Document fonctionnel

## Statut et sources

Ce document est le contrat fonctionnel de l implementation. Il transforme les decisions des documents de reference en exigences testables.

Sources faisant autorite :

- `00-discussion-ia-reference.md` : intention et profondeur tactique ;
- `01-vision-gameplay.md` : vision du jeu et inventaire des situations ;
- `03-prototype-jouable.md` : perimetre du premier prototype et joueurs ;
- `04-gameplay-design.md` : interactions et presentation du prototype ;
- `05-systeme-match.md` : temporalite, possession et resolution.

`02-analyse.md`, `07-design-system.md` et `08-plan-implementation.md` ne sont pas des sources de verite. En cas de divergence, les cinq documents ci-dessus prevalent et la divergence doit etre signalee avant le code.

## 1. Produit et limites

Le produit est un jeu de handball tactique, abstrait et 100 pour cent licite. Le match pilote est Nangis contre Lagny, sur la matiere des chapitres 44 a 48. Le manga sert de reference de calibration. Il ne fournit jamais un deroule scripted du match.

Le prototype represente uniquement :

- un terrain vu du dessus ;
- des cercles, numeros, trajectoires, zones et indicateurs ;
- un match de handball 6 contre 6 plus gardien ;
- des pauses decisionnelles dans une simulation continue ;
- des decisions offensives, defensives et de coaching ;
- une resolution expliquee et non scripted.

Interdits non negociables : representation d etres animes, representation d ame, shirk ou polytheisme, musique imposee, pari, lootbox et presentation humanoide des joueurs.

## 2. Boucle de jeu

La boucle observable est :

1. etat du match ;
2. situation et informations accessibles ;
3. intention du joueur ou de l IA ;
4. decision adverse ;
5. resolution ;
6. consequence spatiale, physique et mentale ;
7. mise a jour de la memoire et des tendances ;
8. nouvelle situation.

Le tour n est pas le tour d un joueur. C est l apparition d une situation tactique dans laquelle le joueur peut intervenir.

Le temps fonctionne ainsi : simulation en vitesse normale, simulation acceleree pour les phases calmes, puis pause decisionnelle lorsqu une situation significative apparait. Le joueur peut provoquer la pause.

## 3. Etat du match

Le moteur doit conserver au minimum :

- equipes, compositions, joueurs sur le terrain et banc ;
- score, periode, chronometre et possession ;
- position continue des joueurs et du ballon ;
- systeme offensif et defensif actif ;
- fatigue, pression et etats temporaires ;
- historique recent des actions, duels, tirs, pertes et fautes ;
- memoire des patterns et niveau de confiance des hypotheses ;
- temps morts et changements disponibles.

Le match dure 60 minutes simulees en deux mi-temps. La victoire revient a l equipe qui a le plus de buts au terme du temps reglementaire.

## 4. Possession et situations

Une possession peut traverser ces phases : recuperation, transition, installation, construction, creation d un decalage, occasion, tir ou perte ou faute, puis transition adverse. Le moteur peut sortir de cette sequence si la situation l exige.

Une situation contient au minimum :

- le porteur et les joueurs disponibles ;
- les positions, vitesses, orientations et distances utiles ;
- les intervalles et lignes de passe ouverts ou fermes ;
- les defenseurs engages, les aides possibles et les zones abandonnees ;
- les intentions connues ou estimees ;
- les options d action compatibles avec cet etat.

## 5. Actions et resolution

Les primitives sont : passer, tirer, dribbler, defier, fixer, feinter, courir, croiser, bloquer, couper, attendre, reculer, presser, marquer, aider, intercepter, changer, temporiser, contre-attaquer, revenir, demander un temps mort, remplacer et changer de systeme.

Toute action est decrite par : acteur, intention, cible joueur ou zone, execution, style, timing et conditions d interruption. Le timing peut etre immediat, retarde, apres une passe, apres un bloc, apres une fixation ou apres un deplacement.

Le resultat depend de la situation, des aptitudes, de la fatigue, de la pression, du contexte defensif, de l historique et de la decision adverse. Une note globale ne peut pas resoudre seule une action.

Les combinaisons sont composees de primitives et peuvent bifurquer. Elles ne sont jamais des cinematics ni des boutons qui garantissent un resultat.

## 6. Attaque

Le jeu doit permettre :

- passe directe, rapide, longue, courte, dans la course, cachee ou lobee ;
- reception statique, en mouvement, sous pression, remise ou tir immediat ;
- course directe, diagonale, courbe, croisee, appel et faux appel ;
- fixation d un ou plusieurs defenseurs ;
- duel interieur ou exterieur, feinte, acceleration, protection et sortie ;
- bloc statique, dynamique, interieur, exterieur ou retarde ;
- croise, passe-et-va, circulation, entree ou sortie du pivot ;
- jeu a un pivot, deux pivots, faux pivot et permutations de postes ;
- attaque placee, attaque rapide, jeu autour du demi, de l arriere, de l aile ou du pivot ;
- tirs en appui, en suspension, a 6 m, a 9 m, d aile, de pivot, puissants, places, lob, roucoulette ou chabala, selon les aptitudes disponibles.

Le joueur sans ballon est une decision complete : courir, couper, croiser, bloquer, attirer, liberer, entrer, sortir, se demarquer, attendre ou revenir.

## 7. Defense et gardien

Les systemes de reference sont 6-0 compacte, 1-5 avec pointe haute et 1-2-3 agressive ou hybride. Chaque systeme expose forces, faiblesses, cout physique et conditions de changement.

Les ordres defensifs comprennent marquage normal, strict, a distance, dissuasion, sortie, aide, coulissement, changement, interception, fermeture de ligne et repli. Une aide doit montrer la zone qu elle abandonne.

Les comportements conditionnels sont autorises : si Yanis recoit, Kael sort ; si Malone recoit, Elian le prend. Ils doivent etre evaluables, interrompus par l etat courant et jamais lies a une minute fixe.

Le gardien est un acteur decisionnel. Il choisit position sur la ligne ou avancee, angle, premier ou deuxieme poteau, haut ou bas, sortie, attente, anticipation ou reponse tardive. Le tir est resolu comme un duel tireur-gardien qui tient compte des habitudes et de la memoire.

## 8. Joueurs et etats

Le modele distingue au moins :

- physique : puissance, vitesse, acceleration, explosivite, endurance, resistance, agilite, equilibre, detente ;
- technique : tir, passe, vision, dribble, controle, reception, feinte, duel, bloc et defense ;
- tactique : lecture, anticipation, decision, placement, adaptation et reconnaissance des patterns ;
- mental : confiance, concentration, sang-froid, creativite, discipline, agressivite et reaction a la pression.

Les equipes possedent cohesion, discipline, adaptabilite, communication, comprehension du systeme et connaissance de l adversaire. Les relations et synergies modifient les solutions possibles, pas uniquement les chiffres.

La fatigue physique et cognitive sont distinctes. Les etats temporaires incluent au minimum confiance, pression, concentration, blessure legere et forme du moment.

## 9. Memoire, adaptation et IA

La memoire conserve les actions recentes, les joueurs cibles, les duels, les schemas repetes et les faux patterns. Elle oublie progressivement.

L IA observe, teste, formule une hypothese, agit, mesure le resultat puis adapte sa priorite. Une hypothese porte un niveau de confiance, par exemple "Aaron cherchera Erwan" avec une confiance donnee. L IA ne doit pas disposer d informations parfaites que le joueur ne peut pas obtenir dans la situation.

## 10. Composition pilote

Nangis : Pierre, Erwan, Yanis, Aaron, Elian, Edgar, Liam ; remplacants Leo et Ilyes.

Lagny : Malone, Mael, Kael, Elio, Neo, Karim, Teddy ; remplacants Layo et Rio.

Les roles exacts et les valeurs initiales viennent des fiches de reference du prototype. Aucun joueur ne doit etre cree pour forcer une scene du manga.

## 11. Coaching et fin de match

Le coach peut changer de systeme, remplacer, demander un temps mort, modifier le rythme et definir des priorites. Les changements resultent de conditions observables : fatigue, rendement, pression, match-up, discipline et decision du coach. Jamais de regle du type "a la 22e minute, Yanis sort".

La fin de match produit un rapport explicatif : score, possessions, efficacite par zone et par systeme, duels importants, joueurs cibles, adaptations et causes des sequences decisives. Le rapport explique le comment, pas seulement le score.

## 12. Criteres fonctionnels de sortie

Le prototype est fonctionnel lorsque :

1. une possession complete peut etre jouee et resolue sans script ;
2. chaque resolution importante expose une cause lisible ;
3. Nangis ou Lagny peut gagner avec les memes regles ;
4. les systemes, la fatigue, le gardien et les aides changent les resultats ;
5. une combinaison peut etre interrompue et bifurquer ;
6. plusieurs parties produisent des deroules differents ;
7. une sequence proche du manga peut emerger sans etre imposee ;
8. le rapport final permet de reconstruire les raisons du resultat.
