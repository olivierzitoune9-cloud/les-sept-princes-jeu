# **LES SEPT PRINCES PROTOTYPE JOUABLE**

## **Match test : Nangis vs Lagny — système de handball tactique**

---

# **0\. OBJECTIF DU PROTOTYPE**

Le prototype doit permettre de lancer immédiatement un match de handball 6 contre 6 \+ gardien, avec :

* Nangis vs Lagny ;  
* les joueurs des chapitres 44 à 48 ;  
* leurs caractéristiques individuelles ;  
* leurs aptitudes particulières ;  
* leurs rôles ;  
* leurs relations/synergies ;  
* leurs systèmes tactiques ;  
* une IA capable de prendre des décisions ;  
* un système de fatigue ;  
* un système de mental ;  
* un système d’apprentissage pendant le match ;  
* des gardiens réellement décisionnels ;  
* des changements de système ;  
* des remplacements ;  
* des temps morts ;  
* une gestion du score et du chronomètre ;  
* une résolution non scriptée des actions ;  
* une possibilité pour le joueur de gagner, perdre ou modifier complètement le déroulement du match.

**Le scénario des chapitres 44–48 sert uniquement de référence de calibration.**

Le moteur ne doit jamais dire :

« À la 22e minute, Yanis sort. »

Il doit pouvoir produire :

« Yanis est en difficulté depuis plusieurs possessions, son efficacité chute, Kaël le neutralise et Nangis décide de modifier son organisation. »

ou, si le joueur intervient différemment :

« Yanis détruit le marquage de Kaël et reste sur le terrain. »

Le match du manga devient donc un **boss de référence**, pas une cinématique interactive.

---

# **1\. PHILOSOPHIE DU MOTEUR**

Le jeu repose sur une idée centrale :

**Une action n’est jamais simplement une action. C’est une décision prise dans une situation donnée, à laquelle l’adversaire répond.**

Exemple :

Aaron reçoit.

Le joueur ne choisit pas seulement :

* tirer.

Il choisit potentiellement :

* tirer immédiatement ;  
* feinter le tir ;  
* attaquer intérieur ;  
* attaquer extérieur ;  
* fixer un défenseur ;  
* chercher Erwan ;  
* chercher Edgar ;  
* ressortir ;  
* ralentir ;  
* accélérer ;  
* changer de direction ;  
* attendre un bloc ;  
* demander un bloc ;  
* provoquer un duel ;  
* transmettre avant le contact.

Puis le défenseur peut :

* sortir ;  
* rester ;  
* fermer intérieur ;  
* fermer extérieur ;  
* anticiper la passe ;  
* aider ;  
* changer ;  
* provoquer le contact ;  
* reculer.

Puis le gardien peut :

* rester ;  
* avancer ;  
* fermer un angle ;  
* anticiper une zone ;  
* attendre le dernier moment ;  
* lire le geste du tireur.

La résolution dépend donc de l’ensemble de la situation.

---

# **2\. STRUCTURE FONDAMENTALE D’UNE ACTION**

Chaque action possède quatre éléments :

## **2.1 Intention**

Ce que le joueur veut faire.

Exemples :

* passe ;  
* tir ;  
* duel ;  
* fixation ;  
* déplacement ;  
* bloc ;  
* interception ;  
* sortie défensive.

## **2.2 Cible**

Vers qui ou vers quelle zone l’action est dirigée.

Exemples :

* Erwan ;  
* Yanis ;  
* Edgar ;  
* aile gauche ;  
* pivot ;  
* intervalle 2–3.

## **2.3 Exécution**

Comment l’action est exécutée.

Exemples :

* passe rapide ;  
* passe lobée ;  
* passe dans le dos ;  
* passe sautée ;  
* tir en appui ;  
* tir en suspension ;  
* roucoulette ;  
* changement de direction ;  
* double pas.

## **2.4 Timing**

Quand l’action est réalisée.

C’est extrêmement important.

Une bonne passe :

* trop tôt → défenseur encore disponible ;  
* trop tard → intervalle fermé.

Un bloc :

* trop tôt → défenseur le contourne ;  
* au bon moment → avantage offensif ;  
* trop tard → inutile.

Le timing doit donc être une statistique/mécanique à part entière.

---

# **3\. LES STATISTIQUES DES JOUEURS**

Les joueurs ne doivent pas avoir seulement une note générale.

La note générale est une **synthèse**, pas une caractéristique utilisée directement par le moteur.

## **3.1 Physique**

### **Puissance**

Capacité à imposer son corps.

Influence :

* duels ;  
* contacts ;  
* blocs ;  
* résistance aux contacts ;  
* capacité à tenir une position.

### **Vitesse**

Vitesse maximale.

### **Accélération**

Vitesse à laquelle le joueur atteint sa vitesse maximale.

Très importante pour :

* contre-attaques ;  
* changements de direction ;  
* attaques d’intervalle ;  
* défense sur montée de balle.

### **Explosivité**

Capacité à produire rapidement un effort.

### **Détente**

Influence :

* tirs ;  
* interceptions ;  
* blocs ;  
* défense ;  
* duels aériens.

### **Endurance**

Capacité à maintenir son niveau.

### **Résistance**

Capacité à supporter les contacts et les efforts répétés.

### **Agilité**

Capacité à changer rapidement de direction.

### **Équilibre**

Résistance à la perte d’équilibre.

Particulièrement important pour les tirs en déséquilibre et les contacts.

---

# **4\. TECHNIQUE**

## **Tir**

### **Puissance de tir**

Force du tir.

### **Précision**

Capacité à viser la zone voulue.

### **Variété de tir**

Capacité à utiliser différents tirs.

### **Tir sous pression**

Précision lorsque le défenseur intervient.

### **Tir en suspension**

### **Tir en appui**

### **Tir à 6 m**

### **Tir à 9 m**

### **Tir d’aile**

### **Tir de pivot**

Ces catégories peuvent être fusionnées dans un premier prototype, mais le moteur doit prévoir leur séparation.

---

# **5\. PASSE**

### **Précision de passe**

### **Vitesse de passe**

### **Qualité de passe sous pression**

### **Vision**

Capacité à identifier les possibilités.

### **Anticipation**

Capacité à voir une possibilité avant qu’elle devienne évidente.

### **Passe difficile**

Capacité à réussir :

* passe cachée ;  
* passe dans le dos ;  
* passe à travers une fenêtre réduite ;  
* passe sous contact.

### **Créativité**

Capacité à produire des solutions inattendues.

---

# **6\. CONDUITE DE BALLE**

### **Dribble**

### **Contrôle**

### **Protection de balle**

### **Changement de direction**

### **Feinte**

### **Double pas**

### **Percussion**

### **Duel offensif**

### **Résistance au contact**

---

# **7\. INTELLIGENCE TACTIQUE**

