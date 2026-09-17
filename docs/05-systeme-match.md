## **Les sept princes**

## **SPÉCIFICATION DU SYSTÈME DE MATCH**

---

# **1\. LE PRINCIPE**

Le match est une simulation tactique de handball dans laquelle le joueur prend des décisions pendant que le jeu simule les déplacements.

Le joueur ne contrôle pas une représentation humaine.

Il contrôle :

* le ballon ;  
* les intentions des joueurs ;  
* les déplacements ;  
* les combinaisons ;  
* les priorités ;  
* les décisions défensives ;  
* le rythme ;  
* les changements tactiques.

À l’écran :

* les joueurs sont des cercles ;  
* le ballon est un petit marqueur ;  
* les déplacements sont des trajectoires ;  
* les zones sont matérialisées ;  
* les actions sont représentées par des flèches et indicateurs.

---

# **2\. LE MATCH N’EST PAS STRICTEMENT TOUR PAR TOUR**

Le meilleur fonctionnement est :

## **Simulation → pause décisionnelle → simulation → pause.**

Le jeu avance normalement.

Lorsqu’une situation importante apparaît, il peut :

* continuer ;  
* ralentir ;  
* ou se mettre en pause.

Le joueur décide.

Puis le jeu reprend.

---

# **3\. TROIS NIVEAUX DE TEMPS**

### **Vitesse x1**

Simulation normale.

### **Vitesse x2**

Pour les phases sans décision importante.

### **Pause**

Lorsqu’une décision tactique est disponible.

Le joueur peut également provoquer lui-même une pause.

---

# **4\. UNE POSSESSION**

Chaque possession suit globalement :

Récupération  
↓  
Transition  
↓  
Installation  
↓  
Construction  
↓  
Création de décalage  
↓  
Occasion  
↓  
Tir / perte / faute  
↓  
Transition adverse

Mais le joueur peut intervenir à presque toutes ces étapes.

---

# **5\. LE TERRAIN**

Le terrain n’est pas divisé en cases fixes.

Il est continu.

Mais plusieurs **zones tactiques** existent :

AILE G     1-2     2-3     CENTRE     3-2     2-1     AILE D  
                         9 M  
                    ───────────  
                         6 M

Les joueurs peuvent se déplacer librement.

Les zones servent à comprendre et calculer les situations.

---

# **6\. CE QUE LE JOUEUR VOIT**

Chaque cercle affiche éventuellement :

* numéro ;  
* nom abrégé ;  
* fatigue ;  
* ballon ;  
* statut ;  
* cible défensive.

Exemple :

            ○ 11 Yanis  
                   ↓  
       ○ 8 Aaron      ○ 9 Erwan

                ● BALLON

       ○ 10 Edgar

Les informations inutiles peuvent être masquées pour garder l’écran propre.

---

# **7\. SÉLECTIONNER UN JOUEUR**

Cliquer sur un joueur ouvre son menu.

Exemple :

**Aaron — ballon**

ATTAQUER  
PASSER  
FIXER  
DRIBBLER  
TIRER  
SE DÉPLACER  
FEINTER  
COMBINAISON  
TEMPORISER  
---

# **8\. SI LE JOUEUR N’A PAS LE BALLON**

Le menu devient :

COURIR  
FIXER  
BLOQUER  
CROISER  
SE DÉCALER  
COUPER  
ATTENDRE  
APPEL  
FAIRE SEMBLANT  
REVENIR

La différence est fondamentale.

Le joueur ne contrôle donc pas uniquement le porteur.

---

# **9\. CONTRÔLER PLUSIEURS JOUEURS**

Le joueur peut préparer une séquence.

Par exemple :

### **Aaron**

attaque intérieur.

### **Erwan**

vient vers Aaron.

### **Edgar**

fixe son défenseur.

### **Yanis**

coupe derrière.

Le jeu affiche alors :

Aaron → intérieur  
Erwan ↗  
Edgar █  
Yanis ↘

Puis le joueur appuie :

**EXÉCUTER**

La séquence commence.

---

# **10\. ORDRES INDIVIDUELS**

Un ordre peut être :

### **Déplacement**

« Va ici. »

### **Intention**

« Cherche à fixer. »

### **Menace**

« Fais croire que tu vas recevoir. »

### **Bloc**

« Bloque ce défenseur. »

### **Priorité**

« Cherche Aaron. »

Le joueur ne programme pas chaque centimètre du déplacement.

Il donne une intention.

Les statistiques déterminent ensuite la qualité d’exécution.

---

# **11\. LE PORTEUR DE BALLE**

Quand Aaron reçoit, le jeu affiche les possibilités.

