# VISION GAMEPLAY — JEU DE HANDBALL TACTIQUE (à conserver précisément)

1. Idée fondamentale
Le jeu cherche à reproduire ce qui rend le handball passionnant sur le plan stratégique :
lire une situation, prendre une décision, provoquer une réaction adverse, exploiter cette réaction, puis s'adapter à la nouvelle situation.
L'objectif n'est donc pas de créer un jeu où le joueur choisit simplement :
« Tir » / « Passe » / « Dribble ».
Le joueur doit progressivement construire et exploiter des situations de jeu.
Une attaque pourrait par exemple évoluer ainsi :
Demi-centre → fixation → déplacement d'un arrière → croisé → réaction défensive → nouveau déplacement → bloc → duel → aide défensive → passe → nouveau duel → tir.
Chaque étape peut modifier la situation suivante.
Le jeu doit donc donner l'impression que le terrain est un problème stratégique vivant.

2. Interface générale
L'interface peut s'inspirer de Football Manager Mobile :
terrain vu du dessus ;
joueurs représentés par des marqueurs abstraits ;
ballon représenté par un marqueur ;
déplacements représentés par des trajectoires ;
zones de défense visibles ;
informations tactiques accessibles par l'interface ;
aucune nécessité de représenter physiquement les personnages.
Les joueurs peuvent être identifiés par :
numéro ;
initiales ;
symbole ;
couleur d'équipe ;
rôle ;
éventuellement une petite icône indiquant leur état.
L'objectif est que la profondeur du jeu ne dépende pas de la représentation graphique des personnages.

3. Le jeu doit être pensé autour de situations
Une possession n'est pas une animation prédéterminée.
Elle est une succession de situations.
Exemple :
Situation A
Yanis possède le ballon.
La défense est organisée en 6-0.
Kaël est légèrement avancé.
Le joueur doit décider :
conserver ;
transmettre ;
fixer ;
attaquer un intervalle ;
demander un croisé ;
provoquer Kaël ;
jouer avec le pivot ;
renverser ;
préparer une combinaison.
La décision produit une nouvelle situation.
Situation B
Yanis attaque.
Kaël sort.
Le joueur doit alors choisir :
continuer ;
passer au joueur libéré ;
utiliser le pivot ;
provoquer une aide ;
renverser ;
interrompre l'action.
Le système continue ainsi jusqu'à la conclusion de la possession.

4. Le porteur du ballon
Le porteur doit avoir de très nombreuses possibilités.
Déplacements
avancer ;
reculer ;
rester sur place ;
latéral ;
diagonal ;
intérieur ;
extérieur ;
course courbe ;
course directe ;
changement de direction ;
changement de rythme ;
arrêt ;
reprise d'élan.
Actions individuelles
dribble ;
passage de bras ;
feinte de corps ;
feinte de tir ;
changement de direction ;
accélération ;
débordement ;
attaque d'intervalle ;
tir ;
passe.
Intentions
Une même action peut avoir des intentions différentes.
Exemple :
Fixer
peut vouloir dire :
attirer son défenseur ;
attirer une aide ;
préparer une passe ;
créer un espace pour un partenaire ;
provoquer une faute ;
préparer un tir.

5. Les trajectoires
Les trajectoires constituent une mécanique majeure.
Le joueur peut choisir :
Forme
droite ;
diagonale ;
courbe ;
arrondie ;
brisée ;
croisée.
Direction
intérieur ;
extérieur ;
gauche ;
droite.
Point de départ
position actuelle ;
position légèrement décalée ;
position reculée ;
position avancée.
Point d'arrivée
intervalle 1-2 ;
intervalle 2-3 ;
extérieur ;
centre ;
zone de pivot ;
aile.
Timing
Une course peut commencer :
immédiatement ;
après une passe ;
pendant la fixation ;
lorsque le défenseur sort ;
lorsque le partenaire reçoit ;
après le croisé.
Le timing est essentiel.
Une excellente course au mauvais moment peut devenir une mauvaise course.