C’est une catégorie fondamentale du jeu.

## **Lecture du jeu**

Capacité à comprendre la structure adverse.

## **Anticipation**

Capacité à prévoir l’action adverse.

## **Décision**

Capacité à choisir rapidement une solution adaptée.

## **Adaptation**

Capacité à modifier son comportement après observation.

## **Vision périphérique**

Capacité à tenir compte des joueurs qui ne sont pas directement devant lui.

## **Reconnaissance des patterns**

Capacité à détecter :

* répétitions ;  
* combinaisons ;  
* habitudes ;  
* joueurs systématiquement recherchés ;  
* faiblesses défensives.

## **Intelligence spatiale**

Compréhension :

* intervalles ;  
* zones ;  
* distances ;  
* déplacements ;  
* surnombres.

---

# **8\. MENTAL**

Le mental ne doit surtout pas être une simple jauge « moral ».

Il doit avoir plusieurs dimensions.

## **Confiance**

Influence la prise de risque.

## **Sang-froid**

Capacité à prendre une décision sous pression.

## **Concentration**

Capacité à rester attentif.

## **Résilience**

Capacité à revenir après une erreur.

## **Audace**

Volonté de tenter une solution difficile.

## **Discipline**

Respect du plan.

## **Combativité**

Volonté de poursuivre l’effort.

## **Gestion de la pression**

Influence les dernières minutes.

---

# **9\. STATISTIQUES DE LECTURE**

Certaines caractéristiques sont directement inspirées du match.

## **Lecture du défenseur**

Comprendre ce que cherche l’attaquant.

## **Lecture du porteur**

Comprendre ce que cherche le défenseur.

## **Lecture du gardien**

Comprendre les habitudes du tireur.

## **Lecture collective**

Comprendre ce que fait l’ensemble du système.

Cela permet d’obtenir des profils comme :

**Kaël**

Très forte lecture tactique.

**Yanis**

Très forte créativité et capacité à distribuer.

**Aaron**

Combinaison rare :

* puissance ;  
* intelligence ;  
* polyvalence ;  
* capacité à prendre le centre.

**Tayem**

Très forte capacité d’analyse.

---

# **10\. RÔLES**

Chaque joueur possède un rôle principal mais peut en changer.

### **Gardien**

* gardien classique ;  
* gardien avancé ;  
* gardien joueur ;  
* gardien lecteur.

### **Arrière gauche**

### **Demi-centre**

### **Arrière droit**

### **Ailier gauche**

### **Ailier droit**

### **Pivot**

Mais un joueur peut posséder plusieurs maîtrises.

Exemple :

Aaron :

* arrière ;  
* centre ;  
* défenseur avancé.

---

# **11\. APTITUDES SPÉCIALES**

Les aptitudes ne sont pas des « pouvoirs ».

Ce sont des comportements ou qualités particulièrement développés.

## **Aaron**

### **« Trois titans »**

Lorsqu’Aaron, Erwan et Edgar sont simultanément impliqués dans une séquence offensive :

* meilleure pression physique ;  
* meilleures possibilités de fixation ;  
* forte capacité à créer un décalage.

### **« Centre de puissance »**

Aaron peut organiser depuis le poste de centre malgré son profil d’arrière.

### **« Lecture du duel »**

Plus Aaron observe un défenseur, plus il peut adapter son attaque contre lui.

### **« Polyvalence »**

Pénalité réduite lors d’un changement de rôle.

---

# **12\. YANIS**

### **« Métronome créatif »**

Bonus de qualité lorsque plusieurs options de passe existent.

### **« Imprévisibilité »**

L’adversaire a plus de difficulté à prédire son choix.

### **« Fixation »**

Excellent pour attirer plusieurs défenseurs.

### **« Distribution »**

Très grande capacité à transformer un déplacement en occasion.

### **« Duel de lecture »**

Lorsqu’un défenseur le marque strictement, Yanis peut progressivement comprendre son comportement.

---

# **13\. ERWAN**

### **« Frappe »**

Très forte puissance.

### **« Percussion »**

Capacité à attaquer un espace réduit.

### **« Fixation »**

Peut devenir lui-même le point de fixation d’une combinaison.

### **« Jeu avec Aaron »**

Synergie importante.

---

# **14\. EDGAR**

### **« Pression »**

Sa présence oblige la défense à tenir compte de lui.

### **« Fixation lourde »**

Capacité à attirer plusieurs défenseurs.

### **« Pivot offensif »**

Peut devenir temporairement le point final d’une combinaison.

---

# **15\. KAËL**

Kaël doit être l’un des personnages les plus importants du prototype.

### **« Analyste »**

Plus il observe une combinaison, plus il peut obtenir des informations sur sa probabilité.

### **« Marquage strict »**

Peut consacrer une grande partie de son activité défensive à un joueur.

### **« Adaptation »**

Après plusieurs répétitions, Kaël peut changer automatiquement son comportement.

### **« Chef d’orchestre »**

Peut modifier les instructions collectives pendant la possession.

### **« Projection »**

Capacité à envisager plusieurs coups à l’avance.

---

# **16\. MAËL**

### **« Duel »**

Très performant dans les situations individuelles.

### **« Explosivité »**

Très fort sur le premier mouvement.

### **« Rivalité »**

Lorsqu’il affronte Aaron directement, certaines décisions deviennent plus agressives.

Mais attention :

la rivalité ne doit pas forcer les actions.

Elle modifie les probabilités et préférences.

Le joueur reste libre.

---

# **17\. MALONE**

### **« Tireur d’aile »**

Très forte efficacité depuis l’aile.

### **« Artiste »**

Tendance à rechercher certaines solutions techniques plutôt que la simple efficacité.

Cela permet au moteur de reproduire une caractéristique du personnage :

un joueur peut avoir une solution objectivement simple mais préférer une solution plus esthétique.

### **« Mobilité »**

Très forte capacité à exploiter les décalages.

---

# **18\. TEDDY**

### **« Gardien puissant »**

Très bonne capacité à arrêter les tirs.

### **« Lecture »**

Peut identifier certaines habitudes.

### **« Contre-attaque »**

Relance rapidement.

---

# **19\. LIAM**

### **« Sortie agressive »**

Capable de sortir fortement sur le tireur.

### **« Lecture du tireur »**

Peut observer les préférences.

### **« Bash »**

Capacité à imposer une forte présence sur le pivot/attaquant.

---

# **20\. RIO**

Rio doit avoir une particularité essentielle :

**il comprend le jeu.**

Il peut :

* lire l’attaque ;  
* anticiper ;  
* participer au jeu à 7 ;  
* revenir rapidement au but ;  
* choisir le moment où il doit monter.

Il ne doit donc pas être simplement :

gardien remplacé par un joueur.

Il constitue une nouvelle dimension tactique.