Exemple :

ACTIONS

Duel intérieur  
Duel extérieur  
Passe Erwan  
Passe Yanis  
Passe Edgar  
Recul  
Tir  
Feinte  
Combinaison

Mais ces options sont générées selon la situation.

Si Edgar est parfaitement couvert :

« Passe Edgar » peut être grisée ou indiquée comme très risquée.

---

# **12\. LE JOUEUR NE VOIT PAS UNE PROBABILITÉ PARFAITE**

Il peut voir :

### **Très favorable**

### **Favorable**

### **Neutre**

### **Risqué**

### **Très risqué**

ou éventuellement une estimation numérique en mode expert.

Exemple :

Duel Aaron/Maël : favorable.

Mais le joueur ne connaît pas nécessairement la probabilité exacte.

---

# **13\. MODE EXPERT**

Pour les joueurs qui veulent tout voir :

Duel intérieur  
72 %

Passe Erwan  
81 %

Passe Edgar  
42 %

Tir  
61 %

Mais ces chiffres représentent une **estimation du moteur**, pas une certitude.

---

# **14\. ATTAQUER UNE ZONE**

Le joueur peut cliquer sur une zone.

Exemple :

**Aaron → intervalle 2–3**

Le moteur calcule :

* distance ;  
* défenseur ;  
* aide ;  
* espace ;  
* accélération ;  
* fatigue ;  
* historique.

---

# **15\. ATTAQUER UN DÉFENSEUR**

Le joueur peut également cibler directement :

**Aaron → Maël**

Cela crée un duel.

Le jeu peut afficher :

AARON  
Puissance       95  
Accélération    85  
Duel            93

MAËL  
Puissance       88  
Anticipation    82  
Défense         80

Mais l’issue dépend également de la situation.

---

# **16\. CHOIX DE DIRECTION**

Lors d’un duel :

← gauche  
↑ intérieur  
→ droite  
↓ recul

Le joueur choisit une direction.

Le défenseur peut anticiper.

---

# **17\. FEINTE DE DIRECTION**

Le joueur peut faire :

Feinte gauche  
→ vraie attaque droite

ou :

Feinte tir  
→ pénétration

Cela consomme du temps.

Une feinte réussie peut déplacer le défenseur.

---

# **18\. TIMING**

Une action peut être :

### **immédiate**

### **retardée**

### **après déplacement d’un coéquipier**

### **après bloc**

### **après fixation**

### **après changement de côté**

Exemple :

Aaron :

« attends qu’Erwan fixe »

puis :

« attaque ».

---

# **19\. LE SYSTÈME DE MENACES**

Chaque joueur crée une menace.

Une défense doit décider :

Qui dois-je respecter ?

Exemple :

Aaron \= menace tir  
Erwan \= menace tir  
Edgar \= menace fixation  
Yanis \= menace passe

Le joueur peut exploiter cette surcharge.

---

# **20\. CRÉER UN SURNOMBRE**

Le but d’une combinaison n’est pas nécessairement de passer immédiatement.

On cherche :

2 défenseurs contre 3 menaces.

Exemple :

Aaron attire Maël.

Erwan attire Kaël.

Edgar fixe le pivot.

Yanis devient libre.

---

# **21\. LE JOUEUR PEUT DÉPLACER LE SURNOMBRE**

Il peut décider :

« Je veux que la supériorité soit à gauche. »

Le système offensif doit alors déplacer les menaces.

---

# **22\. FIXATION**

Le joueur choisit :

**FIXER**

Puis :

* défenseur ciblé ;  
* direction ;  
* durée.

Exemple :

Aaron fixe Maël pendant qu’Erwan arrive.

---

# **23\. FIXATION MULTIPLE**

Un joueur peut chercher à attirer :

* 1 défenseur ;  
* 2 défenseurs.

Mais attirer deux défenseurs augmente :

* risque ;  
* fatigue ;  
* possibilité de perte.

---

# **24\. PASSE**

Une passe possède plusieurs paramètres.

### **Cible**

Qui ?

### **Type**

* directe ;  
* rapide ;  
* lobée ;  
* dans le dos ;  
* cachée.

### **Timing**

Maintenant / après déplacement.

### **Puissance**

Faible / normale / forte.

---

# **25\. PASSE CACHÉE**

Exemple :

Aaron regarde Edgar.

La défense pense :

Edgar.

Aaron sert Yanis.

La qualité dépend de :

* vision ;  
* passe ;  
* feinte ;  
* historique ;  
* anticipation adverse.

---

# **26\. PASSE SOUS PRESSION**

Une passe peut être :