6. Les intervalles
Les espaces entre défenseurs doivent être simulés.
Exemples :
1–2 ;
2–3 ;
3–2 ;
2–1 ;
espace extérieur ;
espace intérieur ;
espace derrière le défenseur ;
espace créé par une sortie défensive.
L'espace doit évoluer dynamiquement.
Exemple :
Aaron se rapproche d'un défenseur.
Le défenseur coulisse.
L'espace entre ce défenseur et son partenaire diminue.
Mais un autre espace peut apparaître ailleurs.
Ainsi :
les espaces sont créés par les mouvements des joueurs.

7. La fixation
La fixation doit être une véritable mécanique.
Le porteur peut :
fixer un joueur ;
fixer deux joueurs ;
fixer un défenseur puis ressortir ;
fixer puis tirer ;
fixer puis transmettre ;
fixer pour libérer l'ailier ;
fixer pour libérer l'arrière ;
fixer pour libérer le pivot.
Le défenseur doit lui aussi choisir :
rester ;
sortir ;
coulisser ;
aider ;
changer de joueur ;
fermer l'intervalle.

8. Le duel individuel
Le duel doit être une interaction et non un simple calcul de statistiques.
Attaquant
Il peut :
accélérer ;
ralentir ;
feinter ;
passer de bras ;
changer de direction ;
déborder ;
rentrer intérieur ;
sortir extérieur ;
provoquer le contact ;
tirer ;
passer.
Défenseur
Il peut :
accompagner ;
anticiper ;
fermer ;
sortir ;
rester en retrait ;
provoquer une faute ;
prendre le bras ;
chercher le contre ;
demander de l'aide.

9. Le duel doit dépendre du contexte
Un joueur très fort physiquement ne doit pas automatiquement gagner.
Le résultat dépend notamment de :
vitesse ;
accélération ;
position ;
élan ;
distance ;
fatigue ;
technique ;
anticipation ;
espace ;
défenseur disponible ;
aide défensive ;
confiance ;
situation du match.
Ainsi Aaron peut être extrêmement difficile à arrêter dans une situation donnée, mais vulnérable dans une autre.

10. Les passes
Les passes doivent être différenciées.
Type
passe classique ;
passe rapide ;
passe longue ;
passe courte ;
passe dans la course ;
passe cachée ;
passe lobée ;
passe au pivot ;
passe vers l'aile ;
passe arrière.
Placement
La passe peut être :
devant le joueur ;
derrière ;
sur le côté ;
dans son espace de course ;
dans une zone dangereuse ;
dans une zone sécurisée.
Risque
Une passe difficile peut :
accélérer le jeu ;
créer une occasion ;
provoquer une interception ;
ralentir l'attaque ;
faire perdre la possession.

11. Les passes peuvent dépendre du déplacement du receveur
Exemple :
Erwan commence une course.
Aaron doit choisir :
maintenant ?
dans une seconde ?
devant lui ?
derrière lui ?
Une passe parfaitement synchronisée peut transformer une situation banale en occasion de tir.
Une passe trop tôt ou trop tard peut la détruire.

12. Les combinaisons
Les combinaisons ne doivent pas être uniquement des boutons prédéfinis.
On peut néanmoins avoir des combinaisons préparées.
Exemples :
croisé ;
double croisé ;
bloc ;
bloc + sortie ;
passe et va ;
entrée du pivot ;
sortie du pivot ;
circulation arrière ;
permutation.
Mais surtout :
une combinaison peut être interrompue et transformée.
Exemple :
Croisé Aaron/Erwan.
La défense anticipe.
Le joueur peut abandonner le croisé et :
ressortir ;
jouer le pivot ;
renverser ;
attaquer l'autre intervalle ;
changer de côté.

13. Le jeu sans ballon
C'est un point fondamental.
Un joueur sans ballon peut :
courir ;
couper ;
croiser ;
bloquer ;
attirer un défenseur ;
libérer un partenaire ;
entrer en pivot ;
sortir du pivot ;
changer de poste ;
se démarquer.
Un joueur peut donc être utile sans jamais toucher le ballon.