---

# **21\. CARACTÉRISTIQUES DE L’ÉQUIPE**

Chaque équipe possède également des paramètres.

### **Cohésion offensive**

### **Cohésion défensive**

### **Discipline tactique**

### **Adaptabilité**

### **Communication**

### **Fatigue collective**

### **Confiance collective**

### **Connaissance du système**

### **Connaissance de l’adversaire**

---

# **22\. SYNERGIES**

Les joueurs doivent avoir des relations.

Exemple :

Aaron ↔ Erwan :

forte compréhension.

Aaron ↔ Edgar :

fort potentiel de fixation.

Yanis ↔ Aaron :

forte compréhension du déplacement.

Kaël ↔ Maël :

relation fraternelle/tactique.

Une synergie élevée signifie :

* déplacement plus instinctif ;  
* meilleure compréhension ;  
* moins de temps nécessaire ;  
* meilleures passes ;  
* meilleures combinaisons.

---

# **23\. FATIGUE**

La fatigue doit être individuelle.

Chaque joueur possède :

**Énergie : 0–100**

Elle baisse selon :

* course ;  
* sprint ;  
* duel ;  
* contact ;  
* défense agressive ;  
* attaque ;  
* répétition d’efforts.

Mais la fatigue doit aussi toucher :

### **précision**

### **vitesse**

### **accélération**

### **concentration**

### **décision**

### **lucidité**

Ainsi, un joueur épuisé peut toujours courir mais commencer à faire de mauvaises décisions.

---

# **24\. FATIGUE TACTIQUE**

Il faut distinguer :

**fatigue physique**

et

**fatigue cognitive.**

Un joueur peut être physiquement correct mais mentalement épuisé.

C’est exactement ce que montre le match :

Nangis utilise énormément son système 1-2-3.

Il fonctionne.

Mais il coûte énormément d’énergie.

Le moteur doit donc permettre :

tactique très efficace → fatigue élevée → baisse progressive de son efficacité.

---

# **25\. LES SYSTÈMES DÉFENSIFS**

## **6-0**

Défense compacte.

Avantages :

* protection de l’intérieur ;  
* protection du pivot ;  
* stabilité.

Inconvénients :

* tirs extérieurs ;  
* liberté accrue des arrières.

---

## **1-5**

Un joueur sort haut.

Avantages :

* pression sur le centre ;  
* perturbation de la circulation.

Inconvénients :

* espaces derrière le joueur avancé.

---

## **1-2-3**

Défense hybride agressive.

Objectifs :

* perturber la circulation ;  
* empêcher certaines passes ;  
* couper les relations ;  
* provoquer des décisions difficiles.

Coût :

* très élevé physiquement ;  
* très exigeant cognitivement.

---

# **26\. MARQUAGE INDIVIDUEL**

Le jeu doit permettre :

### **marquage normal**

### **marquage strict**

### **marquage à distance**

### **marquage avec aide**

### **changement défensif**

### **piège**

### **dissuasion**

Exemple :

Kaël ne bloque pas seulement Yanis.

Il peut :

laisser Yanis recevoir mais supprimer la passe vers lui.

C’est une distinction fondamentale.

---

# **27\. DISSUASION**

Le défenseur n’a pas besoin de toucher le ballon.

Il peut simplement :

* occuper une ligne de passe ;  
* se placer entre deux joueurs ;  
* fermer une zone ;  
* forcer une autre solution.

C’est une mécanique essentielle.

---

# **28\. LE SYSTÈME DE ZONES**

Le terrain doit être divisé en zones tactiques.

Exemple :

* aile gauche ;  
* intervalle 1–2 ;  
* intervalle 2–3 ;  
* centre ;  
* intervalle 3–2 ;  
* intervalle 2–1 ;  
* aile droite ;  
* zone pivot ;  
* zone 9 m ;  
* zone 6 m.

Les joueurs se déplacent entre ces zones.

Mais ils ne sont pas « attachés » à une case.

La position exacte doit être continue.

---

# **29\. FIXATION**

La fixation doit être une mécanique réelle.

Un joueur peut chercher à :

* attirer un défenseur ;  
* attirer deux défenseurs ;  
* maintenir un défenseur ;  
* faire sortir un défenseur ;  
* provoquer un changement.

La qualité de la fixation dépend de :

* puissance ;  
* vitesse ;  
* crédibilité de l’attaque ;  
* position ;  
* timing ;  
* réputation du joueur ;  
* comportement défensif adverse.

---

# **30\. BLOCS**

Le joueur peut choisir :

* bloc frontal ;  
* bloc latéral ;  
* bloc retardé ;  
* bloc mobile ;  
* bloc pour un tir ;  
* bloc pour une pénétration ;  
* bloc pour créer une passe.

Le défenseur peut :

* contourner ;  
* passer dessous ;  
* passer dessus ;  
* changer ;  
* rester ;  
* aider.

---

# **31\. INTERCEPTIONS**

L’interception ne doit jamais être automatique.

Le défenseur choisit :

### **rester**

### **anticiper**

### **couper la ligne**

### **attaquer le porteur**

### **fermer une zone**

Plus l’anticipation est forte :

* plus la récompense est grande ;  
* mais plus le risque est grand.

---

# **32\. FEINTES**

Une feinte est une information envoyée au défenseur.

Exemple :

Aaron feinte le tir.

Le défenseur peut :

* mordre ;  
* ne pas mordre ;  
* avancer légèrement ;  
* fermer une autre zone.

La qualité de la feinte dépend de :

* technique ;  
* crédibilité ;  
* historique des actions ;  
* comportement du défenseur.

---

# **33\. MÉMOIRE DU MATCH**

C’est une mécanique essentielle.

Le jeu doit mémoriser :

Aaron a attaqué Maël trois fois par la gauche.

Yanis cherche souvent Edgar après fixation.

Malone reçoit souvent après déplacement de Maël.

Kaël sort systématiquement lorsque Yanis reçoit à 9 m.

Rio avance lorsque Malone reçoit.

Cette mémoire influence les décisions futures.

---

# **34\. APPRENTISSAGE DE L’IA**

L’IA ne connaît pas parfaitement le joueur.

Elle commence avec des hypothèses.

Après plusieurs possessions :

**Hypothèse :**

« Yanis cherche probablement Aaron. »

Puis :

**Confiance : 62 %.**

Après une nouvelle observation :

74 %.

Mais si Yanis fait autre chose :

51 %.

Ainsi, le joueur peut manipuler l’IA.

---

# **35\. BLUFF TACTIQUE**

Une stratégie peut être utilisée plusieurs fois pour faire croire à l’adversaire qu’elle va revenir.

Exemple :

Aaron regarde constamment Edgar.

La défense pense :

passe vers Edgar.

Aaron sert finalement Elian.