* libre ;  
* légèrement pressée ;  
* très pressée ;  
* sous contact.

La qualité du passeur diminue avec la pression.

---

# **27\. RÉCEPTION**

Le receveur peut :

### **réceptionner normalement**

### **réceptionner en mouvement**

### **réceptionner sous pression**

### **laisser passer**

### **réceptionner et tirer**

### **réceptionner et repartir**

---

# **28\. PASSE \+ COURSE**

Le joueur peut demander :

Aaron → Yanis

et :

Yanis → courir derrière la défense.

Cela crée une séquence.

---

# **29\. PASSE-ET-VA**

Le joueur peut commander :

Passe → déplacement immédiat.

Exemple :

Aaron passe à Erwan.

Aaron repart.

Erwan peut lui remettre.

---

# **30\. CROISEMENT**

Deux joueurs peuvent croiser.

Exemple :

Aaron →→  
        ↘  
Erwan ↗

La défense doit décider :

* suivre ;  
* changer ;  
* passer dessous ;  
* passer dessus ;  
* aider.

---

# **31\. CROISEMENT AVEC TROISIÈME JOUEUR**

Trois joueurs peuvent participer.

Exemple :

Yanis → Aaron → Erwan.

Le jeu doit permettre des combinaisons de ce type sans les coder individuellement.

---

# **32\. COMBINAISONS CRÉÉES PAR LE JOUEUR**

Le joueur peut enregistrer une combinaison.

Exemple :

**Nouvelle combinaison**

1. Pierre fixe.  
2. Passe Erwan.  
3. Erwan fixe.  
4. Aaron croise.  
5. Edgar bloque.  
6. Yanis coupe.  
7. Choisir la meilleure sortie.

La combinaison devient une séquence réutilisable.

---

# **33\. MAIS UNE COMBINAISON N’EST PAS UNE CINÉMATIQUE**

C’est extrêmement important.

Si le défenseur réagit différemment :

la combinaison doit pouvoir bifurquer.

Exemple :

SI Kaël sort  
→ passe Yanis

SI Kaël reste  
→ Aaron attaque

SI Maël change  
→ Edgar reçoit  
---

# **34\. ARBRE DE DÉCISION**

Le joueur peut programmer des réponses.

SI défenseur sort  
    → passe

SINON  
    → duel

Cela permet de construire de véritables systèmes.

---

# **35\. DÉFENSE**

Quand l’adversaire attaque, le joueur passe en mode défensif.

Chaque défenseur possède :

* cible ;  
* zone ;  
* distance ;  
* priorité.

---

# **36\. SORTIR**

Cliquer sur un défenseur :

**SORTIR**

Puis choisir :

* sur le porteur ;  
* sur une zone ;  
* sur un joueur.

---

# **37\. FERMER UNE LIGNE**

Le défenseur peut :

fermer passe Aaron → Yanis.

Il ne cherche donc pas forcément le ballon.

---

# **38\. ANTICIPER**

Le joueur peut ordonner :

anticiper passe.

Avantage :

* interception possible.

Risque :

* espace laissé derrière.

---

# **39\. DÉFENDRE SANS ANTICIPER**

Ordre :

rester discipliné.

Moins spectaculaire.

Mais plus sûr.

---

# **40\. AIDE DÉFENSIVE**

Un défenseur peut recevoir :

priorité : aider Maël.

Si Aaron bat Maël :

Layo vient.

Mais son départ crée un autre espace.

---

# **41\. CHANGEMENT**

Deux défenseurs peuvent recevoir :

échangez vos adversaires.

Exemple :

Kaël ↔ Maël.

Le changement peut échouer si le timing est mauvais.

---

# **42\. PIÈGE**

Deux défenseurs peuvent volontairement enfermer le porteur.

Exemple :

Aaron entre.

Kaël \+ Layo ferment.

Mais Edgar devient libre.

---

# **43\. MARQUAGE STRICT**

Le joueur sélectionne :

**Kaël → Yanis**

Puis :

### **strict**

Kaël suit Yanis.

Conséquence :

* Yanis est perturbé ;  
* mais Kaël quitte davantage sa zone.

---

# **44\. MARQUAGE À DISTANCE**

Kaël reste dans sa zone mais surveille Yanis.

Il peut couper sa passe.

---

# **45\. DÉFENSE 1-5**

Le joueur sélectionne :

**Système → 1-5**

Puis :

joueur avancé \= Kaël.

Il peut également définir :

cible principale \= Yanis.

---

# **46\. DÉFENSE 1-2-3**

Le joueur peut définir :

Joueur 1 : haut  
Joueur 2 : intermédiaire  
Joueur 3 : intermédiaire