14. Les blocs
Les blocs doivent être détaillés.
Type
bloc statique ;
bloc dynamique ;
bloc intérieur ;
bloc extérieur ;
bloc sur défenseur ;
bloc pour libérer un arrière ;
bloc pour libérer un demi.
Timing
Le bloc peut être :
trop tôt ;
parfait ;
trop tard.
Réaction défensive
La défense peut :
passer derrière ;
passer devant ;
changer ;
contourner ;
aider ;
anticiper.

15. Le pivot
Le pivot doit avoir une importance énorme.
Il peut :
bloquer ;
se placer ;
recevoir ;
se retourner ;
fixer ;
remettre ;
provoquer une faute ;
attirer deux défenseurs ;
libérer un espace.
Le jeu doit permettre :
1 pivot → 2 pivots → entrée/sortie du pivot → faux pivot → joueur arrière qui devient pivot.

16. Les systèmes offensifs
Le joueur peut construire des architectures.
Exemples :
jeu classique ;
jeu avec deux arrières dominants ;
jeu autour du demi ;
jeu autour du pivot ;
jeu avec ailier comme finisseur ;
jeu à deux pivots ;
jeu à sept ;
attaque rapide ;
attaque placée.
Mais aucune architecture ne doit être totalement rigide.

17. Les permutations
Les postes ne sont pas fixes.
Exemples :
arrière → demi ;
demi → arrière ;
arrière → pivot ;
ailier → arrière ;
pivot → arrière ;
gardien supplémentaire → arrière.
Le système doit permettre aux joueurs de changer de rôle au cours d'une possession.

18. Le marquage strict
Le marquage strict doit être extrêmement important.
On peut choisir :
joueur ciblé ;
défenseur chargé de le suivre ;
zone de déclenchement ;
intensité ;
durée.
Mais le marquage strict crée un coût.
Si Kaël prend Yanis en strict :
Yanis est neutralisé.
Mais :
Aaron peut obtenir davantage de liberté.
C'est précisément ce qui arrive dans le match.
Le jeu doit donc empêcher les solutions défensives absolues.

19. La dissuasion
Un défenseur peut ne pas toucher le porteur.
Il peut simplement :
rendre une passe dangereuse.
Exemple :
Kaël se positionne de façon à dissuader la passe vers Yanis.
Le porteur conserve donc le ballon.
C'est une action défensive réussie même sans interception.

20. Les aides défensives
Une défense solidaire doit être beaucoup plus difficile à battre qu'une défense composée de six duels individuels.
Un défenseur peut :
sortir ;
son partenaire coulisse ;
un troisième joueur couvre ;
le pivot défensif protège la zone.
Cela doit permettre des situations comme Lagny :
« ils ne laissent que rarement un coéquipier en 1 contre 1 ».

21. Les systèmes défensifs
Le jeu pourrait proposer notamment :
6-0
Bloc compact.
Forces :
protège les 6 mètres ;
réduit les espaces centraux.
Faiblesses :
tirs à distance ;
certaines circulations ;
certains jeux avec pivot.
5-1
Un joueur haut.
Forces :
pression sur le demi ;
perturbation de la circulation.
Faiblesses :
espaces créés derrière le joueur avancé.
1-2-3
Défense agressive.
Possibilité de :
monter ;
presser ;
dissuader ;
couper les lignes de passe ;
provoquer des erreurs.
Mais coût physique et mental important.
Système hybride
Exemple de Nangis :
phase 1 :
Aaron + Yanis hauts.
phase 2 :
Edgar prend le relais.
Le système change en fonction de la situation.

22. Les déclencheurs défensifs
On pourrait programmer des comportements :
Si Yanis reçoit → Kaël sort.
Si Malone reçoit → Elian le prend.
Si Aaron attaque 2-3 → Layo aide.
Si le pivot entre → le défenseur 3 coulisse.
Cela permet de créer des défenses réellement intelligentes.