Le moteur doit permettre ce genre de situation.

---

# **36\. FAUSSE HABITUDE**

Le joueur peut volontairement répéter une action pour créer une attente.

Puis changer au moment opportun.

C’est une mécanique de mindgame.

---

# **37\. TEMPO**

Le joueur choisit le rythme.

### **très lent**

### **lent**

### **normal**

### **rapide**

### **très rapide**

Le tempo influence :

* fatigue ;  
* préparation défensive ;  
* risque ;  
* nombre d’actions ;  
* possibilité de contre.

---

# **38\. TRANSITION**

Après perte de balle :

le moteur crée une nouvelle phase.

Chaque joueur choisit :

* courir ;  
* défendre ;  
* ralentir ;  
* couper une ligne ;  
* prendre un joueur ;  
* protéger le centre.

La contre-attaque est donc jouable.

---

# **39\. CONTRE-ATTAQUE**

Le porteur peut :

* courir directement ;  
* attendre ;  
* servir l’aile ;  
* servir le pivot ;  
* provoquer ;  
* temporiser.

Le défenseur peut :

* poursuivre le porteur ;  
* couper une passe ;  
* protéger le but ;  
* prendre l’aile ;  
* provoquer un tir difficile.

---

# **40\. GARDIEN : SYSTÈME DE DÉCISION**

Le gardien doit être un véritable joueur.

Lors d’un tir, il doit choisir :

* rester sur ligne ;  
* avancer ;  
* fermer premier poteau ;  
* fermer deuxième poteau ;  
* anticiper haut ;  
* anticiper bas ;  
* attendre ;  
* suivre les yeux/gestes du tireur.

Le tireur choisit :

* zone ;  
* puissance ;  
* hauteur ;  
* effet ;  
* timing.

Le gardien essaie de deviner.

---

# **41\. PROFIL DU TIREUR**

Chaque joueur possède des tendances.

Exemple :

Malone :

* aile ;  
* angle ;  
* roucoulette ;  
* recherche de gestes techniques.

Mais ce ne sont que des tendances.

Il peut faire autre chose.

---

# **42\. PROFIL DU GARDIEN**

Le gardien possède :

* réflexes ;  
* anticipation ;  
* explosivité ;  
* lecture ;  
* positionnement ;  
* courage de sortie ;  
* capacité à analyser un tireur.

---

# **43\. TIRS DÉSÉQUILIBRÉS**

Le moteur doit distinguer :

* tir stable ;  
* tir sous contact ;  
* tir en déséquilibre ;  
* tir en extension ;  
* tir en suspension.

Un tir peut être techniquement difficile mais volontaire.

---

# **44\. RÉSOLVER UN TIR**

Une formule conceptuelle :

**Qualité du tir**

\=

technique

* puissance  
* précision  
* timing  
* position  
* équilibre  
* confiance

− pression défensive

− fatigue

− difficulté de l’angle.

Puis :

**Chance d’arrêt**

\=

lecture gardien

* positionnement  
* réflexes  
* anticipation

contre

qualité du tir.

Le résultat ne doit jamais être totalement déterministe.

---

# **45\. ERREURS**

Le moteur doit permettre :

* mauvaise passe ;  
* mauvaise réception ;  
* mauvais timing ;  
* mauvais déplacement ;  
* mauvais choix ;  
* perte de balle ;  
* tir raté ;  
* faute ;  
* mauvaise communication.

Les erreurs doivent être causées par la situation, pas par un hasard arbitraire.

---

# **46\. CHANCE ET INCERTITUDE**

Il doit exister une part d’incertitude.

Mais :

hasard ≠ roulette.

Un joueur excellent dans une situation favorable doit être généralement performant.

Un joueur mauvais dans une situation défavorable doit généralement échouer.

Mais des exceptions doivent exister.

---

# **47\. TEMPS MORTS**

Chaque équipe possède un nombre limité de temps morts.

Le coach peut les utiliser pour :

* changer système ;  
* calmer ;  
* accélérer ;  
* donner une combinaison ;  
* modifier un marquage ;  
* changer une cible.

Le joueur peut également avoir plusieurs niveaux de contrôle :

### **contrôle joueur**

Décisions sur le terrain.

### **contrôle coach**

Tactique collective.

### **contrôle hybride**

Le joueur définit les grandes lignes et l’IA gère certaines micro-décisions.

---

# **48\. REMPLACEMENTS**

Chaque remplacement doit avoir une raison.

Entrer un joueur peut :

* augmenter le niveau physique ;  
* modifier le système ;  
* changer le style ;  
* répondre à un adversaire ;  
* préserver un joueur.

Sortir un joueur peut :

* éviter l’épuisement ;  
* protéger son mental ;  
* changer la dynamique.

---

# **49\. SYSTÈMES OFFENSIFS**

Le joueur doit pouvoir construire ses propres systèmes.

Exemples issus du match :

### **Système Yanis**

Yanis organise.

### **Système Aaron**

Aaron prend le centre.

### **Système trois titans**

Aaron \+ Erwan \+ Edgar.

### **Système deux pivots**

Objectif :

* créer des blocs ;  
* déplacer la défense ;  
* créer un décalage ;  
* libérer Malone.

### **Jeu à 7**

Gardien remplacé par un joueur.

---

# **50\. JEU À 7**

Le joueur choisit :

* quand sortir le gardien ;  
* qui entre ;  
* qui reste au but ;  
* où placer le gardien/joueur ;  
* comment organiser les pivots.

Le risque :

* but encaissé dans le but vide.

Le bénéfice :

* surnombre offensif.

---

# **51\. DEUX PIVOTS**

Les pivots peuvent :

* bloquer ;  
* croiser ;  
* fixer ;  
* faire écran ;  
* couper ;  
* libérer une zone.

Le jeu doit considérer le pivot comme une pièce active.

---

# **52\. NUMÉRATION OFFENSIVE**

Le moteur doit détecter :

* égalité ;  
* surnombre ;  
* sous-nombre ;  
* décalage ;  
* défenseur isolé ;  
* défenseur obligé de choisir.

Une bonne combinaison crée souvent une situation où :

deux défenseurs doivent gérer trois menaces.

---

# **53\. LES « MENACES »**

Chaque joueur représente une menace.

La menace dépend de :

* position ;  
* ballon ;  
* statistiques ;  
* historique ;  
* réputation ;  
* déplacement.

Aaron peut donc attirer un défenseur même sans avoir le ballon.

---

# **54\. MENACE SANS BALLON**

Mécanique indispensable.

Un joueur peut :

* courir ;  
* fixer ;  
* attirer ;  
* couper ;  
* feinter une course ;  
* faire croire à un appel.

Cela peut créer une ouverture pour quelqu’un d’autre.

---

# **55\. DÉFENSE COLLECTIVE**

Chaque défenseur possède :

