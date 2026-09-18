# 18 - Diagnostic experientiel et refonte de la boucle

Date : 2026-09-18. Statut : PROPOSITION, a valider avant tout code.

Ce document part d'un test joue et enregistre en temps reel par l'utilisateur, en tire le diagnostic de fond, propose une specification de boucle agnostique du moteur, et une recommandation techno. Il remplace la methode audit-patch (doc 17) comme boucle de travail principale.

## 1. Retour de test brut (extrait structure, fidele au verbal)

Session : une partie complete, Nangis controle, notes prises en jouant.

1. Pas d'ecran d'accueil : on entre directement dans le match. Mineur.
2. Premiere frame fausse : Yanis (demi-centre) est au centre du dispositif alors qu'il devrait etre legerement derriere, dans l'axe, derriere Erwan et Aaron. La partie commence, mais pas comme du hand.
3. Duel possible a 20 metres d'ecart : face a Kael qui est dans sa zone, le jeu propose un duel et Yanis le gagne. Or un duel n'a de sens qu'au contact. Et quand un duel est gagne, un espace s'ouvre et doit etre referme par quelqu'un d'autre : ici rien ne se referme.
4. Edgar (pivot) n'est pas place au debut et met trop de temps a se placer.
5. La defense bouge et cree des espaces avant que l'attaque se soit installee. Tant que l'attaque est loin, la defense 6-0 par defaut ne devrait pas bouger, sauf si son systeme est agressif ou mobile. L'interpretation de l'espace est fausse.
6. Mauvais vis-a-vis : Elio est face a Aaron qui est cote droit, alors que la correspondance normale donne Mael et Malone sur cette zone. Idem Elio et Neo en double face a Elian, excentre. Ce peut etre une strategie, mais ici c'est le defaut, donc c'est une erreur de mapping.
7. Le porteur peut avancer a l'infini. La regle du marcher (3 pas, 3 secondes, dribble) n'existe pas.
8. Passe porteur vers pivot proposee alors que cette passe existe peu en vrai. Mineur.
9. Sur Edgar au tir : tous les tirs sont « tres risqué » ou « risqué », aucune lisibilite du risque reel. Et aucun but marque sur la session.
10. Defense injouable en pratique : une fenetre d'interaction apparait devant les attaquants mais trop courte, avec une seule option, et la possession est deja perdue. « Concretement, je ne defends pas. »
11. Interceptions absurdes : interception a 30 metres de distance entre les deux equipes ; parade du gardien alors que le tireur est a 12 metres.
12. « Fixer » est mal interprete : fixer, c'est attaquer un intervalle de maniere menacante vers le but pour provoquer la fermeture de cet espace et liberer l'autre. Ici fixer Karim fait passer le porteur devant lui, ce qui n'est pas une fixation.
13. Le dribble decale vers l'exterieur sans laisser choisir le sens du deplacement, ce qui excentre le porteur.
14. Echange bizarre de couloir entre Elio et Pierre en cours de possession.
15. Croise propose alors que Mael est deja sur le porteur a 12-15 metres des buts : les options ne tiennent pas compte de la geometrie du moment.
16. Bilan : le jeu ne ressemble pas au handball.

## 2. Diagnostic de fond

L'audit 17 verifiait « la doc dit X, le code contient X ». Ce test montre que le probleme n'est pas l'absence de features mais une **couche de simulation spatiale et temporelle defaillante**. Les 16 plaintes se ramenent a cinq causes racines.

### C-1 - Pas de geometrie credible (7 plaintes sur 16)

Le moteur raisonne en « actions disponibles par joueur » sans modeliser les vis-a-vis reels du handball : aile droite face au defenseur droit, pivot appuye sur le pivot. Le mapping actuel (proximite ou index) produit Elio face a Aaron a droite. Les intentions (duel, fixer, croise) sont proposees sans gate geometrique de pertinence : distance au vis-a-vis, orientation vers le but, etat de l'intervalle. D'ou des duels a 20 m, un fixer qui fait passer devant, un croise propose sous pression deja installee.