23. Anticipation
Le jeu doit permettre au joueur de tenter de lire l'adversaire.
Le défenseur peut anticiper :
passe ;
tir ;
dribble ;
croisé ;
fixation ;
renversement ;
jeu avec pivot ;
jeu avec ailier.
Une bonne anticipation crée :
interception ;
bloc ;
contre ;
position avantageuse.
Une mauvaise anticipation ouvre un espace.

24. Le mindgame
Le système peut devenir beaucoup plus profond.
Un attaquant peut savoir :
« Ce défenseur pense que je vais faire X. »
Il peut alors faire Y.
Le défenseur peut anticiper cette feinte.
Cela crée plusieurs niveaux de lecture.
Le but n'est pas d'en faire un jeu de hasard.
Le joueur doit pouvoir apprendre :
les habitudes de l'adversaire.

25. Apprentissage pendant le match
Le jeu doit conserver certaines informations.
Exemple :
Après plusieurs possessions :
Maël sort souvent sur Aaron.
Malone reçoit fréquemment après une fixation de Kaël.
Kaël monte systématiquement sur Yanis.
Le joueur attentif peut comprendre ces tendances.
Il peut alors adapter son jeu.

26. Répétition et exploitation des patterns
Une équipe peut volontairement répéter une action.
Cela peut :
fatiguer la défense ;
créer une habitude ;
provoquer une anticipation ;
préparer une variante.
Exemple :
Trois fois :
Yanis → Erwan.
La défense anticipe.
La quatrième fois :
Yanis → Aaron.
La défense est piégée.

27. Le faux pattern
Une équipe peut également faire croire qu'elle possède une habitude.
Elle utilise :
trois fois la même structure
puis :
variation au quatrième passage.
Cela permet de créer une véritable stratégie de lecture.

28. Le rythme
Une équipe peut décider de jouer :
lentement ;
normalement ;
rapidement ;
très rapidement.
Le rythme affecte :
fatigue ;
organisation adverse ;
risque ;
nombre de possessions ;
capacité à créer des décalages.

29. Transition offensive
Après récupération :
attaque rapide ;
engagement rapide ;
montée collective ;
montée d'un seul joueur ;
conservation ;
attaque placée.
Le choix doit dépendre de la situation.

30. Transition défensive
Après perte :
repli immédiat ;
repli agressif ;
joueur qui poursuit le porteur ;
protection de l'axe ;
protection du gardien ;
faute tactique.

31. Le gardien
Le gardien possède son propre système.
Positionnement
ligne ;
légèrement avancé ;
très avancé.
Lecture
Il peut anticiper :
premier poteau ;
deuxième poteau ;
tir haut ;
tir bas ;
lob ;
roucoulette ;
chabala ;
tir en appui ;
tir en suspension.
Action
rester ;
avancer ;
sortir ;
basher ;
fermer un angle.

32. Duel tireur/gardien
Le tireur connaît les habitudes du gardien.
Le gardien connaît les habitudes du tireur.
Exemple :
Malone aime les gestes spectaculaires.
Liam peut exploiter cette information.
Le joueur peut donc essayer :
« Il pense que je vais faire ma spécialité. »
ou :
« Il sait que je sais qu'il l'attend. »

33. Les tirs
Le tir peut dépendre de :
distance ;
angle ;
position ;
appui ;
suspension ;
équilibre ;
défenseur ;
gardien ;
fatigue ;
timing.
Types
tir en appui ;
tir en suspension ;
tir à 6 m ;
tir à 9 m ;
aile ;
roucoulette ;
lob ;
chabala ;
tir puissant ;
tir placé.

34. Le tir peut être volontairement mauvais
Un joueur peut prendre un tir difficile parce qu'il n'a plus d'autre solution.
Cela peut être provoqué par :
défense ;
fatigue ;
pression ;
chrono ;
mauvais positionnement.
Le jeu doit donc différencier :
« le joueur a raté »
de
« la défense l'a forcé à prendre ce tir ».