* cible principale ;  
* zone ;  
* priorité ;  
* distance ;  
* niveau d’agressivité.

L’équipe possède une règle de priorité :

Qui aide qui ?

---

# **56\. COMMUNICATION**

Un défenseur peut signaler :

* changement ;  
* aide ;  
* bloc ;  
* joueur dangereux.

Une équipe avec forte communication réagit mieux.

---

# **57\. COHÉSION**

Une défense très cohérente peut donner l’impression qu’aucun joueur n’est réellement seul.

C’est exactement le comportement recherché pour Lagny dans le match.

---

# **58\. ADAPTATION DU JOUEUR À SON ADVERSAIRE**

Chaque duel possède une mémoire.

Exemple :

Aaron vs Maël.

Au début :

Aaron connaît peu Maël.

Après plusieurs duels :

* il connaît son premier mouvement ;  
* Maël connaît le sien ;  
* chacun adapte son comportement.

Le duel évolue.

---

# **59\. DUEL ÉVOLUTIF**

Le moteur peut enregistrer :

**Aaron :**

* attaque gauche 3 fois ;  
* feinte 2 fois ;  
* accélération 4 fois.

**Maël :**

* ferme gauche 3 fois ;  
* anticipe intérieur 2 fois.

Le duel devient progressivement un jeu d’information.

---

# **60\. RIVALITÉS**

Une rivalité peut modifier :

* attention ;  
* prise de risque ;  
* agressivité ;  
* concentration ;  
* confiance.

Mais jamais imposer une action.

---

# **61\. PSYCHOLOGIE COLLECTIVE**

Le score influence l’équipe.

Exemple :

Après :

18–13

→ confiance Lagny.

Après :

18–16

→ pression Lagny.

Après :

22–21

→ Nangis croit au retour.

Mais une équipe ne reçoit pas simplement :

\+10 moral.

Il faut tenir compte de la personnalité.

---

# **62\. ERREUR ET RÉACTION**

Après une erreur :

joueur A peut :

* continuer normalement ;  
* devenir plus prudent ;  
* devenir plus agressif ;  
* perdre momentanément de la confiance ;  
* chercher à réparer immédiatement.

Cela dépend du profil mental.

---

# **63\. LE « BOSS FINAL »**

Lagny doit être configuré comme un adversaire extrêmement complet.

Pas nécessairement parce que chaque joueur possède des statistiques absurdes.

Mais parce que l’équipe :

* lit ;  
* adapte ;  
* varie ;  
* exploite les faiblesses ;  
* possède plusieurs systèmes ;  
* possède plusieurs menaces ;  
* possède une bonne cohésion.

Le défi doit venir de la **qualité des décisions adverses**, pas simplement de chiffres gonflés.

---

# **64\. NIVEAUX**

Pour le prototype :

Tous les joueurs sont autour du niveau **50**.

Mais les niveaux peuvent varier.

Exemple indicatif :

| Joueur | Niveau |
| ----- | ----- |
| Aaron | 55 |
| Kaël | 55 |
| Malone | 54 |
| Yanis | 53 |
| Erwan | 53 |
| Edgar | 52 |
| Maël | 52 |
| Liam | 52 |
| Teddy | 52 |
| Rio | 51 |
| Layo | 51 |
| Néo | 51 |
| Elio | 50 |
| Pierre | 50 |
| Elian | 50 |
| Karim | 50 |
| Ilyes | 49 |
| Léo | 50 |
| Karl | 50 |

Ces niveaux ne sont qu’une **base de calibration**.

La note générale ne doit pas déterminer directement le vainqueur.

---

# **65\. NOTE GÉNÉRALE**

La note générale est calculée à partir des statistiques correspondant au rôle.

Un arrière :

* tir ;  
* puissance ;  
* duel ;  
* vision ;  
* passe ;  
* intelligence ;  
* physique.

Un ailier :

* vitesse ;  
* accélération ;  
* tir d’aile ;  
* précision ;  
* déplacement.

Un gardien :

* réflexes ;  
* anticipation ;  
* positionnement ;  
* lecture.

Ainsi :

deux joueurs niveau 52 peuvent être radicalement différents.

---

# **66\. ÉCRAN JOUEUR**

Pour chaque joueur :

**Nom**

**Niveau**

**Postes**

**Physique**

**Technique**

**Passe**

**Duel**

**Tir**

**Défense**

**Intelligence**

**Mental**

**Endurance**

**Aptitudes**

**Tendances**

**Synergies**

**Historique du match**

---

# **67\. EXEMPLE : AARON**

## **Aaron Ornaq**

Niveau : 55

### **Physique**

Puissance : 95  
 Explosivité : 91  
 Vitesse : 84  
 Accélération : 85  
 Détente : 89  
 Endurance : 82

### **Technique**

Tir : 93  
 Passe : 88  
 Dribble : 82  
 Feinte : 87  
 Contrôle : 88

### **Intelligence**

Vision : 91  
 Anticipation : 90  
 Décision : 92  
 Adaptation : 94  
 Lecture défensive : 88

### **Mental**

Confiance : 90  
 Sang-froid : 91  
 Concentration : 89  
 Résilience : 94  
 Audace : 92

### **Particularité**

**Polyvalence exceptionnelle.**

Il peut devenir :

* arrière ;  
* centre ;  
* meneur ;  
* défenseur avancé.

Il n’est pas nécessairement le meilleur joueur dans chaque catégorie.

Sa force vient de la combinaison.

---

# **68\. EXEMPLE : YANIS**

Niveau : 53

### **Forces**

* vision ;  
* passe ;  
* créativité ;  
* lecture ;  
* imprévisibilité ;  
* fixation ;  
* jeu collectif.

### **Faiblesses relatives**

* puissance physique ;  
* duel contre un joueur beaucoup plus fort.

Son intérêt :

Il transforme une situation ordinaire en plusieurs possibilités.

---

# **69\. EXEMPLE : KAËL**

Niveau : 55

### **Forces**

* intelligence ;  
* lecture ;  
* anticipation ;  
* puissance ;  
* polyvalence ;  
* stratégie défensive ;  
* adaptation.

### **Particularité**

Plus il reste longtemps dans le match, plus sa connaissance de l’adversaire augmente.

Mais une trop grande quantité d’informations peut provoquer une **surcharge décisionnelle**.

---

# **70\. EXEMPLE : MAËL**

Niveau : 52

### **Forces**

* duel ;  
* accélération ;  
* puissance ;  
* explosivité.

### **Particularité**

Très dangereux lorsqu’il reçoit un espace clair.

---

# **71\. EXEMPLE : MALONE**

Niveau : 54

### **Forces**

* tir ;  
* aile ;  
* déplacement ;  
* lecture des espaces.

### **Particularité**

Très dangereux lorsqu’un décalage est créé.