Puis attribuer :

* pression ;  
* dissuasion ;  
* aide.

---

# **47\. DÉFENSE ADAPTATIVE**

Le système peut fonctionner avec :

priorité Yanis.

Mais si Aaron devient centre :

l’IA peut comprendre :

nouvelle menace principale \= Aaron.

Elle doit décider si elle :

* continue le plan ;  
* abandonne Yanis ;  
* alterne ;  
* passe en défense différente.

---

# **48\. LE JOUEUR PEUT AUSSI TROMPER L’IA**

C’est essentiel.

Si Lagny marque strictement Yanis :

le joueur peut volontairement donner l’impression de continuer à jouer par Yanis.

Puis Aaron prend le centre.

---

# **49\. RÉGLAGE DU TEMPO**

Le joueur dispose d’une commande :

TEMPO

Très lent  
Lent  
Normal  
Rapide  
Très rapide

Mais il peut aussi modifier le tempo **pendant une possession**.

Exemple :

lent → accélération brutale.

---

# **50\. TEMPO ET FATIGUE**

Un rythme élevé :

* augmente les occasions ;  
* augmente la fatigue ;  
* augmente les erreurs.

Un rythme lent :

* réduit le nombre de possessions ;  
* permet de récupérer ;  
* donne plus de temps à la défense.

---

# **51\. TRANSITION OFFENSIVE**

Après interception :

le joueur reçoit immédiatement :

CONTRE

Aile gauche  
Centre  
Aile droite  
Passe longue  
Temporiser  
---

# **52\. TRANSITION DÉFENSIVE**

Après perte :

REPLI

Tous  
Priorité centre  
Priorité ailier  
Pression porteur  
Couper passe  
---

# **53\. GARDIEN**

Lorsqu’un tir est possible :

le joueur peut décider :

### **position**

* ligne ;  
* avancé.

### **anticipation**

* faible ;  
* moyenne ;  
* forte.

### **zone privilégiée**

* premier poteau ;  
* deuxième ;  
* centre ;  
* haut ;  
* bas.

---

# **54\. DUEL TIREUR/GARDIEN**

Le tireur choisit :

ZONE  
TYPE  
PUISSANCE  
EFFET  
TIMING

Le gardien choisit :

POSITION  
ANTICIPATION  
DIRECTION  
TIMING

Les deux décisions sont comparées.

---

# **55\. ROucOULETTE**

La roucoulette est une option technique.

Elle possède :

* difficulté ;  
* précision ;  
* effet ;  
* préférence du joueur.

Un gardien qui connaît la tendance de Malone peut commencer à anticiper.

---

# **56\. LE GARDIEN APPREND**

Après plusieurs tirs :

Malone :  
aile gauche  
→ deuxième poteau  
→ roucoulette

Le gardien augmente son anticipation.

Mais Malone peut changer.

---

# **57\. JEU À 7**

Le bouton :

**SORTIR GARDIEN**

fait apparaître :

Entrant :  
Rio

Position :  
centre / arrière / ailier

Le joueur choisit.

---

# **58\. RISQUE DU JEU À 7**

Si Nangis perd la balle :

BUT VIDE

La probabilité dépend :

* distance de récupération ;  
* vitesse adverse ;  
* position du gardien ;  
* temps de réaction.

---

# **59\. RETOUR DU GARDIEN**

Le joueur peut ordonner :

Rio → retour but.

Mais Rio peut également avoir une logique autonome :

si perte imminente → retour.

---

# **60\. DEUX PIVOTS**

Le joueur peut activer :

**2 PIVOTS**

Puis définir :

* pivot gauche ;  
* pivot droit.

Chaque pivot possède :

* bloc ;  
* fixation ;  
* déplacement ;  
* sortie.

---

# **61\. CRÉER UNE OUVERTURE POUR MALONE**

Exemple :

Karim → bloc  
Maël → fixation  
Kaël → croisement  
Malone → déplacement

Objectif :

créer une aile libre.

Le jeu doit pouvoir comprendre cet objectif.

---

# **62\. OBJECTIFS TACTIQUES**

Le joueur peut donner un objectif :

### **créer une occasion pour Malone**

### **attaquer Maël**

### **chercher Erwan**

### **isoler Aaron**

### **faire sortir Kaël**

### **jouer le pivot**

### **fatiguer la défense**

### **ralentir le match**

L’IA des coéquipiers adapte alors ses décisions.

---

# **63\. PRIORITÉS**

Le joueur peut définir :

Priorité 1 : Aaron  
Priorité 2 : Erwan  
Priorité 3 : Edgar