35. Le temps
Le chrono doit être une ressource stratégique.
Exemple :
À trois minutes de la fin :
mener d'un but n'est pas mener d'un but avec possession.
Le joueur peut chercher :
faire tourner ;
provoquer une faute ;
tirer tard ;
accélérer ;
obtenir un bon tir ;
prendre un temps mort.

36. Gestion des temps morts
Chaque coach dispose d'un nombre limité de temps morts.
Le joueur décide :
maintenant ;
plus tard ;
conserver.
Un temps mort peut servir à :
casser une dynamique ;
changer de défense ;
préparer une combinaison ;
calmer une équipe ;
exploiter une faiblesse ;
préparer les dernières secondes.

37. Changements
Le banc doit être stratégique.
On peut changer :
arrière ;
demi ;
ailier ;
pivot ;
gardien.
Mais chaque changement modifie :
qualité individuelle ;
système ;
fatigue ;
complémentarité ;
style de jeu.

38. Les joueurs ont des profils
Chaque joueur doit posséder des caractéristiques nombreuses.
Physiques
vitesse ;
accélération ;
puissance ;
explosivité ;
endurance ;
taille ;
détente ;
résistance au contact.
Techniques
passe ;
dribble ;
tir ;
feinte ;
duel ;
réception ;
bloc ;
défense.
Tactiques
lecture ;
anticipation ;
prise de décision ;
placement ;
compréhension des systèmes ;
adaptation.
Mentales
confiance ;
concentration ;
sang-froid ;
agressivité ;
créativité ;
discipline ;
réaction à la pression.

39. Mais les statistiques ne doivent pas décider seules
Deux joueurs ayant :
Duel = 85
ne doivent pas nécessairement être identiques.
L'un peut être :
explosif ;
excellent en un contre un ;
mauvais dans les décisions.
L'autre :
moins explosif ;
extrêmement intelligent ;
excellent dans le timing.
Le joueur doit donc découvrir comment utiliser son joueur, et pas seulement regarder une note globale.

40. Les synergies
Les joueurs peuvent avoir des complémentarités.
Exemple :
Yanis + Aaron
Yanis sait trouver Aaron.
Aaron comprend les déplacements de Yanis.
Leur efficacité commune peut dépasser la somme de leurs qualités individuelles.
Même chose :
Aaron + Erwan ;
Kaël + Maël ;
Kaël + Malone ;
etc.

41. Les relations
Les relations peuvent évoluer.
Exemples :
rivalité ;
confiance ;
complémentarité ;
frustration ;
leadership ;
admiration.
Cela peut influencer certaines décisions, sans automatiser complètement le comportement.

42. Le leadership
Certains joueurs peuvent prendre naturellement des responsabilités.
Un capitaine peut :
organiser ;
demander une combinaison ;
calmer ses partenaires ;
prendre la responsabilité d'une action.
Mais un autre joueur peut progressivement prendre le contrôle.
C'est exactement ce qui arrive lorsque :
Aaron devient progressivement le véritable demi de Nangis.

43. Le changement de cerveau de l'équipe
C'est une mécanique particulièrement intéressante.
Une équipe peut commencer avec :
Yanis = cerveau.
Puis :
Kaël neutralise Yanis.
Aaron commence à organiser.
L'adversaire ne s'en rend pas compte.
Le joueur peut donc exploiter :
un changement de centre de gravité tactique.

44. Adaptation des adversaires
L'IA ne doit surtout pas être :
« difficulté facile / moyenne / difficile ».
Elle doit avoir des capacités de lecture.
Une bonne équipe peut :
observer ;
identifier ;
tester ;
adapter ;
contrer ;
s'adapter à la nouvelle réponse.
Le match Nangis/Lagny montre exactement ce fonctionnement.

