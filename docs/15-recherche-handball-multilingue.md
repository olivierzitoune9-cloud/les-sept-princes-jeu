# 15 - Recherche handball multilingue

## Statut

Memo de recherche pour rendre le moteur fidele au handball reel sans remplacer le canon des documents 00, 01, 03, 04 et 05. Les documents du projet disent quel jeu construire ; les sources externes servent a verifier que les actions, les espaces, les roles et les consequences ressemblent au handball.

Langues consultees ou mobilisees : francais, anglais, allemand, danois et hongrois. Les portails federaux ne sont pas tous accessibles de maniere uniforme ; une page d accueil ou un portail de formation est une piste de source, pas une preuve technique suffisante a lui seul.

## 1. Hierarchie des sources

### Niveau A - reglement et geometrie

- [IHF - Regulations documents / Playing Rules](https://www.ihf.info/regulations-documents/playing-rules) : source internationale pour les regles, le terrain, le but, les zones, la reprise, les sanctions et le jeu en inferiorite ou avec gardien supplementaire.
- [FFHandball](https://www.ffhandball.fr/) : source francaise pour les competitions, la formation et les ressources de pratique.

Ces sources tranchent le droit du jeu. Elles ne tranchent pas le comportement romanesque d un joueur.

### Niveau B - formation et culture technique

- [DHB](https://www.dhb.de/de/trainer) : portail allemand des entraineurs et de la formation ; utile pour chercher les principes de lecture, de defense et de developpement du joueur.
- [DanskHandbold](https://danskhaandbold.dk/uddannelse) : portail danois de formation ; utile pour le travail des fondamentaux, la pedagogie de l entrainement et les situations reduites.
- [MKSZ](https://www.mksz.hu/szakmai-anyagok) : portail hongrois des ressources professionnelles ; utile pour la formation, la culture de jeu et le haut niveau hongrois.
- [EHF - Technical Refereeing](https://www.eurohandball.com/en/what-we-do/technical-refereeing/) : ressource europeenne pour les situations reglementaires et l interpretation.
- [EHF - Grassroots](https://www.eurohandball.com/en/what-we-do/grassroots/) : ressource europeenne pour l apprentissage et les formats de pratique.

Ces portails orientent vers des documents techniques, videos ou formations. Une regle integree au moteur doit conserver l URL ou le document precis qui la justifie.

### Niveau C - corpus du projet

- `docs/01-vision-gameplay.md` : situations, intervalles, fixation, lecture, passes, blocs, pivot et patterns ;
- `docs/04-gameplay-design.md` : terrain, jetons, feedback, interactions et mode expert ;
- `docs/05-systeme-match.md` : simulation, pauses, possession, temps, coaching et resolutions ;
- `docs/13-fiches-situation-match-44-48.md` : observations du match Nangis-Lagny ;
- `docs/14-rapport-systeme-match-44-48.md` : hypotheses de modelisation issues du recit.

Le corpus du projet prime pour les personnages et les situations Nangis-Lagny. Les sources externes priment pour ne pas inventer la logique generale du handball.

## 2. Ce que le handball reel impose au modele

### Terrain et contraintes

Le modele doit conserver un terrain continu de 40 par 20 metres avec but de 3 par 2 metres, zone de 6 metres, ligne de 9 metres et ligne de 7 metres. Les zones tactiques 1-2, 2-3, 3-2, ailes, centre et zone du pivot sont des abstractions de lecture et non des cases.

Les regles de temps, de pas, de reprise, de contact, de sortie de terrain, de jet franc, de jet de 7 metres et de sanction ne doivent pas etre remplacees par un simple pourcentage de duel.

### Phases d une attaque

Une attaque reelle n est pas une suite plate de boutons. Le moteur doit distinguer :

1. repli ou recuperation ;
2. montee de balle et contre-attaque ;
3. attaque rapide avant replacement complet ;
4. installation ;
5. circulation et fixation ;
6. creation d un surnombre ou d un intervalle ;
7. occasion sous pression ;
8. tir, faute, perte, arret ou nouvelle circulation.

Cette decomposition rejoint directement le document 05 et explique pourquoi une pause decisionnelle doit apparaitre sur un changement de situation, pas a chaque passe.

### Defense

Une defense se lit avec plusieurs principes simultanes :

- profondeur : sortir sur le porteur sans abandonner l interieur ;
- largeur : coulisser et proteger les ailes ;
- aide : couvrir la sortie d un partenaire ;
- dissuasion : fermer une ligne de passe sans chercher immediatement le ballon ;
- changement : reprendre une menace apres croise ou bloc ;
- communication : annoncer le porteur, le bloc, le pivot et la permutation ;
- replacement : revenir apres une sortie ou une aide manquee.

Le 6-0 protege la zone proche et accepte davantage de tirs lointains. Le 5-1 perturbe le demi et la circulation mais peut laisser un espace derriere la pointe. Le 3-2-1 ou 1-2-3 est plus agressif, coupe les lignes et provoque des erreurs, avec un cout physique et un risque derriere les defenseurs avances. Ces forces et faiblesses doivent modifier les options, pas seulement appliquer un bonus abstrait.

### Fixation et intervalle

Une fixation utile ne signifie pas seulement « attirer un defenseur ». Elle comprend :

- l angle et la vitesse d approche ;
- le moment ou le defenseur doit choisir entre sortir et rester ;
- la position du partenaire qui menace la passe ;
- la possibilite d une deuxieme aide ;
- la sortie securisee si l intervalle se ferme.

Un intervalle est donc une relation dynamique entre deux defenseurs et les menaces qui les separent. Il doit avoir un etat avant, pendant et apres l action.

### Bloc et croise

Un bloc possede un poseur, une cible, une orientation, un timing et une reaction defensive. La defense peut passer devant, passer derriere, changer, contourner ou aider. Un croise n est pas une animation : il impose une decision de suivi, de changement ou de fermeture.

Le moteur doit permettre d interrompre le bloc ou le croise et de transformer l action en passe, fixation, renversement ou duel.

### Pivot

Le pivot agit sur la structure defensive meme sans recevoir. Il peut bloquer, fixer, sortir, entrer, remettre, provoquer un contact et attirer deux defenseurs. Son impact doit etre mesure par l espace cree et la qualite de la situation suivante, pas uniquement par ses buts.

### Gardien

Le gardien est un defenseur positionnel et un acteur de lecture. Le modele doit distinguer :

- profondeur de position ;
- angle ferme ;
- premier ou deuxieme poteau ;
- haut, bas, tir croise, lob et tirs en mouvement ;
- attente et anticipation ;
- sortie ou retour ;
- relance et choix de transition.

Un arret doit pouvoir venir d une bonne position, d une lecture de l intention, d un reflexe ou d une erreur du tireur. Le recit Liam-Malone est un cas de memoire et de lecture, pas seulement de statistique d arret.

### Jeu a 7

Le gardien supplementaire cree un joueur de champ de plus mais expose le but. Le moteur doit gerer :

- le moment d entree et de sortie ;
- la position du gardien remplace ;
- le repli quand le ballon est perdu ;
- la detection du tir vers la cage vide ;
- le retour avant ou apres reception de l ailier ;
- le risque tactique accepte par le coach.

La version Nangis-Lagny ajoute une particularite : Rio ne sert pas seulement de surnombre, il libere Kael de la distribution et change la qualite des decisions.

## 3. Ce que les documents 01, 04 et 05 ajoutent

### Document 01 - vision

Le document 01 impose la profondeur des situations : trajectoires, intervalles, fixation, duel contextuel, passes placees, joueurs sans ballon, blocs, pivot, permutations, strict, dissuasion, aides, anticipation, patterns, faux patterns, rythme, transitions, gardien, tirs, temps morts et coaching.

Consequence code : une action doit porter au minimum acteur, cible, intention, execution, timing, contexte defensif et consequence. Une note globale ne suffit jamais.

### Document 04 - gameplay et interface

Le document 04 impose que le terrain soit l espace de decision. Les options apparaissent sur le terrain, les trajectoires sont visibles pendant la preparation, les couleurs ont une signification stable et les explications restent courtes. Le joueur doit pouvoir lire une passe, une zone, une aide, un duel et un risque sans ouvrir un tableur.

Consequence code : l interface devra consommer des situations et des options qualifiees, pas des boutons de regles internes. Le moteur doit donc exposer les lignes de passe, les zones ouvertes, les aides et les raisons.

### Document 05 - systeme de match

Le document 05 impose simulation, pause decisionnelle et reprise, avec trois vitesses. La possession est une sequence de situations et le joueur peut preparer plusieurs ordres avant execution. Le terrain est continu mais les zones servent au calcul. Le mode expert montre des estimations, jamais une certitude.

Consequence code : il faut un journal d evenements rejouable, un etat serialisable, une horloge testable et un moteur capable d interrompre une sequence apres reaction adverse.

## 4. Corrections a apporter au moteur actuel

Le noyau actuel est utile mais reste simplifie sur plusieurs points :

1. remplacer les seuls types `pass`, `duel`, `shoot`, `move` par des intentions de fixation, bloc, croise, feinte, course sans ballon, aide et marquage ;
2. remplacer les positions seulement geometriques par des zones, intervalles, lignes de passe et relations de marquage ;
3. representer le timing et les actions retardees ;
4. faire du strict, de la dissuasion et de l aide des etats reels ;
5. ajouter une memoire ciblee par joueur et par pattern, avec oubli et faux pattern ;
6. enrichir le gardien avec position, angle, intention et habitude ;
7. faire produire au rapport l efficacite par zone et systeme, la valeur sans ballon et les causes ;
8. ajouter des tests de diversite sur plusieurs centaines de seeds ;
9. connecter les situations a une interface de terrain avant d ajouter du polish ;
10. conserver une trace de la source technique precise pour chaque regle ajoutee.

## 5. Methode de recherche a poursuivre

Pour chaque mecanique :

1. verifier la contrainte dans les regles IHF ;
2. chercher une ressource de formation FFHandball, EHF, DHB, DanskHandbold ou MKSZ ;
3. comparer au corpus Nangis-Lagny ;
4. distinguer regle, principe technique, choix de coaching et licence ludique ;
5. enregistrer la decision dans l historique ;
6. ajouter un test comportemental avant l integration visuelle.

Les recherches en allemand, danois et hongrois servent surtout a elargir le vocabulaire technique et les approches de formation. Elles ne doivent pas etre utilisees pour attribuer une regle sans document primaire identifiable.

## 6. Matrice precise des documents 01, 04 et 05

### Document 01 - 70 points

Les points 29 a 35 ajoutent les transitions offensives et defensives, le gardien, le duel tireur-gardien, les tirs et le chrono. Les points 36 a 44 ajoutent le banc, les profils, les synergies, les relations, le leadership, le changement de cerveau et l adaptation adverse. Les points 45 a 50 imposent une IA qui observe, se trompe, conserve un brouillard d information, prepare et scoute. Les points 51 a 54 imposent la recompense par comprehension, la reponse a la reponse, l arbre de decisions et l abstraction visuelle. Les points 55 a 70 imposent trois niveaux de controle, des decisions pertinentes plutot que de nombreux boutons, les contre-attaques, le momentum concret, les surprises, les profils identitaires, les cerveaux adverses, le rythme en sept phases, les fins de match, les consequences persistantes et la philosophie finale.

### Document 04 - 95 sections d interface et de gameplay

Le document 04 precise le langage visuel : terrain dominant, cercles, ballon, zones, lignes de passe, anneaux de fatigue et pression, couleurs semantiques, feedback des duels, aides et interceptions. Il precise aussi les interactions tactiles et clavier, les cartes d intention, la construction de sequences, les interruptions, les modes lecture et execution, les vitesses x0,5 a x4, le HUD, le panneau d analyse, la timeline, le replay tactique, le temps mort, le centre dynamique, l editeur tactique optionnel, les rapports de fin, le boss Lagny et le premier test Yanis vers Aaron contre Mael.

La regle essentielle de 04 est que le terrain est l interface. Les menus servent les intentions complexes ; ils ne doivent pas remplacer la lecture spatiale.

### Document 05 - 121 sections de systeme de match

Le document 05 precise le contrat de simulation : simulation, pause decisionnelle, reprise ; trois vitesses ; possession en phases ; terrain continu avec zones ; selection et controle de plusieurs joueurs ; intentions, menaces, priorites et timing ; estimations qualitatives et mode expert ; passes, receptions, courses, passe-et-va, croises et arbres de decision ; defense, aides, changements, strict, distance, anticipation et systemes 1-5 / 1-2-3.

Ses sections 48 a 85 ajoutent le bluff contre l IA, le tempo, les transitions, le gardien, la roucoulette, l apprentissage du gardien, le jeu a 7, les deux pivots, les objectifs tactiques, les styles, le changement de plan, le temps mort, le message, le remplacement, le changement de poste, les postes non naturels, le coaching conditionnel, le plan d avant-match, le scouting, les cartes tactiques, des duels et des passes, les patterns, la contre-adaptation, la memoire, l oubli et la consigne contraire.

Ses sections 86 a 121 ajoutent gestion du score, fin de match, derniere possession, bras leve et jeu passif, chronometre tactique, statistiques en direct, efficacite par type de situation, analyse automatique sans solution imposee, mode Manga non script, incertitude de l IA et du joueur, outil de diagnostic developpeur hors experience de jeu, modes normal/expert/difficile, sequences interruptibles, premiere boucle jouable et les versions 0.1 a 1.0.

## 7. Conclusion de recherche

La vision n est pas un simple jeu de passes et de tirs. C est une simulation de lecture collective sous contrainte de temps, espace, contact, fatigue et information incomplete. Le moteur actuel est une fondation valide, mais il doit maintenant evoluer vers les relations spatiales, les sequences interruptibles, les objectifs de coaching, les cartes de tendances et une interface terrain avant de pouvoir etre qualifie de fidele.