### C-2 - Pas de phases temporelles de possession

Le handball vit en phases : remise en jeu, installation de l'attaque, mise en place de la defense, rotations, puis situations. Le code actuel applique une forme statique puis laisse tout bouger immediatement, des deux cotes. Resultat : la defense « attaque » avant que l'attaque existe, le pivot n'est pas place, la premiere frame est fausse. Il manque une machine a etats de possession avec une regle simple : par defaut, tant que l'attaque n'est pas installee, la defense reste sur son systeme.

### C-3 - Pas de regles de tenue de balle

Le porteur peut avancer a l'infini. Les regles fondamentales (3 pas sans dribble, 3 secondes, reprise de dribble interdite) sont documentees dans `15-recherche-handball-multilingue.md` mais absentes du moteur. Elles ne sont pas un detail reglementaire : elles structurent toutes les decisions offensives.

### C-4 - Resolution invisible et pacing defensif casse

La defense est la plainte la plus dure : « concretement, je ne defends pas ». Deux causes : la fenetre d'interaction est trop breve (le temps de simulation ne ralentit pas dans les moments decisifs), et la resolution de toute action est un jet instantane illustre par un toast. Le joueur ne voit jamais la passe voyager, le duel se jouer, le gardien plonger. Il ne peut donc ni apprendre, ni anticiper, ni se sentir a l'origine de quoi que ce soit.

### C-5 - Le risque n'est pas lisible

Tous les tirs « risques », aucun but marque, des interceptions a 30 m. Les estimations affichees ne correspondent pas a ce que le moteur calcule reellement dans ces positions, ou le calcul lui-meme ignore la geometrie (C-1). Dans les deux cas le contrat du doc 05 (estimations fideles, incertitude assume) n'est pas tenu.

### Conclusion

Refondre l'interface sans corriger C-1 et C-2 donnerait un jeu faux mais joli. Corriger C-1/C-2/C-3 sans refondre la temporalisation (C-4) donnerait un simulateur juste mais toujours injouable. Les cinq causes doivent etre traitees ensemble, dans une seule passe coherente : c'est la refonte de la boucle.

## 3. Specification de la boucle (agnostique du moteur)

### 3.1 Machine a etats de possession

Chaque possession traverse des phases explicites, visibles a l'ecran :

