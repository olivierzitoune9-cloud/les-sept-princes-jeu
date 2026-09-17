# 16 - Plan de la vertical slice au jeu complet

## Objectif

Construire d abord une version testable qui prouve que le jeu est bon avec peu de contenu, puis etendre progressivement vers le match pilote complet et les autres personnages. Ne pas implementer tout le scenario avant d avoir valide la boucle.

Le principe est :

1. moteur tactique testable ;
2. vertical slice jouable ;
3. match pilote complet Nangis-Lagny ;
4. extension du scenario et des personnages ;
5. contenu final et polish.

La vertical slice n est pas une demo jetable. Elle utilise le meme moteur, les memes types de donnees et la meme interface que le jeu final.

## Phase A - noyau deja construit

Etat au 17 septembre 2026 :

- positions continues, zones et intervalles dynamiques ;
- ballon, possession, score, chronometre et seed ;
- passes, duels, tirs et deplacements ;
- intentions et timings ;
- fixation, bloc, croise et courses sans ballon ;
- marquage et aide defensive ;
- systemes et adaptation defensive ;
- gardien avec lecture du type de tir ;
- confiance, pression et variation mentale ;
- sequences interruptibles ;
- substitutions, temps morts et jeu a 7 ;
- match multi-possessions ;
- rapport causal et campagne de seeds.

Validation actuelle : `npm.cmd run check` passe avec 18 tests.

## Phase B - vertical slice jouable

### Perimetre

Une seule rencontre courte, jouable du debut a la fin, avec une composition reduite mais representative :

Nangis : Yanis, Aaron, Erwan, Edgar, Elian, Liam.

Lagny : Kael, Mael, Malone, Elio, Layo, Teddy.

Les autres joueurs restent remplaces par des profils generiques temporaires uniquement dans les simulations internes. Ils ne sont pas encore du contenu canonique.

### Fonctionnalites obligatoires

- terrain abstrait vu du dessus ;
- cercles, ballon, trajectoires et zones ;
- selection d un porteur ou d un joueur sans ballon ;
- passe, course, fixation, bloc, croise, duel, tir ;
- marquage strict, aide, interception et repli ;
- 6-0, 1-5 et 1-2-3 ;
- pauses decisionnelles ;
- vitesse normale, ralentie et acceleree ;
- gardien et types de tirs ;
- fatigue, pression, confiance ;
- sequences interruptibles ;
- rapport de possession ;
- replay tactique simple.

### Scenario de test obligatoire

1. Yanis recoit face a une defense 6-0.
2. Le joueur choisit une passe vers Aaron.
3. Kael commence a fermer Yanis.
4. Aaron choisit une fixation ou un duel contre Mael.
5. Erwan pose un bloc ou coupe sans ballon.
6. Edgar attire une aide.
7. La defense reagit.
8. Le joueur peut poursuivre, ressortir, renverser ou passer.
9. Le gardien lit le tir.
10. Le rapport explique la resolution.

### Sortie de phase

La phase est validee quand un joueur humain peut jouer une rencontre courte et repondre :

- pourquoi l espace etait ouvert ;
- pourquoi la defense a aide ;
- pourquoi le tir etait bon ou force ;
- pourquoi le gardien a arrete ou encaisse ;
- comment le pattern peut etre exploite ensuite.

## Phase C - validation de la vertical slice

Executer :

- 20 parties Nangis contre Lagny ;
- 20 parties avec controle inverse ;
- 100 seeds IA contre IA ;
- replays reproductibles ;
- test mobile et desktop de l interface ;
- verification licite de chaque ecran.

La slice est acceptee si :

- les deux equipes peuvent gagner ;
- au moins trois familles de scores apparaissent ;
- une defense stricte peut etre contournee ;
- une aide ferme un espace mais en ouvre un autre ;
- un gardien gagne par lecture et pas seulement par note ;
- une sequence est interrompue par une vraie reaction ;
- les memes tactiques ne sont pas invincibles ;
- le rapport est comprehensible sans mode developpeur complet.

## Phase D - match pilote complet

### Ajouter les joueurs canoniques

Nangis : Pierre, Leo, Ilyes.

Lagny : Karim, Neo, Rio, ainsi que les joueurs de banc et profils explicitement presents dans les chapitres 44 a 48.

Chaque joueur recoit :

- profil physique ;
- profil technique ;
- intelligence tactique ;
- mental ;
- role ;
- habitudes ;
- synergies ;
- relations ;
- conditions de remplacement ;
- traces de calibration dans les fiches 13 et le rapport 14.

### Ajouter les situations du match

Les fiches 13 servent de tests de calibration, jamais de script. Chaque sequence doit etre reproductible comme possibilite, mais le moteur doit pouvoir produire une autre reponse.

Verifier notamment :

- strict Kael-Yanis ;
- remplacement de Yanis par Leo ;
- retour de Yanis ;
- 1-2-3 hybride ;
- Aaron qui devient centre ;
- fatigue du 1-2-3 ;
- jeu a 7 de Lagny ;
- recherche de Malone ;
- duel Aaron-Mael ;
- lecture finale Liam-Malone.

### Sortie de phase

Le match pilote complet est valide quand le moteur peut produire des parties proches du recit et des parties tres differentes, avec une explication causale dans les deux cas.

## Phase E - contenu et autres personnages

Ne commencer cette phase qu apres validation de la vertical slice et du match pilote.

Ordre :

1. ajouter les autres joueurs de Nangis et Lagny ;
2. ajouter Brunoy, Pontault, Serris, Torcy et Ponthierry ;
3. ajouter les profils des Princes ;
4. ajouter les rivalites et relations ;
5. ajouter les matchs de calibration secondaires ;
6. ajouter les chapitres hors 44 a 48 ;
7. ajouter les saisons et la progression narrative ;
8. ajouter le projet des Princes comme contenu de campagne.

Chaque nouveau personnage doit apporter une solution de handball identifiable. Il ne doit pas etre une simple variation de chiffres.

## Phase F - jeu complet

Le jeu complet comprend :

- campagne et matchs ;
- preparation d avant-match ;
- scouting ;
- entrainement ;
- progression des joueurs ;
- relations et leadership ;
- sauvegarde et reprise ;
- rapports et replays ;
- modes normal, expert et difficile ;
- mode developpeur complet hors experience joueur ;
- validation des contraintes licites ;
- contenu narratif sans deroule impose.

## Definition de fini

Le jeu est pret pour une premiere publication quand :

1. la vertical slice est amusante avec les cercles seuls ;
2. le match pilote complet est jouable sans script ;
3. les joueurs ont des identites tactiques observables ;
4. les defenses apprennent et contre-adaptent ;
5. les gardiens lisent les tireurs ;
6. les fins de match sont jouables ;
7. plusieurs seeds produisent des histoires differentes ;
8. les replays expliquent les decisions ;
9. les autres personnages peuvent etre ajoutes sans modifier le coeur du moteur ;
10. aucune mecanique ne depend d une representation animee ou d une regle minute par minute.

## Prochaine implementation

La prochaine etape n est pas d ajouter tout le scenario. Elle est de construire la vertical slice jouable avec les six profils principaux de chaque cote, puis de la tester avant d etendre le contenu.