Mais une priorité n’est pas une obligation.

Si Aaron est totalement couvert :

le jeu peut choisir Erwan.

---

# **64\. STYLE D’ATTAQUE**

Le joueur choisit :

### **prudent**

Peu de pertes.

### **équilibré**

### **agressif**

Plus de risques.

### **créatif**

Plus de décisions imprévisibles.

### **physique**

Recherche de duels.

---

# **65\. STYLE DÉFENSIF**

### **compact**

### **agressif**

### **anticipation**

### **individuel**

### **collectif**

### **hybride**

---

# **66\. LE JOUEUR PEUT MODIFIER LE PLAN EN PLEIN MATCH**

Exemple :

« On ne cherche plus Yanis. Aaron devient centre. »

Une seule instruction peut modifier :

* positions ;  
* déplacements ;  
* priorités ;  
* combinaisons.

---

# **67\. TEMPS MORT**

Appuyer :

**TEMPS MORT**

ouvre :

TACTIQUE  
MARQUAGE  
SYSTÈME  
TEMPO  
REMPLACEMENT  
MESSAGE  
---

# **68\. MESSAGE**

Le joueur peut choisir :

Calmer

Accélérer

Continuer le plan

Changer

Exploiter un joueur

Le message influence le mental.

---

# **69\. REMPLACEMENT**

Sélection :

**Sortir → Yanis**

**Entrer → Léo**

Puis :

rôle de Léo \= centre.

Le système s’adapte.

---

# **70\. CHANGEMENT DE POSTE**

Le joueur peut faire :

Aaron :

arrière droit → centre.

Il faut cependant tenir compte de sa maîtrise du poste.

---

# **71\. POSTE NON NATUREL**

Un joueur peut occuper un poste inhabituel.

Conséquences possibles :

* moins bonne compréhension ;  
* mauvais placement ;  
* mais avantage tactique inattendu.

Aaron est justement un cas exceptionnel.

---

# **72\. COACHING EN DIRECT**

Le joueur peut préparer des règles :

SI Yanis est strictement marqué  
→ Aaron devient centre

SI Malone reçoit libre  
→ Elian le suit

SI fatigue \> 75  
→ ralentir

SI retard ≥ 3  
→ jeu rapide

Cela permet de créer une IA personnelle.

---

# **73\. PLAN AVANT MATCH**

Avant le match :

### **composition**

### **remplaçants**

### **système**

### **priorités**

### **marquages**

### **combinaisons**

### **règles conditionnelles**

### **tempo**

### **stratégie gardien**

---

# **74\. SCOUTING**

Avant un match déjà étudié :

le joueur peut connaître :

Malone aime l’aile.

Kaël lit les combinaisons.

Maël est dangereux dans le duel.

Mais ces informations peuvent être :

* exactes ;  
* approximatives ;  
* incomplètes.

---

# **75\. PENDANT LE MATCH**

Le joueur découvre :

OBSERVATION

Kaël sort beaucoup sur Yanis.

→ confiance de l'information : 87 %

Puis :

Nouvelle observation :

Kaël semble désormais surveiller Aaron.

→ confiance : 64 %  
---

# **76\. CARTE TACTIQUE**

À tout moment :

**ANALYSE**

Le terrain devient une carte.

Le jeu affiche :

* zones exploitées ;  
* zones fermées ;  
* joueurs surchargés ;  
* lignes de passe ;  
* déplacements ;  
* menaces.

---

# **77\. CARTE DES DUELS**

Exemple :

Aaron vs Maël  
7 situations

Aaron : 5 réussites  
Maël : 2 réussites

Mais aussi :

Maël ferme principalement l’intérieur.

Cela donne une information tactique.

---

# **78\. CARTE DES PASSES**

Le jeu peut montrer :

Yanis → Aaron : 8  
Yanis → Erwan : 11  
Aaron → Erwan : 7  
Aaron → Edgar : 3

Le joueur voit ses habitudes.

L’adversaire les voit également progressivement.

---

# **79\. EXPLOITATION DES HABITUDES**

Une équipe peut devenir prévisible.

Exemple :

Nangis :

Yanis → Erwan

très fréquent.

Lagny commence à couper.

Le joueur doit :

casser son propre pattern.

---

# **80\. CRÉER DES PATTERNS**

Le joueur peut volontairement créer :

A  
A  
A  
A  
B

La défense s’attend à A.

B devient beaucoup plus efficace.

---

# **81\. CONTRE-ADAPTATION**

Mais si l’adversaire comprend :

« Il répète A pour préparer B. »

il peut attendre B.

Le jeu crée ainsi plusieurs niveaux de mindgame.