---

# **72\. EXEMPLE : TEDDY**

Niveau : 52

### **Forces**

* arrêts ;  
* puissance ;  
* positionnement ;  
* relance.

---

# **73\. VARIABLES DE MATCH**

Le moteur doit constamment conserver :

score\_nangis  
score\_lagny

temps

possession

joueur\_avec\_ballon

positions

fatigue\_joueur

mental\_joueur

confiance\_joueur

système\_offensif

système\_défensif

marquages

historique\_actions

historique\_duels

historique\_tirs

patterns\_detectés

niveau\_de\_confiance\_des\_hypothèses

temps\_morts\_restants

remplacements

gardien\_actuel  
---

# **74\. ÉTAT D’UNE POSSESSION**

Exemple :

Possession \#37

Score : Nangis 21 — Lagny 20

Ballon : Aaron

Position : arrière droit

Défense : 1-2-3

Kaël : marquage Yanis

Yanis : côté droit

Erwan : gauche

Edgar : pivot

Fatigue Aaron : 72/100

Fatigue Yanis : 61/100

Fatigue Kaël : 69/100

Hypothèse Lagny :  
"Aaron cherchera probablement Erwan"

Confiance : 58 %

Le joueur choisit alors son action.

---

# **75\. INTERFACE DE DÉCISION**

Quand une décision importante apparaît :

### **ACTION**

* passer ;  
* tirer ;  
* dribbler ;  
* fixer ;  
* courir ;  
* ralentir ;  
* feinter.

### **CIBLE**

* joueur ;  
* zone ;  
* espace.

### **STYLE**

* rapide ;  
* sûr ;  
* agressif ;  
* créatif ;  
* trompeur.

### **TIMING**

* immédiat ;  
* attendre ;  
* après déplacement ;  
* après bloc.

Le moteur calcule ensuite la résolution.

---

# **76\. CONTRÔLE DES COÉQUIPIERS**

Le joueur doit pouvoir donner une instruction :

« Edgar, fixe. »

ou :

« Erwan, attaque intervalle 2–3. »

ou :

« Yanis, croise avec Aaron. »

Mais il ne doit pas contrôler chaque pas individuellement.

Il définit une **intention**.

Le joueur contrôlé exécute selon ses statistiques.

---

# **77\. NIVEAU DE MICROGESTION**

Trois modes peuvent être prévus.

### **Mode simple**

Le joueur choisit uniquement les grandes décisions.

### **Mode avancé**

Le joueur contrôle :

* joueur ;  
* cible ;  
* action ;  
* timing.

### **Mode expert**

Le joueur peut modifier :

* déplacements ;  
* blocs ;  
* priorités ;  
* lignes de passe ;  
* marquage.

Le prototype peut commencer directement en mode avancé.

---

# **78\. IA OFFENSIVE**

Pour chaque possession, l’IA génère plusieurs solutions.

Exemple :

Solution A  
Aaron → Erwan  
Probabilité de réussite : 73 %

Solution B  
Aaron → Edgar  
Probabilité : 64 %

Solution C  
Duel contre Maël  
Probabilité : 81 %

Solution D  
Recul  
Probabilité : 94 %  
mais faible progression

L’IA choisit en fonction de :

* objectif ;  
* risque accepté ;  
* personnalité ;  
* stratégie ;  
* score ;  
* temps ;  
* fatigue.

---

# **79\. IA DÉFENSIVE**

Même principe.

Le défenseur évalue :

Sortir sur Aaron  
Fermer intérieur  
Fermer passe Erwan  
Aider Edgar  
Rester

Chaque choix possède :

* bénéfice ;  
* risque ;  
* compatibilité avec le système.

---

# **80\. IA DU COACH**

Le coach possède une représentation du match.

Il observe :

* score ;  
* efficacité ;  
* fatigue ;  
* systèmes ;  
* duels ;  
* tendances.

Il peut décider :

* temps mort ;  
* changement ;  
* nouveau système ;  
* nouveau marquage ;  
* changement de cible.

---

# **81\. INFORMATION IMPARFAITE**

Le joueur ne doit pas toujours connaître les statistiques exactes adverses pendant le match.

Il découvre progressivement :

« Malone semble très fort depuis l’aile. »

« Maël aime attaquer immédiatement l’espace. »

« Kaël commence à anticiper cette passe. »

Les informations deviennent plus précises avec l’observation/scouting.

---

# **82\. RAPPORT DE MATCH**

Après chaque possession importante :

Pourquoi cela a fonctionné ?

Pourquoi cela a échoué ?

Quel joueur a créé le décalage ?

Quel défenseur a été déplacé ?

Quel pattern apparaît ?

Quelle hypothèse l'adversaire semble avoir ?

Cela permet au joueur de comprendre le système.

---

# **83\. STATISTIQUES DE MATCH**

À la fin :

### **Joueurs**

* buts ;  
* tirs ;  
* tirs cadrés ;  
* tirs ratés ;  
* passes décisives ;  
* pertes de balle ;  
* interceptions ;  
* blocs ;  
* fautes ;  
* arrêts ;  
* duels gagnés ;  
* duels perdus ;  
* kilomètres ;  
* sprints ;  
* possessions impliquées ;  
* décisions réussies ;  
* décisions risquées ;  
* temps de jeu.

### **Tactique**

* efficacité par système ;  
* efficacité par zone ;  
* efficacité par joueur ;  
* efficacité contre chaque défense ;  
* nombre de décalages ;  
* nombre de surnombres ;  
* turnovers forcés.

---

# **84\. STATISTIQUES AVANCÉES**

Le jeu doit également calculer :

### **Efficacité offensive**

Buts / possessions.

### **Efficacité d’un joueur**

Buts \+ passes \+ créations − erreurs.

### **Valeur de fixation**

Nombre de défenseurs attirés.

### **Valeur de déplacement**

Nombre de décalages créés sans ballon.

### **Valeur défensive**

Interceptions \+ tirs perturbés \+ passes empêchées \+ duels gagnés.

---

# **85\. « ACTION INVISIBLE »**

Un joueur peut ne pas marquer mais être essentiel.

Exemple :

Edgar attire deux défenseurs.

Aaron récupère l’espace.

Aaron marque.

La statistique d’Edgar doit reconnaître :

**création de décalage : \+1**

Cela évite un jeu où seules les statistiques classiques comptent.

---

# **86\. SCORE TACTIQUE**

Après le match, chaque joueur peut avoir :

### **impact offensif**

### **impact défensif**

### **création**

### **lecture**

### **discipline**

### **adaptation**

### **impact physique**

Ce ne sont pas des « notes de qualité ».

Ce sont des indicateurs explicatifs.

---

# **87\. REPRODUIRE LE MATCH DU MANGA**

Le premier test doit utiliser exactement :