45. Intelligence tactique des adversaires
Kaël ne doit pas simplement avoir « intelligence 95 ».
Il doit pouvoir :
remarquer une répétition ;
identifier un joueur clé ;
proposer une nouvelle défense ;
changer de cible ;
exploiter une faiblesse ;
abandonner une stratégie qui ne fonctionne plus.

46. Les erreurs intelligentes
Une bonne IA peut se tromper.
Exemple :
Lagny pense :
Aaron va devenir demi.
Mais Nangis remet Yanis.
Cette erreur n'est pas une erreur statistique.
C'est une erreur d'interprétation.
C'est très important pour rendre les matchs crédibles.

47. Le brouillard d'information
Le joueur ne devrait pas toujours connaître :
la stratégie exacte adverse ;
les consignes ;
les intentions ;
les habitudes ;
l'état mental.
Il doit les déduire du jeu.
Cela crée une vraie dimension d'observation.

48. L'entraînement
Tout ce qui est découvert pendant un match peut devenir une piste pour l'entraînement.
Exemple :
Un joueur a du mal contre :
marquage strict.
On peut travailler :
sorties de balle ;
jeu à deux ;
permutations ;
remplacement du demi ;
solutions de secours.

49. Préparation d'avant-match
Le joueur peut analyser l'adversaire.
Exemples :
joueur principal ;
meilleur tireur ;
habitudes ;
combinaisons ;
zones préférées ;
défense habituelle ;
rythme ;
faiblesses observées.
Mais une analyse ne garantit jamais que l'adversaire jouera exactement comme prévu.

50. Scouting
Après plusieurs matchs, le joueur peut construire une connaissance des adversaires.
Exemple :
Lagny
Kaël organise beaucoup ;
Malone adore finir à l'aile ;
Maël recherche le duel ;
défense très solidaire ;
gardien très fort ;
capacité à jouer à sept.
Le joueur peut préparer un plan.
Mais Lagny peut changer.

51. Le jeu doit récompenser la compréhension
La victoire ne devrait pas seulement donner :
+1000 XP.
Le joueur doit aussi ressentir :
« J'ai compris pourquoi ça marchait. »
Exemple :
Au début :
« Kaël me détruit. »
Puis :
« Il prend systématiquement mon demi en strict. »
Puis :
« Donc Aaron peut organiser depuis l'arrière. »
Puis :
« Mais s'il commence à surveiller Aaron, Yanis sera libre. »
Cette progression intellectuelle doit être le cœur de l'expérience.

52. Le système de « réponse à la réponse »
C'est probablement la mécanique la plus importante du jeu.
Une stratégie produit une réponse.
Cette réponse produit une contre-réponse.
Exemple :
Nangis
Yanis organise.
↓
Lagny
Kaël prend Yanis en strict.
↓
Nangis
Aaron prend le leadership.
↓
Lagny
Kaël doit décider s'il abandonne Yanis ou non.
↓
Nangis
Yanis redevient disponible.
↓
Lagny
changement défensif.
↓
Nangis
nouvelle adaptation.
Le jeu doit permettre cette boucle à tous les niveaux.

53. Une possession peut donc devenir un arbre de décisions
Exemple simplifié :
Aaron reçoit
→ Tir
 → Duel
 → Fixation
 → Passe Yanis
 → Passe Erwan
 → Bloc
 → Croisé
Si :
Duel
→ défenseur reste
 → défenseur sort
 → aide
Si :
défenseur sort
→ passe
 → continuation
 → feinte
 → renversement
Et ainsi de suite.
Le jeu peut donc produire une quantité presque infinie de situations sans nécessiter une quantité infinie d'animations.

54. Pourquoi l'abstraction visuelle peut devenir une force
Le choix de ne pas représenter physiquement les joueurs permet justement de mettre l'accent sur :
position ;
trajectoire ;
espace ;
timing ;
information ;
stratégie.
Le terrain devient presque un échiquier dynamique du handball.
Mais contrairement aux échecs, les situations sont :
continues ;
temporelles ;
physiques ;
incertaines ;
dépendantes du rythme ;
dépendantes de la fatigue ;
dépendantes de l'information.