---

# **82\. MÉMOIRE DE L’IA**

La mémoire doit avoir une limite.

L’IA ne doit pas avoir une connaissance parfaite.

Elle conserve :

* actions récentes ;  
* patterns ;  
* duels ;  
* joueurs ciblés ;  
* systèmes observés.

Plus l’action est récente :

plus elle influence la décision.

---

# **83\. OUBLI**

Une vieille information perd progressivement de l’importance.

Cela permet au joueur de changer de style.

---

# **84\. ADAPTATION DES JOUEURS**

Un joueur intelligent peut lui-même apprendre.

Exemple :

Aaron :

Maël ferme intérieur.

Après plusieurs duels :

Aaron augmente la probabilité d’attaquer extérieur.

---

# **85\. LE JOUEUR PEUT DONNER UNE CONSIGNE CONTRAIRE**

« Continue d’attaquer intérieur malgré le risque. »

Pourquoi ?

Parce qu’il peut vouloir :

* fatiguer Maël ;  
* provoquer une faute ;  
* préparer un changement.

---

# **86\. GESTION DU SCORE**

Le score modifie les stratégies.

Si :

**\+3**

Le joueur peut :

ralentir.

Si :

**−3**

Il peut :

accélérer.

Mais le moteur doit éviter les comportements caricaturaux.

---

# **87\. GESTION DE LA FIN DE MATCH**

À 58 minutes :

le jeu affiche :

TEMPS RESTANT : 2:00  
SCORE : 28-28

Chaque décision devient plus importante.

---

# **88\. DERNIÈRE POSSESSION**

Le joueur peut choisir :

### **jouer rapidement**

### **construire**

### **chercher faute**

### **tirer à la dernière seconde**

### **conserver.**

Le moteur doit respecter le temps.

---

# **89\. TIR AVANT BRAS LEVÉ**

Le jeu doit gérer :

possession passive / avertissement.

Cela crée une contrainte temporelle.

---

# **90\. CHRONOMÈTRE TACTIQUE**

Le joueur voit :

Temps  
Possession  
Temps depuis dernière action

Cela permet d’apprendre à gérer une possession.

---

# **91\. STATISTIQUES EN DIRECT**

À droite :

NANGIS 24  
LAGNY 23

Possessions : 42 / 41

Efficacité :  
Nangis 57 %  
Lagny 55 %

Pertes :  
Nangis 7  
Lagny 6

Tirs :  
Nangis 32  
Lagny 30  
---

# **92\. STATISTIQUE LA PLUS IMPORTANTE**

Le jeu doit afficher :

**efficacité par type de situation.**

Exemple :

Attaque 6-0 : 61 %  
Attaque 1-5 : 49 %  
Attaque 1-2-3 : 67 %

Aaron centre : 74 %  
Yanis centre : 63 %

Attaque Maël : 72 %  
Attaque côté opposé : 51 %

Cela permet au joueur de comprendre.

---

# **93\. ANALYSE AUTOMATIQUE**

Après une séquence :

« La défense a déplacé Kaël hors de sa zone. »

ou :

« Maël a reçu une aide sur 4 des 5 dernières possessions. »

ou :

« Yanis est marqué strictement depuis 3 possessions. »

Ces informations ne donnent pas la solution.

Elles montrent le problème.

---

# **94\. LE JOUEUR DOIT TROUVER LA SOLUTION**

Le jeu ne doit jamais dire :

« Fais Aaron centre. »

Il doit dire :

« Yanis reçoit 38 % moins de ballons depuis que Kaël le suit. »

Au joueur de comprendre.

---

# **95\. MODE MANGA**

Le premier match :

**Nangis vs Lagny**

peut avoir un mode spécial :

### **« Match du Cid Prince »**

Toutes les statistiques et profils sont calibrés à partir du match.

Mais :

**aucune action n’est scriptée.**

---

# **96\. OBJECTIF DU TEST**

Le joueur joue Nangis.

L’IA joue Lagny.

Le but est simplement :

gagner.

Mais Lagny doit être suffisamment intelligent pour produire naturellement :

* marquage de Yanis ;  
* adaptation ;  
* utilisation de Maël ;  
* jeu à 7 ;  
* recherche de Malone ;  
* changements défensifs ;  
* exploitation des erreurs.

Sans jamais les imposer.

---

# **97\. EXEMPLE DE PARTIE**

Début :

Yanis reçoit.

Le joueur choisit :

Yanis → Aaron.

Kaël observe.

Possession suivante :

Kaël commence à fermer Aaron.

Le joueur choisit :

Yanis → Erwan.