- `ENGAGEMENT` : remise en jeu ou engagement, placement initial canonique (demi-centre legerement derriere dans l'axe, ailes hauts et larges, pivot appuye a 6 m, defense sur son systeme, immobile).
- `INSTALLATION` : l'attaque monte et se place. Pas de decision offensive proposee. La defense ne bouge pas sauf systeme explicitement agressif (pressing, 3-2-1). Duree gouvernee par la distance et la vitesse, jamais par un timer fixe.
- `JEU` : rotations, passes, courses. Fenetres de decision ouvertes sur evenements significatifs seulement.
- `SITUATION` : evenement significatif (porteur attaquant un intervalle, fixation reussie, decalage, tir). Le temps ralentit ou se met en pause selon le mode, la fenetre s'ouvre avec 2 a 4 options pertinentes.
- `RESOLUTION` : l'action choisie se joue sous les yeux en 2 a 4 secondes simulees (la passe voyage, le duel se joue au contact, le tir part). Causes affichees ensuite, jamais a la place du geste.
- `TRANSITION` : reprise, sortie, but. La defense adverse se replace selon ses regles.

### 3.2 Geometrie de reference

- Vis-a-vis par poste et couloir : chaque attaquant a un defenseur de reference selon son poste et sa position, le marquage suit les permutations reelles (un croise permute les vis-a-vis, rien ne se teleporte).
- Gates geometriques sur chaque intention : duel seulement si le vis-a-vis est a moins de 2 m et le porteur oriente vers l'intervalle ; fixer seulement s'il existe un intervalle devant soi oriente vers le but, et la fixation produit un deplacement dans l'espace (jamais « passer devant ») ; croise seulement si le partenaire vise est en position de permuter ; passe uniquement si le couloir de passe est realiste.
- Distances de tir fideles (doc 15) : 6 m, 9 m, 7 m, aile proche hors extension, penalite d'angle gardee coherente avec la geometrie.

### 3.3 Regles de tenue de balle

- 3 pas sans dribble, 3 secondes sans dribble, reprise de dribble interdite, marcher = perte de balle avec cause affichee. Ces regles sont les contraintes qui rendent les decisions urgentes.

### 3.4 Fenetres de decision

- Offensive : au moment de la SITUATION, 2 a 4 options pertinentes avec estimation fidele (un tir « tres risque » a 9 m face a une defense reculee ne doit pas exister).
- Defensive : quand le porteur adverse entre dans la zone de decision (au-dela de 12-15 m de l'axe ou a proximite d'un vis-a-vis), le temps ralentit fortement (pas une fenetre de 0,5 s). Le coach choisit pour UN defenseur : contester, contenir, aider, replier, ou laisser. La reponse se joue sous les yeux comme une action offensive.
- Un seul niveau d'interaction a la fois. Jamais deux fenetres concurrentes.

### 3.5 Resolution visible

Toute action se deroule visiblement : position initiale, trajectoire, point de decision, issue. Le toast ne remplace plus le geste, il l'explique apres coup. Les causes (defenseur degage, aide arrivee trop tard, gardien a lu le tir) sont des evenements visibles ou textuels post-geste, ancres dans ce que le joueur vient de voir.

## 4. Recommandation techno : React-canvas vs Godot

- Le probleme actuel n'est pas la techno : aucune des 16 plaintes ne vient du canvas. Le moteur (resolution causale, memoire, fatigue, seed) est sain et teste, il est reutilisable tel quel.
- Godot ferait mieux la couche feel (tweens, easing, camera, juice) mais imposerait le portage du moteur et la perte de l'ecosysteme de tests actuels, pour un gain qui ne se materialise qu'apres la refonte de boucle.
- Recommandation : **prouver la boucle dans le stack actuel** (simulation a tick strict, couche d'animation dediee, interpolation de toutes les positions). Si la preuve convainc et que l'ambition feel depasse ce que le canvas permet, migrer vers Godot a ce moment-la, en portant le moteur tel quel (il est deja separe de l'interface, exigence des fondations du doc 08).
- La decision techno finale est reportee apres la preuve de boucle. Elle ne bloque rien.

## 5. Plan de la passe de refonte (a valider)

Ordre impose, une seule passe coherente :

1. **P0 - Geometrie et phases** : vis-a-vis par poste, gates geometriques des intentions, machine a etats de possession, regles de tenue de balle, placement canonique premiere frame. (C-1, C-2, C-3)
2. **P1 - Temporalisation** : resolution de toutes les actions en temps simule visible, ralentissement defensif, fenetres 2-4 options. (C-4)
3. **P2 - Lisibilite du risque** : estimations fideles au calcul reel, coherence C-1/C-5. (C-5)
4. **P3 - Rendu doc 04** : integre a la fin, jamais avant, pour ne pas masquer la simulation.

Critere de sortie global : rejouer le test de la section 1 et repondre point par point, chaque plainte doit etre resolue ou explicitement acceptee comme choix de design.

## 6. Ce qui ne change pas

- Le moteur de resolution, la seed, la memoire, la fatigue, les systemes : conserves.
- Les contraintes licites : cercles et texte seulement, aucune representation d'etre anime, aucun shirk, aucune musique imposee, aucun pari.
- Le principe non scripte : la machine a etats de possession gouverne des conditions, jamais des minutes.