55. Le joueur peut jouer à plusieurs niveaux
Il serait intéressant de permettre plusieurs degrés de contrôle.
Niveau simple
Le joueur donne :
« Jouer autour d'Aaron. »
L'équipe exécute.
Niveau intermédiaire
Le joueur choisit :
fixation → croisé → sortie ailier.
Niveau expert
Le joueur contrôle :
trajectoire + timing + cible + intention + réponse attendue.
Ainsi, le jeu peut être profond sans obliger tout le monde à utiliser immédiatement toute la profondeur.

56. Le véritable objectif du système
Le but n'est pas d'avoir :
le plus de boutons possible.
Le but est d'avoir :
le plus grand nombre possible de décisions pertinentes.
Une option ne mérite d'exister que si elle correspond à une véritable décision de handball.

57. Exemple complet à partir du match Nangis/Lagny
Situation :
Yanis reçoit.
Kaël est haut.
Le joueur sait que Kaël peut prendre Yanis en strict.
Il peut décider :
Option A
Jouer normalement.
Kaël monte.
Yanis est neutralisé.
Option B
Aaron se rapproche.
Le système change de centre de gravité.
Option C
Yanis attaque directement.
Kaël accompagne.
Option D
Yanis fixe.
Un défenseur sort.
Option E
Yanis cherche Erwan.
Option F
Entrée du pivot.
Option G
Permutation.
Option H
Renversement.
Option I
Feinte collective.
Chaque décision peut provoquer une réponse différente.

58. Exemple défensif
Lagny attaque.
Kaël possède le ballon.
Le joueur de Nangis peut choisir :
Yanis monte.
Mais :
pression directe ;
dissuasion de passe ;
accompagnement ;
blocage de la ligne de passe ;
laisser volontairement Kaël recevoir ;
préparer une interception.
Si Kaël change de position :
la défense doit réagir.

59. Les contre-attaques
Elles doivent être jouables comme des mini-situations.
Après interception :
qui part ?
à quelle vitesse ?
qui accompagne ?
qui reste ?
passe directe ?
fixation ?
tir ?
changement d'aile ?
retour du gardien ?
Une contre-attaque peut donc être très différente selon le nombre de défenseurs qui reviennent.

60. Les erreurs et imprévus
Le système doit aussi produire des événements réalistes :
mauvaise réception ;
passe trop longue ;
ballon perdu ;
mauvais timing ;
mauvais choix ;
interception ;
poteau ;
arrêt exceptionnel ;
faute ;
joueur qui glisse ;
fatigue ;
perte de concentration.
Mais ces événements doivent être influencés par le contexte.

61. Le momentum
Il peut exister une dynamique de match :
confiance ;
pression ;
fatigue ;
série de buts ;
public ;
frustration.
Mais il faut éviter un système arbitraire du type :
« Lagny vient de Lagny vient de marquer trois buts donc +20 % de réussite ».
Le momentum doit passer par des mécanismes concrets :
confiance ;
prise de risque ;
fatigue ;
précipitation ;
communication ;
concentration.

62. Le joueur peut gagner sans être individuellement supérieur
C'est essentiel.
Une équipe peut être moins forte individuellement mais :
mieux organisée ;
mieux préparée ;
plus adaptable ;
plus complémentaire ;
plus efficace tactiquement.
Et inversement.
Cela permet des matchs où :
« mon adversaire a de meilleurs joueurs, mais j'ai compris comment le jouer. »

63. Le jeu doit permettre les surprises
Une stratégie parfaite ne doit jamais garantir un résultat.
Un joueur peut :
faire une erreur ;
réaliser un geste exceptionnel ;
prendre une initiative inattendue ;
modifier son comportement ;
surprendre son adversaire.
Cela donne une impression de véritable match.