Kaël s’adapte.

Troisième possession :

Le joueur fait croire à Erwan.

Puis :

Aaron → Edgar.

La défense commence à hésiter.

---

# **98\. LA PARTIE PEUT ALORS DIVERGER DU MANGA**

Dans le manga :

Kaël finit par neutraliser Yanis.

Dans le jeu :

le joueur peut réussir à maintenir Yanis dominant.

Résultat :

Lagny doit inventer une autre réponse.

C’est précisément ce que l’on veut.

---

# **99\. EXEMPLE DE RÉACTION IA**

Si Yanis domine :

ANALYSE LAGNY

Yanis :  
8/10 décisions positives

Kaël :  
efficacité du marquage insuffisante

NOUVELLE PROPOSITION :  
passage en 1-5

Cible :  
Yanis

Le coach décide.

---

# **100\. MAIS L’IA PEUT SE TROMPER**

Kaël peut choisir :

mauvais système.

Le joueur peut exploiter cette erreur.

Les coachs et joueurs ont donc eux aussi des qualités différentes.

---

# **101\. QUALITÉ DU COACH**

Statistiques :

* lecture ;  
* adaptation ;  
* gestion du temps ;  
* communication ;  
* créativité tactique.

Arthur peut être différent d’Alex.

---

# **102\. INFORMATION ET INCERTITUDE**

L’IA peut avoir :

60 % de confiance.

Elle prend une décision.

Mais elle peut se tromper.

Cela rend les matchs humains.

---

# **103\. LE JOUEUR AUSSI A DE L’INCERTITUDE**

En mode normal, le joueur peut ne pas connaître :

* la fatigue exacte adverse ;  
* les intentions exactes ;  
* les statistiques exactes ;  
* le niveau de confiance du gardien.

Il doit lire le jeu.

---

# **104\. MODE DEVELOPPEUR COMPLET**

Pour le développement et le test :

le développeur peut activer :

JOURNAL TECHNIQUE HORS EXPERIENCE DE JEU

Cela affiche :

* toutes les statistiques ;
* toutes les intentions ;
* toutes les probabilites estimees ;
* toutes les decisions IA ;
* etat interne serialise ;
* journal des evenements ;
* valeurs de test et seed de reproduction.

Cet outil n est pas un mode de jeu et n est jamais visible par le joueur. Il
sert uniquement a reproduire un bug, inspecter une resolution et verifier le
moteur pendant le developpement. Le mode developpeur complet reste un outil
technique hors experience joueur.

Très utile pour debugger.

---

# **105\. MODE NORMAL**

Le joueur voit seulement ce qu’un entraîneur/joueur pourrait raisonnablement observer.

---

# **106\. MODE EXPERT**

Le joueur voit :

* estimations ;  
* tendances ;  
* probabilités ;  
* fatigue ;  
* historique.

---

# **107\. MODE DIFFICILE**

Le jeu masque davantage les informations.

Le joueur doit réellement lire.

---

# **108\. ACTIONS SIMPLES, CONSÉQUENCES COMPLEXES**

Le jeu ne doit pas avoir 1000 commandes.

Il doit avoir environ une vingtaine de primitives :

PASSER  
TIRER  
DRIBBLER  
DÉFIER  
FIXER  
FEINTER  
COURIR  
CROISER  
BLOQUER  
COUPER  
ATTENDRE  
RECULER  
PRESSER  
MARQUER  
AIDER  
INTERCEPTER  
CHANGER  
TEMPORISER  
CONTRE-ATTAQUER  
REVENIR

Puis :

cible \+ direction \+ timing \+ intention

créent la diversité.

---

# **109\. LE JOUEUR CONSTRUIT DES SÉQUENCES**

Exemple :

Aaron  
↓  
attaque intérieur

Erwan  
↓  
bloc

Edgar  
↓  
fixation

Yanis  
↓  
course extérieure

Aaron  
↓  
passe Yanis

Mais à chaque étape :

le joueur peut reprendre la main.

---

# **110\. INTERRUPTIONS**

Si quelque chose d’inattendu arrive :

Maël anticipe.

Le jeu peut mettre en pause :

RÉACTION

Maël est sorti.

Nouvelles options :

Aaron :  
passer Edgar  
continuer  
reculer

Le joueur adapte.

---

# **111\. C’EST LE CŒUR DU JEU**

Une combinaison préparée n’est donc jamais garantie.

Elle ressemble davantage à :

« Je prépare une situation favorable, puis je regarde comment la défense répond. »

---

# **112\. OBJECTIF ULTIME DU GAMEPLAY**

Le joueur doit progressivement apprendre à penser :