### **Nangis**

Pierre  
 Erwan  
 Yanis  
 Aaron  
 Elian  
 Edgar  
 Liam

### **Lagny**

Malone  
 Maël  
 Kaël  
 Elio  
 Néo  
 Karim  
 Teddy

Puis les autres joueurs :

Léo  
 Layo  
 Rio  
 Ilyes

peuvent entrer comme remplaçants.

---

# **88\. DIFFICULTÉ DU TEST**

Le joueur joue Nangis.

L’IA joue Lagny.

Le niveau global est élevé.

Mais l’objectif n’est pas :

« empêcher le joueur de gagner. »

L’objectif est :

**l’obliger à comprendre pourquoi Lagny est difficile à battre.**

Si le joueur répète exactement la même combinaison :

Kaël doit progressivement la comprendre.

Si le joueur change :

Kaël doit devoir réapprendre.

---

# **89\. CONDITION DE VICTOIRE**

Victoire :

avoir plus de buts à la fin du temps réglementaire.

Pas de scénario obligatoire.

Le match peut finir :

30–29.

32–28.

25–27.

Etc.

---

# **90\. CONDITIONS DE DÉFAITE**

Défaite si :

adversaire possède plus de buts à la fin.

Aucun « game over narratif ».

---

# **91\. TEMPS**

Le prototype peut commencer sur :

**60 minutes simulées**

avec :

* première mi-temps ;  
* pause ;  
* seconde mi-temps.

Pour le développement initial, possibilité d’utiliser :

**10 minutes \= 1 minute réelle**

ou une simulation accélérée.

---

# **92\. PAUSES DE DÉCISION**

Le jeu n’a pas besoin d’être strictement tour par tour.

Le meilleur compromis :

**simulation continue \+ fenêtres de décision.**

Le jeu avance.

Puis :

situation tactiquement importante.

Pause.

Le joueur choisit.

Puis simulation.

Cela permet d’avoir la fluidité du handball tout en conservant la profondeur stratégique.

---

# **93\. MODE « TOUR »**

Pour les tests du moteur, on peut également créer un mode strictement tour par tour.

Chaque possession devient :

1\. Situation  
2\. Décision offensive  
3\. Réponse défensive  
4\. Résolution  
5\. Mise à jour  
6\. Nouvelle situation

Ce mode est extrêmement utile pour debugger le moteur.

---

# **94\. MOTEUR MINIMAL**

Pour pouvoir coder immédiatement, il faut au minimum :

### **Entités**

* Player  
* Team  
* Ball  
* Match  
* Possession  
* Action  
* TacticalSystem  
* Decision  
* Goalkeeper

### **Player**

name  
level  
position  
stats  
traits  
role  
fatigue  
mental  
confidence  
relationships  
tendencies

### **Team**

players  
substitutes  
offensive\_system  
defensive\_system  
timeouts  
cohesion  
strategy

### **Match**

time  
score  
possession  
phase  
history  
---

# **95\. ACTION ENGINE**

Toutes les actions peuvent partir d’un ensemble limité de primitives :

MOVE  
PASS  
SHOOT  
DRIBBLE  
FEINT  
FIX  
BLOCK  
INTERCEPT  
MARK  
SWITCH  
HELP  
RETREAT  
PRESS  
COUNTER  
TIMEOUT  
SUBSTITUTE  
SYSTEM\_CHANGE

La variété vient de leur combinaison.

Il ne faut donc pas coder 300 actions indépendantes.

Il faut coder une **grammaire d’actions**.

---

# **96\. FORMULE GÉNÉRALE**

Une action possède :

actor  
intent  
target  
timing  
position  
context

La résolution utilise :

actor\_stats  
target\_stats  
team\_system  
opponent\_system  
fatigue  
mental  
history  
uncertainty

Puis produit :

success  
partial\_success  
failure  
turnover  
foul  
shot  
goal  
new\_state  
---

# **97\. EXEMPLE**

Aaron :

intent \= DUEL  
target \= Maël  
direction \= inside  
timing \= immediate

Le moteur consulte :

Aaron :

* accélération ;  
* puissance ;  
* dribble ;  
* duel ;  
* équilibre.

Maël :

* puissance ;  
* anticipation ;  
* défense ;  
* vitesse latérale.

Contexte :

* fatigue ;  
* espace ;  
* aide de Layo ;  
* historique des duels.

Résultat :

Aaron bat Maël

ou

Maël contient Aaron

ou

Layo intervient

ou

faute défensive

ou

Aaron ressort la balle  
---

# **98\. CE QUI REND LE JEU PROFOND**

La profondeur ne doit pas venir de 500 boutons.

Elle vient de :

**position × joueur × adversaire × système × timing × information × fatigue × historique.**

Une même action peut donc avoir des résultats différents.

---

# **99\. OBJECTIF DU PREMIER BUILD**

Le premier build n’a pas besoin de :

* beaux graphismes ;  
* menus complexes ;  
* carrière ;  
* recrutement ;  
* animations ;  
* narration ;  
* multijoueur.

Il doit seulement savoir faire :

1. créer deux équipes ;  
2. placer les joueurs ;  
3. donner le ballon ;  
4. choisir une action ;  
5. permettre une réponse défensive ;  
6. résoudre ;  
7. déplacer les joueurs ;  
8. calculer fatigue/mental ;  
9. mémoriser ;  
10. recommencer ;  
11. afficher le score ;  
12. afficher les statistiques.

---

# **100\. TEST ABSOLU**

Le premier objectif technique est de pouvoir lancer :

**NANGIS — LAGNY**

Puis cliquer :

**JOUER**

Le match doit fonctionner sans scénario pré-écrit.

À la fin, le moteur doit pouvoir produire un rapport comme :

NANGIS 31 — 29 LAGNY

Possessions : 61 / 60

Nangis

Aaron  
8 buts  
6 passes  
4 duels gagnés  
2 pertes  
...

Yanis  
4 buts  
11 passes  
...

Erwan  
7 buts  
...

Lagny

Malone  
10 buts  
...

Kaël  
5 buts  
7 passes  
...

Maël  
6 buts  
...

Mais surtout :

ANALYSE

Lagny a principalement utilisé :  
6-0 : 31 %  
1-2-3 : 42 %  
jeu à 7 : 27 %

Nangis a principalement utilisé :  
1-2-3 : 48 %  
6-0 : 37 %  
autres : 15 %

Le duel Aaron / Maël :  
Aaron : 7/11  
Maël : 4/10

Les attaques impliquant Yanis \+ Aaron :  
68 % d'efficacité.

Les attaques impliquant Aaron comme centre :  
74 % d'efficacité.

Après 4 répétitions, Kaël a commencé  
à anticiper la passe vers Erwan.

Le rapport doit expliquer **comment le match s’est gagné ou perdu**, pas seulement donner le score.