64. Les personnages du Cid Prince
Le manga peut servir de laboratoire initial.
Chaque personnage peut apporter une manière différente de jouer.
Yanis
organisation ;
lecture ;
passe ;
créativité ;
fluidité.
Aaron
puissance ;
duel ;
adaptation ;
intelligence ;
polyvalence.
Erwan
explosivité ;
puissance ;
tir ;
percussion.
Edgar
pivot ;
puissance ;
vitesse ;
présence physique.
Kaël
lecture ;
anticipation ;
adaptation ;
organisation.
Malone
créativité ;
tir ;
prise de risque ;
imprévisibilité ;
recherche du geste spectaculaire.
Maël
duel ;
puissance ;
agressivité ;
rivalité.
Ces profils ne doivent pas simplement modifier des chiffres.
Ils doivent modifier les solutions disponibles et la manière dont elles sont exploitées.

65. Une même situation doit pouvoir être résolue différemment
Exemple :
Un défenseur sort sur l'arrière.
Avec Yanis :
→ passe.
Avec Aaron :
→ duel.
Avec Erwan :
→ accélération.
Avec Malone :
→ tir improbable.
Avec Kaël :
→ nouvelle combinaison.
C'est cette diversité qui donnera une vraie identité aux joueurs.

66. Le jeu comme simulation de « cerveaux »
À haut niveau, le joueur ne joue plus seulement :
contre une défense.
Il joue contre :
la compréhension que l'adversaire a de son équipe.
Et l'adversaire joue contre :
la compréhension qu'il pense que le joueur a de son équipe.
Cela peut produire une profondeur stratégique considérable.

67. Architecture générale d'un match
Un match pourrait donc être pensé ainsi :
1. Observation
Les équipes commencent avec leurs plans.
2. Développement
Les joueurs découvrent les forces et faiblesses.
3. Adaptation
Les coachs modifient leurs systèmes.
4. Contre-adaptation
L'adversaire répond.
5. Usure
Fatigue physique et mentale.
6. Simplification
Les équipes reviennent parfois à leurs fondamentaux.
7. Clutch
Dernières minutes.
Les décisions prennent une importance maximale.

68. Dernières minutes
Le jeu doit particulièrement valoriser les situations finales.
Exemple :
29-29.
Il reste une minute.
Possession.
Le joueur doit choisir :
attaquer vite ;
faire tourner ;
chercher une faute ;
préparer un tir ;
utiliser un temps mort ;
tenter une combinaison préparée.
Puis, après la perte :
faut-il défendre agressivement ou protéger le match nul ?
Ce sont de véritables décisions.

69. Et surtout : aucune action ne devrait être totalement isolée
Une bonne attaque doit avoir des conséquences.
Si je fais sortir un défenseur :
l'espace qu'il laisse existe ensuite.
Si je fatigue un joueur :
il sera moins efficace plus tard.
Si je montre trois fois une combinaison :
l'adversaire peut l'identifier.
Si je fais entrer un pivot :
la défense doit s'adapter.
Si je joue rapidement :
je gagne du temps mais je dépense de l'énergie.
Chaque décision doit donc modifier l'état futur du match.

70. La philosophie finale
Le jeu devrait chercher à donner cette sensation :
« Je ne gagne pas parce que mon équipe possède les meilleures statistiques. Je gagne parce que j'ai compris ce qui se passe sur le terrain. »
Et idéalement, après un match comme Nangis/Lagny, le joueur doit pouvoir raconter exactement ce qui s'est passé :
« Au début, Kaël neutralisait mon demi. J'ai rapproché Aaron et Erwan. Ils ont commencé à anticiper, donc j'ai introduit Edgar. Ensuite ils sont passés à deux pivots. J'ai identifié que Maël devenait le point faible. J'ai utilisé Aaron pour le cibler. Ils ont commencé à fermer cet espace, donc j'ai libéré Yanis. À la fin, j'ai gardé mon dernier temps mort pour cette combinaison. »
Ça, ce serait le jeu.
Pas simplement un jeu où l'on regarde des ronds courir.
Un jeu où les ronds représentent des décisions, des espaces, des intentions et des réponses.
