# 07 - Design system

## Statut

Ce document fixe la presentation du prototype. Il ne cree aucune regle de gameplay : les documents 00, 01, 03, 04 et 05 restent la source de verite. Toute decision visuelle doit servir la lecture de la situation et la prise de decision.

## 1. Direction

L interface doit evoquer un logiciel tactique de haut niveau transforme en jeu de handball : sobre, premium, dense mais lisible. Le terrain est premier, l information est deuxieme, la decision est troisieme, les statistiques sont en soutien.

Interdits : personnages, avatars, representation humanoide, effets de type critical ou combo, confettis, gros pourcentages permanents, rainbow UI, teleportation des jetons et animations qui suggerent une ame.

## 2. Terrain

Le terrain respecte les proportions 40 par 20, la zone des 6 m, la ligne des 9 m, la ligne des 7 m et les buts 3 par 2. Il occupe environ 70 a 80 pour cent de l espace de jeu sur grand ecran et reste lisible sur petit ecran.

Le fond est sombre, le terrain clair, les lignes fines. Les zones 6 m, 9 m, intervalles et ailes peuvent etre differenciees par une variation discrete de teinte ou de texture. La lisibilite prime sur la decoration.

Les transitions de systeme deplacent progressivement les cercles. Aucun joueur ne se teleporte.

## 3. Jetons et informations

Chaque joueur est un cercle avec numero dominant, nom abrege et statut discret. L equipe utilise une couleur stable. Le joueur selectionne porte un anneau lumineux. Le porteur porte un indicateur ballon distinct. La fatigue peut etre montree par un anneau exterieur ; la pression par un second anneau.

Palette semantique minimale : couleur equipe A, couleur equipe B, blanc neutre, jaune decision disponible, rouge danger, vert opportunite. Une couleur garde toujours la meme signification.

## 4. Navigation et interaction

Le terrain est interactif ; les menus sont contextuels et courts.

- clic ou tap : selection ;
- glisser vers un joueur : passe, bloc ou marquage selon le mode ;
- glisser vers une zone : course, attaque ou aide ;
- clic droit : menu contextuel sur PC ;
- maintien : information avancee ;
- double clic : action rapide ;
- espace : pause ;
- touches 1 a 4 : actions frequentes ;
- Tab : analyse.

Cliquer dans le terrain sert a viser une zone. Les actions ne sont pas presentees comme une grille permanente de dizaines de boutons.

Lors d un duel, l interface expose direction interieur ou exterieur, intention exploser, temporiser, feinter, provoquer ou proteger, et timing immediat, apres feinte ou apres deplacement.

## 5. HUD et panneaux

Le HUD superieur reste minimal : equipes, score, chrono et possession. Le panneau contextuel indique le porteur, son energie, sa pression et les menaces immediates. Le panneau d analyse s ouvre a la demande et expose fermetures, lignes de passe, aides et zones abandonnees.

Les options sont qualifiees par lisibilite qualitative : tres favorable, favorable, neutre, risque ou tres risque. Les probabilites numeriques sont reservees au mode expert et presentees comme des estimations, jamais comme des certitudes.

## 6. Feedback tactique

- passe sure : ligne blanche ;
- passe risquee : ligne jaune ;
- passe presque impossible : ligne rouge ;
- fixation : ligne fine vers le defenseur ;
- deuxieme aide : modification visible de la ligne et de la zone abandonnee ;
- passe reussie : trajet blanc rapide ;
- interception : trajet casse ;
- duel gagne : deplacement net ;
- duel perdu : porteur ralenti ou force a ressortir ;
- selection : pulsation legere.

Les trajectoires ne sont visibles que pendant la preparation, puis sont effacees ou attenuees. Chaque action importante peut afficher une phrase courte qui explique la cause : anticipation, premier appui, aide, fatigue ou ligne fermee.

## 7. Ecrans et moments

Ecran de match : terrain, HUD et panneau contextuel.

Preparation d action : zones, joueurs accessibles, trajectoires et timing.

Temps mort : terrain conserve en arriere-plan, probleme identifie, options de reponse, aucune solution presentee comme correcte.

Timeline : historique cliquable avec labels fixation, aide, intervalle, passe, tir et vitesse de lecture 0,5.

Fin de match : score sobre, impact des joueurs, creation, duels, lecture, systemes, centre de gravite offensif, observations datees et causes des sequences decisives. Pas de celebration visuelle envahissante.

## 8. Son

Le son est optionnel et non impose. Il peut fournir ballon, possession, sifflet, buzzer, impact, filet et chrono. Aucune musique n est necessaire au prototype.

## 9. Accessibilite et robustesse

Une information ne doit pas dependre de la couleur seule : ajouter forme, position, icone ou libelle. Les zones tactiques, textes et controles doivent rester lisibles sur desktop et mobile. La pause doit etre accessible par le clavier et l action en cours ne doit pas etre perdue lors d une ouverture de panneau.

## 10. Critere de qualite visuelle

Avec uniquement des cercles, un ballon, des lignes et des zones, un joueur doit identifier en quelques secondes : qui a le ballon, qui est menace, quel espace est ouvert, quelle aide est en cours, quelles actions sont possibles et pourquoi la derniere action a reussi ou echoue.