---

# **101\. PRINCIPLE ABSOLU : PAS DE SCRIPT**

Le scénario du manga ne doit jamais être codé comme :

if minute \== 22:  
    remove(Yanis)

Il doit être codé comme :

if  
    fatigue(Yanis) high  
    AND effectiveness(Yanis) low  
    AND opponent\_pressure(Yanis) high  
    AND coach\_decision:  
        substitute(Yanis)

Même chose pour les systèmes.

Pas :

minute 45 \-\> Aaron centre

Mais :

if opponent\_overcommits\_to\_Yanis:  
    increase\_value(Aaron\_center)

Le moteur doit ainsi pouvoir retrouver spontanément certaines scènes du manga.

---

# **102\. LE BUT DU MATCH TEST**

Après plusieurs parties, on doit pouvoir constater :

« Cette partie ressemble au manga. »

sans que le moteur ait jamais reçu le scénario du manga.

Par exemple :

Partie A :

Kaël neutralise Yanis → Nangis cherche Aaron → Aaron devient centre → Lagny change de défense.

Partie B :

Yanis bat Kaël → Lagny ne peut pas utiliser le même plan → Malone devient la cible.

Partie C :

Nangis exploite Maël → Lagny protège Maël → Malone obtient plus d’espace.

Partie D :

Lagny utilise le jeu à 7 très tôt → Nangis développe immédiatement une réponse.

**C’est cela qui validera le moteur.**

---

# **103\. ARCHITECTURE FINALE DU PROTOTYPE**

Le jeu doit être pensé comme cinq couches :

## **Couche 1 — Physique**

Position, vitesse, distance, contact.

## **Couche 2 — Technique**

Passe, tir, dribble, duel.

## **Couche 3 — Tactique**

Systèmes, espaces, blocs, marquages.

## **Couche 4 — Cognition**

Anticipation, lecture, mémoire, adaptation.

## **Couche 5 — Mental**

Confiance, pression, résilience, fatigue cognitive.

Une action traverse ces cinq couches.

---

# **104\. LA BOUCLE FONDAMENTALE**

ÉTAT DU MATCH  
      ↓  
SITUATION  
      ↓  
OBSERVATION  
      ↓  
INTENTION  
      ↓  
DÉCISION  
      ↓  
RÉPONSE ADVERSE  
      ↓  
RÉSOLUTION  
      ↓  
CONSÉQUENCE  
      ↓  
MISE À JOUR  
      ↓  
APPRENTISSAGE  
      ↓  
NOUVELLE SITUATION

Puis la boucle recommence.

---

# **105\. CE QUE LE JOUEUR DOIT RESSENTIR**

Le joueur ne doit pas avoir l’impression de :

« J’ai choisi une attaque et le jeu a lancé une animation. »

Il doit avoir l’impression de :

« Kaël a compris que je cherchais Yanis. Donc j’ai utilisé Aaron comme centre. Maintenant Lagny commence à s’adapter à Aaron. Je peux continuer, mais ils vont probablement fermer cette option. Je dois créer une autre menace. »

C’est le cœur du jeu.

---

# **106\. CE QUE LE PROTOTYPE DOIT PERMETTRE À TERME**

Une même situation :

Aaron reçoit face à Maël.

doit pouvoir donner lieu à :

* duel ;  
* passe ;  
* fixation ;  
* tir ;  
* feinte ;  
* croisement ;  
* bloc ;  
* déplacement ;  
* contre-pied ;  
* combinaison ;  
* changement de côté ;  
* temporisation.

Et chacune de ces décisions doit provoquer une réponse adverse.

C’est cette combinatoire qui donne la profondeur.

---

# **107\. RÈGLE DE DESIGN**

Ne jamais demander :

« Quelle animation faut-il créer ? »

Demander :

**« Quelle décision le joueur peut-il prendre ici ? »**

Puis seulement ensuite :

« Comment représenter cette décision avec des cercles, des flèches, des zones et le ballon ? »

Le jeu peut donc rester entièrement abstrait :

* cercles ;  
* numéros ;  
* couleurs de statut ;  
* flèches ;  
* trajectoires ;  
* zones ;  
* icônes ;  
* lignes de passe ;  
* indicateurs.

Aucune représentation d’être humain animé n’est nécessaire au fonctionnement du gameplay.

---

# **108\. PRIORITÉ DE CODAGE**

## **PRIORITÉ 1**

Terrain \+ joueurs abstraits \+ ballon.

## **PRIORITÉ 2**

Déplacement.

## **PRIORITÉ 3**

Passe / réception.

## **PRIORITÉ 4**

Duel.

## **PRIORITÉ 5**

Tir \+ gardien.

## **PRIORITÉ 6**

Défense.

## **PRIORITÉ 7**

Systèmes tactiques.

## **PRIORITÉ 8**

Fatigue.

## **PRIORITÉ 9**

Mémoire / apprentissage.

## **PRIORITÉ 10**

Mental.

## **PRIORITÉ 11**

Remplacements / temps morts.

## **PRIORITÉ 12**

Jeu à 7\.

## **PRIORITÉ 13**

Statistiques avancées.

## **PRIORITÉ 14**

Interface complète.

---

# **109\. PREMIÈRE VERSION JOUABLE**

La première version doit déjà permettre ceci :

Lancer Nangis vs Lagny

↓  
Choisir une équipe

↓  
Ballon à Yanis

↓  
Yanis reçoit

↓  
Le joueur choisit :  
    Aaron  
    Erwan  
    Edgar  
    duel  
    temporiser

↓  
Lagny réagit

↓  
Résolution

↓  
Nouvelle situation

↓  
Continuer jusqu'au but/perte de balle

↓  
Nouvelle possession

↓  
Répéter

Même avec des graphismes extrêmement simples, **si cette boucle fonctionne, le jeu existe déjà.**

---

# **110\. CRITÈRE DE RÉUSSITE DU PROTOTYPE**

Le prototype sera considéré comme réussi lorsque :

1. le joueur peut gagner le match ;  
2. l’IA peut gagner ;  
3. les mêmes tactiques ne fonctionnent pas indéfiniment ;  
4. l’IA apprend des répétitions ;  
5. les joueurs ont réellement des identités statistiques différentes ;  
6. les systèmes défensifs changent la manière de jouer ;  
7. la fatigue modifie les décisions ;  
8. les gardiens sont décisionnels ;  
9. les remplacements ont un sens ;  
10. le jeu à 7 possède un vrai risque ;  
11. les statistiques expliquent les résultats ;  
12. une partie peut produire spontanément des séquences proches du manga ;  
13. une autre partie peut produire un scénario totalement différent.

À ce moment-là, le match Nangis–Lagny n’est plus une scène du manga.

**Il devient le premier laboratoire du moteur du jeu.**