« Si je fais X, il va probablement faire Y. »

Puis :

« Il sait que je vais faire X, donc il va probablement faire Y. »

Puis :

« Il sait que je sais qu’il va faire Y. »

C’est cette profondeur qui rapproche le jeu de l’esprit du match Nangis–Lagny.

---

# **113\. PREMIER PROTOTYPE CONCRET**

Pour coder immédiatement, il suffit de commencer avec :

## **ÉCRAN**

Terrain abstrait.

## **JOUEURS**

14 cercles.

## **BALLON**

1 cercle.

## **MENU**

Sélection joueur.

## **ACTIONS**

* passer ;  
* courir ;  
* fixer ;  
* tirer ;  
* défendre.

## **RÉSOLUTION**

Stats \+ position \+ défense \+ hasard contrôlé.

Puis ajouter progressivement :

* combinaisons ;  
* systèmes ;  
* fatigue ;  
* mémoire ;  
* IA ;  
* gardiens ;  
* jeu à 7\.

---

# **114\. PREMIÈRE BOUCLE JOUABLE**

Le joueur lance :

**NANGIS — LAGNY**

Puis :

### **1\.**

Le jeu place les joueurs.

### **2\.**

Yanis possède le ballon.

### **3\.**

Le joueur sélectionne Yanis.

### **4\.**

Il choisit :

passer → Aaron.

### **5\.**

Le jeu montre la réponse de Kaël.

### **6\.**

Le joueur peut interrompre.

### **7\.**

Aaron reçoit.

### **8\.**

Il choisit :

duel → Maël → intérieur.

### **9\.**

Maël réagit.

### **10\.**

Résolution.

### **11\.**

La situation évolue.

### **12\.**

Nouvelle décision.

Et ainsi de suite.

---

# **115\. LE MATCH DOIT ÊTRE JOUABLE AVANT LES GRAPHISMES**

Même avec ceci :

○ Aaron  
○ Yanis  
○ Erwan  
○ Edgar

○ Kaël  
○ Maël  
○ Malone

● ballon

le jeu doit déjà être amusant.

Si ce n’est pas le cas :

les graphismes ne régleront pas le problème.

---

# **116\. VERSION 0.1**

La version minimale jouable doit avoir exactement :

### **OFFENSIVE**

* déplacement ;  
* passe ;  
* duel ;  
* fixation ;  
* tir.

### **DÉFENSIVE**

* déplacement ;  
* marquage ;  
* sortie ;  
* aide ;  
* interception.

### **BALLON**

* possession ;  
* passes ;  
* pertes ;  
* tirs.

### **GARDIEN**

* positionnement ;  
* anticipation ;  
* arrêt.

### **MATCH**

* score ;  
* chronomètre ;  
* possessions.

---

# **117\. VERSION 0.2**

Ajouter :

* blocs ;  
* croisements ;  
* feintes ;  
* systèmes 6-0 / 1-5 / 1-2-3 ;  
* fatigue ;  
* remplacements ;  
* temps morts.

---

# **118\. VERSION 0.3**

Ajouter :

* mémoire ;  
* apprentissage ;  
* patterns ;  
* contre-adaptation ;  
* jeu à 7 ;  
* deux pivots ;  
* coaching conditionnel.

---

# **119\. VERSION 0.4**

Ajouter :

* mental ;  
* relations ;  
* personnalité ;  
* coaching ;  
* scouting ;  
* statistiques avancées.

---

# **120\. VERSION 1.0**

À ce stade :

**le joueur doit pouvoir jouer exactement le match Nangis–Lagny comme une partie de jeu vidéo**, sans que le jeu connaisse le déroulement original.

Et surtout :

il doit être possible de créer une situation où :

Yanis domine Kaël.

ou :

Kaël détruit Yanis.

ou :

Aaron devient centre.

ou :

Malone porte Lagny.

ou :

Maël bat Aaron.

ou :

Rio transforme complètement le jeu.

ou :

le jeu à 7 provoque une victoire.

ou :

le jeu à 7 provoque une défaite.

Toutes ces possibilités doivent émerger des règles.

---

# **121\. RÈGLE FINALE**

Le joueur ne doit pas jouer :

« des animations de handball ».

Il doit jouer :

**les décisions qui produisent le handball.**

Et le système ne doit pas lui demander :

« Quelle scène du manga veux-tu reproduire ? »

Il doit lui demander :

**« Face à cette situation, qu’est-ce que tu fais ? »**

Puis l’adversaire répond.

Puis le joueur répond à la réponse.

Puis l’adversaire s’adapte.

C’est cette boucle qui constitue le gameplay.

