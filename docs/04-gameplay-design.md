Oui. Et pour que **ce ne soit pas moche**, il faut surtout éviter deux pièges :

1. faire un prototype fonctionnel mais qui ressemble à un tableur avec des ronds ;  
2. faire un joli terrain avec des animations, mais où le gameplay réel est pauvre.

Je partirais sur une direction **très propre, premium, tactique**, entre tableau de coach, jeu de stratégie et interface sportive moderne. Le terrain reste abstrait, mais il doit donner immédiatement envie de jouer.

Je garde aussi les proportions réelles du handball : terrain 40 × 20 m, zone des 6 m, ligne des 9 m, etc. 

# **Les sept princes — GAMEPLAY \+ UI DU PROTOTYPE**

## **1\. L’écran principal**

L’écran de jeu ne doit surtout pas être rempli de boutons.

Je verrais une structure en **3 zones** :

┌──────────────────────────────────────────────────────────────┐  
│ NANGIS  22                         21  LAGNY        43:17    │  
│                                                              │  
│                                                              │  
│                    TERRAIN DE JEU                            │  
│                                                              │  
│                                                              │  
│                                                              │  
├──────────────────────────────────────────────────────────────┤  
│ AARON \#8       BALLON       SITUATION        ACTIONS         │  
│                                                             │  
│ Énergie 78%   Yanis marqué    Duel disponible              │  
│               par Kaël        Passe → Erwan                │  
│                              Fixer → Maël                  │  
│                              Tir                            │  
└──────────────────────────────────────────────────────────────┘

Mais le bas de l’écran **change en permanence selon le contexte**.

Il ne faut jamais avoir 25 boutons visibles.

---

# **2\. LE TERRAIN**

Le terrain doit être la pièce maîtresse.

Il doit respecter la géométrie du handball plutôt que représenter vaguement un rectangle. Le terrain officiel fait 40 × 20 m, avec la zone des 6 m, la ligne des 9 m, la ligne des 7 m et les buts de 3 × 2 m. 

Mais graphiquement :

### **Pas de parquet photoréaliste.**

Plutôt :

* fond sombre ;  
* terrain clair ;  
* lignes fines ;  
* zones légèrement différenciées ;  
* ombres discrètes ;  
* ballon très visible ;  
* joueurs sous forme de **jetons circulaires élégants**.

Exemple conceptuel :

             ┌──────────────────────────────┐  
              │              G               │  
              │          ╭────────╮          │  
              │       ○  │        │  ○       │  
              │          ╰────────╯          │  
              │                              │  
              │       ○          ○           │  
              │                              │  
              │             ●                │  
              │                              │  
              │       ○          ○           │  
              │                              │  
              │          ╭────────╮          │  
              │       ○  │        │  ○       │  
              │          ╰────────╯          │  
              └──────────────────────────────┘

Le terrain ne doit pas être plat visuellement.

Les zones importantes peuvent avoir une **légère profondeur visuelle** :

* zone 6 m ;  
* zone 9 m ;  
* intervalles ;  
* ailes.

---

# **3\. LES JOUEURS**

Pas de bonhommes.

Pas d’avatars.

Pas d’animation humanoïde.

Des **jetons tactiques**.

Par exemple :

### **Aaron**

      ┌───────┐  
       │  A8   │  
       └───────┘

Mais le jeton peut être rond :

       ╭─────╮  
        │ A8  │  
        ╰─────╯

Le joueur sélectionné possède un anneau lumineux.

Le porteur du ballon possède un second indicateur.

       ◉ A8  
          ●  
---

# **4\. IDENTITÉ VISUELLE DES JOUEURS**

Chaque joueur possède une petite hiérarchie visuelle :

**Numéro** \= gros.

**Nom** \= petit.

**Statut** \= icône.

Par exemple :

      ╭──────╮  
       │  8   │  
       │Aaron │  
       ╰──────╯  
          ◉

Quand Aaron a le ballon :

      ╭──────╮  
       │  8   │  
       │Aaron │  
       ╰──────╯  
          ●  
       BALLON

Pas besoin de davantage.

---

# **5\. COULEUR DES INFORMATIONS**

Il faut être très parcimonieux.

Une couleur ne doit avoir **qu’une signification**.

Par exemple :

* couleur équipe A ;  
* couleur équipe B ;  
* blanc \= information neutre ;  
* jaune \= décision disponible ;  
* rouge \= danger ;  
* vert \= opportunité.

Et surtout :

**pas de rainbow UI.**

Le jeu doit avoir une identité très sobre.

---

# **6\. QUAND TU CLIQUES SUR AARON**

Le jeton s’agrandit légèrement.

Une petite interface apparaît à proximité :

                AARON \#8  
             ARRIÈRE DROIT  
              ÉNERGIE 78%

          ┌─────────────────┐  
          │     ATTAQUER    │  
          ├─────────────────┤  
          │     PASSER      │  
          ├─────────────────┤  
          │     FIXER       │  
          ├─────────────────┤  
          │     FEINTER     │  
          ├─────────────────┤  
          │     TIRER       │  
          └─────────────────┘

Mais **les boutons sont contextuels**.

---

# **7\. CLIQUER SUR « ATTAQUER »**

L’écran change.

Les espaces exploitables apparaissent discrètement.

Par exemple :

            MAËL  
              ○

       ╲             ╱  
        ╲           ╱  
         ╲         ╱

              ● A8

Deux zones apparaissent :

      ← EXTÉRIEUR

       ↑ INTÉRIEUR

       → EXTÉRIEUR

Pas sous forme de gros boutons.

Plutôt comme des **zones tactiques directement sur le terrain**.

Le joueur clique donc **dans le terrain**.

C’est beaucoup plus élégant.

---

# **8\. ATTAQUER UN ESPACE**

Le joueur clique ici :

                ○ Maël

                  ↓

            \[ZONE LIBRE\]  
                  ↑

                 ● A8

Le jeu comprend :

Aaron attaque l’intervalle.

Une ligne apparaît.

● A8 ───────────→  
                  ╲  
                   ╲  
                    ○

Puis le jeu simule.

---

# **9\. ATTAQUER UN JOUEUR**

Le joueur peut cliquer directement sur Maël.

Alors :

**DUEL**

apparaît.

Le terrain affiche immédiatement les paramètres importants :

AARON                 MAËL

Duel      91          Duel      84  
Puissance 95          Puissance 87  
Accél.    85          Accél.    89

          INTÉRIEUR  
          EXTÉRIEUR

Mais là encore :

**pas de gros tableau permanent.**

Le tableau apparaît seulement parce que le joueur a demandé le duel.

---

# **10\. LE DUEL DOIT ÊTRE TRÈS JOUABLE**

C’est une mécanique centrale.

Le joueur ne clique pas simplement :

DUEL.

Il doit choisir :

### **Direction**

* intérieur ;  
* extérieur gauche ;  
* extérieur droit.

### **Intention**

* exploser ;  
* temporiser ;  
* feinter ;  
* provoquer ;  
* protéger.

### **Timing**

* immédiatement ;  
* après une feinte ;  
* après un déplacement.

---

# **11\. EXEMPLE**

Aaron face à Maël.

Le joueur choisit :

**Feinte extérieur → intérieur**

À l’écran :

      ○ Maël

       ← feinte

       ● Aaron

Puis :

       INTÉRIEUR →

Le jeu ne donne pas immédiatement le résultat.

Il simule :

1. feinte ;  
2. réaction Maël ;  
3. accélération Aaron ;  
4. éventuelle aide ;  
5. contact ;  
6. résultat.

Cela peut donner :

### **Réussite**

Aaron passe.

### **Réussite partielle**

Maël est battu mais Aaron doit ressortir.

### **Défenseur contient**

Aaron ne passe pas.

### **Aide**

Layo vient fermer.

### **Faute**

Maël commet une faute.

---

# **12\. LE JEU DOIT MONTRER POURQUOI**

Après une action importante, une petite notification :

**Aaron a battu Maël sur son premier appui.**

ou :

**Maël avait anticipé l’intérieur.**

ou :

**Layo est venu fermer l’intervalle.**

Pas :

« Vous avez gagné parce que votre statistique est 91\. »

Le joueur doit comprendre le handball.

---

# **13\. PASSE**

Cliquer :

**PASSER**

fait apparaître les coéquipiers accessibles.

Exemple :

                 Yanis  
                   ○  
                   ↑  
                   │  
                   │  
Erwan ○ ←──────── ● A8 ───────→ Edgar ○

Les joueurs disponibles sont légèrement mis en évidence.

---

# **14\. QUALITÉ DES PASSES**

Une passe sûre :

ligne claire.

Une passe risquée :

ligne jaune.

Une passe presque impossible :

ligne rouge.

Mais pas de gros « 27 % ».

Le joueur apprend à **lire le terrain**.

---

# **15\. MODE EXPERT**

Une petite icône :

**?**

permet de passer en analyse.

Alors :

Probabilité estimée : 74 %

apparaît.

Cela évite de transformer l’écran normal en Excel.

---

# **16\. FIXATION**

Cliquer :

**FIXER**

puis sélectionner :

Maël.

Le jeu demande :

**Quel objectif ?**

ATTIReR  
MAINTENIR  
FAIRE SORTIR  
PROVOQUER AIDE

Puis le joueur choisit.

---

# **17\. FIXATION \= INFORMATION VISUELLE**

Si Aaron fixe Maël :

Maël est relié à Aaron par une ligne fine.

Si un deuxième défenseur est attiré :

la ligne change légèrement.

Le joueur voit :

« J’ai mobilisé deux défenseurs. »

sans avoir besoin d’un texte.

---

# **18\. JOUEURS SANS BALLON**

C’est ici que le jeu devient réellement intéressant.

Cliquer sur Yanis.

Puis :

**DÉPLACER**

Le joueur clique sur une destination.

Une trajectoire apparaît :

Yanis ○  
       ╲  
        ╲  
         ╲  
          ○ destination

Puis il choisit :

### **course directe**

### **course courbe**

### **coupe**

### **croisement**

### **appel**

### **faux appel**

---

# **19\. FAUX APPEL**

Très important pour le gameplay.

Yanis peut :

courir vers une zone comme s’il voulait recevoir.

Puis :

repartir.

Le défenseur peut suivre.

Cela crée de l’espace.

---

# **20\. BLOC**

Cliquer sur Edgar :

**BLOC**

Puis sélectionner :

Maël.

Edgar reçoit une trajectoire automatique :

Edgar  
  ○  
  │  
  │  
  ↓  
████████ Maël

Le joueur choisit :

* bloc fixe ;  
* bloc mobile ;  
* bloc retardé.

---

# **21\. COMBINAISON**

Le joueur peut sélectionner plusieurs joueurs.

Exemple :

**Aaron \+ Erwan \+ Edgar \+ Yanis**

Une interface apparaît :

**CRÉER UNE SÉQUENCE**

Puis le joueur construit :

1\. Edgar fixe  
2\. Erwan attaque  
3\. Aaron croise  
4\. Yanis coupe  
5\. Choix final  
---

# **22\. MAIS PAS DE « COMBO PRÉFABRIQUÉE »**

Le jeu ne doit pas avoir :

COMBINAISON 1  
 COMBINAISON 2  
 COMBINAISON 3

Cela tuerait le concept.

Les combinaisons sont **construites par le joueur**.

---

# **23\. SYSTÈME DE « CARTES D’INTENTION »**

Pour rendre cela élégant, le joueur peut créer une séquence avec des cartes :

\[ FIXER \]  
     ↓  
\[ CROISER \]  
     ↓  
\[ ATTAQUER \]  
     ↓  
\[ LIRE \]

« LIRE » signifie :

le jeu choisit la meilleure continuation selon la réaction adverse.

---

# **24\. EXEMPLE**

Le joueur programme :

Aaron → attaque  
Erwan → vient bloquer  
Yanis → coupe

Mais ensuite :

Kaël change.

Le moteur indique :

**RÉACTION ADVERSE**

et donne :

Kaël ferme l'intérieur.

QUE FAIRE ?

→ ressortir  
→ passe Yanis  
→ passe Erwan  
→ continuer

Le joueur reprend la main.

---

# **25\. C’EST ÇA LE « TOUR »**

Le tour n’est pas :

« maintenant Aaron joue ».

Le tour est :

**« une situation tactique vient d’apparaître, décide. »**

C’est beaucoup plus intéressant.

---

# **26\. DÉFENSE**

Quand Lagny attaque :

le terrain se retourne naturellement dans la logique de contrôle.

Le joueur peut sélectionner :

Kaël.

Menu :

MARQUER  
SORTIR  
AIDER  
COUPER  
INTERCEPTER  
CHANGER  
REVENIR  
---

# **27\. MARQUAGE**

Cliquer :

**MARQUER**

puis :

Yanis.

Puis :

NORMAL  
STRICT  
À DISTANCE  
DISSUASION  
---

# **28\. DISSUASION**

C’est une mécanique très importante.

Le joueur peut demander :

« Ne cherche pas à voler la balle. Empêche Yanis de la recevoir. »

Visuellement :

la ligne de passe Yanis devient légèrement barrée.

Le joueur comprend :

cette passe est devenue difficile.

---

# **29\. AIDE**

Cliquer :

**AIDER**

puis :

Maël.

Une flèche apparaît :

Layo ○ ─────────→ Maël

Mais une autre information apparaît :

**ZONE ABANDONNÉE**

Cela permet au joueur de voir le prix de son aide.

---

# **30\. INTERCEPTION**

Cliquer :

**INTERCEPTER**

puis une ligne de passe.

La ligne est sélectionnée.

Le joueur choisit :

### **anticiper tôt**

### **anticiper tard**

Plus tôt :

* plus dangereux ;  
* plus de chances de couper.

Plus tard :

* plus sûr ;  
* moins de chance d’interception.

---

# **31\. 6-0**

Le joueur sélectionne :

**TACTIQUE → 6-0**

Les six défenseurs reprennent automatiquement leurs positions.

Mais ensuite :

le joueur peut modifier :

* profondeur ;  
* agressivité ;  
* cible ;  
* aide.

---

# **32\. 1-5**

Sélection :

**TACTIQUE → 1-5**

Puis :

joueur avancé : Kaël.

L’écran montre immédiatement la structure.

---

# **33\. 1-2-3**

Même chose.

Mais plutôt que six cercles qui se téléportent :

ils **se déplacent progressivement** vers leur position.

Cela rend la transition lisible.

---

# **34\. TRANSITION**

Quand Nangis perd la balle :

l’écran ne passe pas brutalement à une autre scène.

Les joueurs repartent immédiatement.

Le joueur voit :

PERTE

Aaron ← repli  
Yanis ← repli  
Erwan ← pression  
Edgar ← centre

Puis :

**DÉCISION DE TRANSITION**

---

# **35\. CONTRE-ATTAQUE**

Le joueur sélectionne :

Malone.

Il voit :

COURIR  
      ↓  
PASSER  
      ↓  
ATTENDRE  
      ↓  
TIRER

Mais la beauté vient du terrain :

les espaces libres sont visibles.

---

# **36\. GARDIEN**

Le gardien doit avoir une interface différente.

Lorsqu’un tir se prépare :

le jeu zoome légèrement.

Pas une animation de personnage.

Simplement :

        ┌───────────┐  
         │   BUT     │  
         │           │  
         │  ● ● ●    │  
         │           │  
         └───────────┘

Les zones de tir apparaissent discrètement.

---

# **37\. CHOIX DU TIREUR**

Malone :

tirer aile.

Le joueur choisit :

### **angle**

### **hauteur**

### **effet**

### **puissance.**

Puis :

**TIRER**

---

# **38\. GARDIEN**

Le gardien choisit :

attendre / anticiper.

S’il connaît Malone :

il peut anticiper sa roucoulette.

Mais Malone peut justement décider :

tir classique.

Le jeu crée alors un duel d’information.

---

# **39\. ANIMATION ABSTRAITE DU TIR**

Pas besoin d’animation humaine.

Le ballon devient une trajectoire.

                   ╲  
                     ╲  
                      ●  
                     /  
                    /  
             ●─────

Le gardien se déplace comme un jeton.

C’est suffisant.

---

# **40\. BUT**

Lorsqu’il y a but :

**pas d’explosion de confettis.**

Une animation sobre :

             BUT

             23 — 22

Puis le score se met à jour.

Le ballon revient au centre.

---

# **41\. UNE IDENTITÉ VISUELLE FORTE**

Je verrais une esthétique :

**sport tactique premium**

avec :

* noir profond ;  
* blanc ;  
* une couleur d’équipe ;  
* gris ;  
* petits accents lumineux ;  
* typographie très nette.

Pas besoin d’effets extravagants.

---

# **42\. LE TERRAIN DOIT RESPIRER**

Le terrain occupe **70–80 % de l’écran**.

Les menus ne doivent jamais prendre le dessus.

C’est le terrain qui raconte la situation.

---

# **43\. HUD SUPÉRIEUR**

Très minimal :

NANGIS        22 — 21        LAGNY  
                  43:17

Puis éventuellement :

● POSSESSION : NANGIS  
---

# **44\. HUD LATÉRAL**

Un petit panneau :

POSSESSION

AARON \#8

Énergie ███████░░  
Pression ██░░░░░

MENACES

Erwan  
Yanis  
Edgar  
---

# **45\. PANNEAU D’ANALYSE**

En cliquant sur une icône :

ANALYSE

Lagny ferme :  
INTÉRIEUR ████████  
EXTÉRIEUR ████░░░░

Passe vers Yanis :  
██████░░

Aide sur Aaron :  
████████

Il s’agit de visualiser les **tendances observées**, pas des vérités absolues.

---

# **46\. TIMELINE**

En bas :

40:10   41:02   42:16   43:17  
  │       │       │       │  
but     duel    perte    ACTUEL

Le joueur peut cliquer sur une action passée.

Le jeu affiche :

**Pourquoi cette possession a échoué ?**

Très utile pour apprendre.

---

# **47\. REPLAY TACTIQUE**

Pas besoin de rejouer une animation.

Le moteur peut simplement reconstituer :

43:02

Yanis reçoit  
↓  
Kaël sort  
↓  
Aaron devient disponible  
↓  
Passe  
↓  
Duel  
↓  
Aide Layo  
↓  
Recul

Le joueur peut faire :

**REJOUER**

et voir les cercles refaire la séquence.

---

# **48\. LE REPLAY DOIT ÊTRE LISIBLE**

Le jeu peut ralentir :

**0,5×**

et afficher les décisions sous forme de petits labels :

FIXATION

AIDE

INTERVALLE

PASSE

TIR

Cela donne presque un outil d’analyse vidéo.

---

# **49\. TEMPS MORT**

L’écran devient plus calme.

Le terrain passe légèrement en arrière-plan.

Au premier plan :

TEMPS MORT

NANGIS — 28  
LAGNY — 28

PROBLÈME IDENTIFIÉ

Kaël suit Yanis strictement.

OPTIONS :

\[ AARON CENTRE \]

\[ CHANGER DE CÔTÉ \]

\[ JEU PIVOT \]

\[ ACCÉLÉRER \]

\[ CONTINUER \]

Mais encore une fois :

le jeu ne donne pas nécessairement la bonne réponse.

---

# **50\. CRÉER SON PLAN**

Le joueur peut entrer dans :

**TACTIQUE**

et voir :

ATTAQUE

Centre :  
○ Yanis

Priorité :  
○ Aaron  
○ Erwan  
○ Edgar

Style :  
○ Patient  
● Équilibré  
○ Agressif  
---

# **51\. « CENTRE »**

Très important.

Le joueur peut sélectionner :

**Centre principal : Yanis**

ou :

**Centre principal : Aaron**

ou :

**Centre dynamique**

Dans le dernier cas :

le moteur choisit selon la situation.

---

# **52\. CENTRE DYNAMIQUE**

Exemple :

Yanis marqué.

Le système détecte :

Aaron possède davantage de liberté.

Il propose :

**Aaron peut prendre le centre.**

Le joueur valide.

Aaron se repositionne.

---

# **53\. SYSTÈMES OFFENSIFS VISUELS**

Au lieu d’une liste :

1-2-3  
6-0  
2 pivots  
jeu à 7

le joueur voit des **schémas miniatures**.

Par exemple :

     ○   ○   ○  
   ○      ○      ○  
           ○

Il clique sur le schéma.

---

# **54\. ÉDITEUR TACTIQUE**

À terme, le joueur peut déplacer les cercles lui-même.

Il crée :

       A

   E          Y

        P

Puis donne des intentions :

* A fixe ;  
* E bloque ;  
* Y coupe ;  
* P ressort.

Le système sauvegarde la combinaison.

---

# **55\. MAIS LE JEU NE DOIT PAS DEVENIR UN ÉDITEUR COMPLIQUÉ**

L’éditeur avancé doit être optionnel.

Le joueur débutant peut simplement :

choisir une intention.

Le joueur expert peut :

construire la séquence complète.

---

# **56\. CONTRÔLE AU DOIGT**

Sur téléphone :

### **Tap**

sélectionner.

### **Tap sur joueur**

ouvrir actions.

### **Glisser**

déplacement.

### **Glisser joueur → joueur**

passe ciblée.

### **Glisser joueur → zone**

course.

### **Maintenir**

options avancées.

### **Double tap**

action rapide.

---

# **57\. EXEMPLE DE GESTURE**

Aaron avec ballon.

Tu glisses :

**Aaron → Erwan**

\= passe.

Tu glisses :

**Aaron → zone 2–3**

\= attaque.

Tu fais :

**tap Aaron → FIXER → Maël**

\= fixation.

Tu fais :

**maintenir Aaron**

\= menu avancé.

C’est beaucoup plus naturel qu’une succession de menus.

---

# **58\. CLAVIER/SOURIS**

Pour ordinateur :

### **clic gauche**

sélection.

### **clic droit**

menu contextuel.

### **glisser**

déplacement / cible.

### **espace**

pause.

### **1**

passe.

### **2**

attaque.

### **3**

tir.

### **4**

tactique.

### **Tab**

analyse.

Mais les raccourcis doivent rester secondaires.

---

# **59\. FEEDBACK**

Chaque action doit produire une réaction visuelle courte.

### **Passe réussie**

ligne blanche rapide.

### **Passe interceptée**

ligne cassée.

### **Fixation réussie**

défenseur légèrement attiré.

### **Duel gagné**

déplacement net du porteur.

### **Duel perdu**

porteur ralenti/rejeté.

### **Fatigue**

anneau qui diminue.

### **Pression**

petit indicateur autour du joueur.

---

# **60\. PAS D’EFFETS « JEU MOBILE CHEAP »**

Éviter :

* \+15 \!  
* CRITICAL \!  
* combo x8 ;  
* explosions ;  
* grosses flammes ;  
* écrans qui tremblent.

Le jeu doit donner l’impression :

**« Je regarde un système tactique extrêmement précis. »**

---

# **61\. EFFETS SONORES**

Même sans représenter de personnes, le son peut énormément aider.

* bruit léger du ballon ;  
* signal de possession ;  
* sifflet ;  
* buzzer ;  
* impact ;  
* filet ;  
* chrono.

Mais pas besoin de musique.

L’ambiance doit rester sportive et concentrée.

---

# **62\. LE BALLON**

Le ballon est très important visuellement.

Il doit être légèrement plus lumineux que les joueurs.

Quand il circule :

une petite traînée très discrète peut montrer sa trajectoire.

---

# **63\. VITESSE DE SIMULATION**

En haut :

▶  ×1

Cliquer :

×0.5  
×1  
×2  
×4

À ×4 :

le jeu accélère entre les décisions.

Lorsqu’une décision importante apparaît :

retour automatique à ×1 ou pause.

---

# **64\. « MOMENTUM » VISUEL**

Il ne faut pas afficher un vulgaire :

MORAL \+12.

Mais on peut montrer :

NANGIS  
↗ dynamique

LAGNY  
↘ sous pression

C’est une information secondaire.

---

# **65\. FATIGUE**

Autour du cercle :

  ╭──────╮  
  ╱   8    ╲  
 │  AARON   │  
  ╲\_\_\_\_\_\_\_\_╱

L’anneau extérieur se réduit progressivement.

Pas de barre énorme.

---

# **66\. PRESSION**

Quand Aaron est fortement pressé :

un second anneau apparaît.

  ◎ A8

Plus l’anneau est marqué :

plus la pression est importante.

---

# **67\. DÉFENSE**

Quand Kaël marque Yanis :

une ligne très fine relie les deux.

Yanis ○ ───── ○ Kaël

Quand le marquage devient strict :

la ligne devient plus présente.

---

# **68\. AIDE**

Si Layo aide :

Yanis ○ ─── ○ Kaël  
             ↖  
              ○ Layo

Le joueur voit immédiatement :

Kaël \+ Layo sont sur la même menace.

---

# **69\. ESPACE LIBRE**

Un espace exploitable ne doit pas être une énorme zone verte.

Une **légère pulsation** ou un contour discret suffit.

Ainsi :

le joueur apprend à regarder les espaces.

---

# **70\. INTERVALLES**

Les intervalles 1–2 / 2–3 / 3–2 / 2–1 peuvent être indiqués uniquement lorsque le joueur les cherche.

Exemple :

      1       2       3

       │   2–3 ↓   │

Cela évite de surcharger l’écran.

---

# **71\. MODE « LECTURE »**

Bouton :

**LIRE**

Le jeu ralentit fortement.

Les menaces apparaissent :

AARON       █████  
YANIS       ████  
ERWAN       ████  
EDGAR       ███

Le joueur peut analyser avant de décider.

---

# **72\. MODE « EXÉCUTION »**

Bouton :

**JOUER**

Le terrain redevient propre.

Les aides disparaissent.

Le match reprend.

---

# **73\. LE JOUEUR DOIT POUVOIR JOUER SANS UI**

À terme, un joueur expert doit pouvoir presque tout faire depuis le terrain.

Exemple :

je prends Aaron → je glisse vers l’intervalle → je fais apparaître Yanis → je passe.

Pas besoin de menus.

---

# **74\. LES MENUS SERVENT À L’INTENTION COMPLEXE**

Les menus servent quand tu veux dire :

« Je veux que Kaël suive Yanis strictement mais qu’il puisse abandonner son marquage si Aaron attaque son intervalle. »

Ça, c’est une consigne avancée.

---

# **75\. LE TERRAIN EST DONC L’INTERFACE**

C’est le principe fondamental de l’UI.

**Pas :**

terrain \+ énorme menu.

Mais :

**terrain interactif \+ menus contextuels.**

---

# **76\. ÉCRAN DE FIN**

Après le match :

NANGIS

30 — 29

VICTOIRE

Puis :

ANALYSE DU MATCH

61 possessions

Efficacité offensive  
58 %

Pertes  
7

Buts  
30  
---

# **77\. PUIS LES JOUEURS**

AARON \#8

8 buts  
6 passes  
5/7 duels  
2 pertes

IMPACT

Création       ████████░░  
Duel           █████████░  
Lecture        ████████░░  
Défense        ██████░░░░  
---

# **78\. PUIS LES TACTIQUES**

VOS SYSTÈMES

1-2-3          64 %  
6-0            23 %  
jeu à 7        13 %

CENTRE

Yanis          41 possessions  
Aaron          17 possessions

DUELS

Aaron/Maël  
Aaron : 6  
Maël : 3  
---

# **79\. PUIS « CE QUI A CHANGÉ »**

Très important.

Le jeu génère :

**À la 43e minute, Lagny a commencé à fermer Aaron.**

**Votre utilisation d’Erwan a alors augmenté l’espace disponible pour Edgar.**

**Le jeu à deux pivots a produit 3 occasions en 5 possessions.**

Ce sont des observations, pas une note.

---

# **80\. LE RAPPORT DOIT ÊTRE VISUEL**

Pas un mur de chiffres.

On peut avoir :

                1re MT        2e MT

Yanis              ████████      ████  
Aaron              █████         ███████  
Erwan              ██████        ██████

Puis :

changement de centre

avec un marqueur temporel.

---

# **81\. REVOIR UNE POSSESSION**

Cliquer sur :

**43:17**

Le jeu revient à la possession.

Tu peux regarder :

**lecture normale**

ou

**lecture tactique**.

---

# **82\. LECTURE TACTIQUE**

Chaque décision apparaît au-dessus du joueur :

YANIS  
FIXATION

KAËL  
MARQUAGE

AARON  
DÉPLACEMENT

ERWAN  
BLOC

MAËL  
AIDE

AARON  
PASSE

Cela donne une sorte de replay analytique.

---

# **83\. CE QUI RENDRA LE JEU BEAU**

Pas la quantité de décorations.

Ce sera :

### **1\. Les déplacements fluides des cercles.**

### **2\. Les trajectoires élégantes.**

### **3\. Les lignes de passe.**

### **4\. Les changements de structure.**

### **5\. Les transitions rapides.**

### **6\. Les petits effets de lumière lors des décisions importantes.**

### **7\. Une typographie impeccable.**

### **8\. Une hiérarchie visuelle très claire.**

---

# **84\. ANIMATION DES JETONS**

Les cercles doivent avoir de petites animations :

* déplacement fluide ;  
* accélération ;  
* ralentissement ;  
* rotation très légère lors d’un changement de direction ;  
* pulsation lors d’une sélection.

Pas de personnage.

Mais le terrain doit quand même **vivre**.

---

# **85\. TRAJECTOIRES**

Les trajectoires ne doivent pas être des traits permanents.

Elles apparaissent :

quand une décision est préparée.

Puis disparaissent après l’action.

Cela garde l’écran propre.

---

# **86\. UNE POSSESSION IMPORTANTE**

Quand une action devient tactiquement cruciale :

le jeu peut légèrement :

* ralentir ;  
* réduire les informations secondaires ;  
* mettre en évidence les joueurs concernés.

Exemple :

Aaron vs Maël.

Tout le reste devient légèrement moins présent.

Le duel devient le centre de l’attention.

---

# **87\. LE « MOMENT »**

C’est la version abstraite d’un moment fort du manga.

Par exemple :

Aaron va attaquer Maël pour la cinquième fois.

Le jeu peut afficher discrètement :

**DUEL 5**

Puis :

Maël connaît maintenant fortement cette tendance.

Cela donne du poids à l’histoire du match.

---

# **88\. MAIS PAS DE CINÉMATIQUE**

Même dans un moment fort :

le joueur garde le contrôle.

Le jeu ne lui vole jamais la partie.

---

# **89\. LE BOSS LAGNY**

Pour le premier test, Lagny doit justement être magnifique à jouer contre.

Le joueur doit sentir :

« Ils comprennent ce que je fais. »

Pas :

« Ils ont \+20 partout. »

Par exemple :

Tu utilises Yanis trois fois.

Kaël commence à fermer.

Tu utilises Aaron.

Maël vient.

Tu utilises Edgar.

Layo aide.

Tu changes côté.

Néo suit.

Le joueur pense :

**« Putain, ils lisent vraiment. »**

C’est ça le boss.

---

# **90\. LE MOMENT OÙ LE JOUEUR COMPREND**

Le jeu ne doit pas lui expliquer :

« Utilise Aaron centre. »

Il doit observer :

Yanis → Kaël dessus  
Aaron → Maël  
Erwan → Layo  
Edgar → deux défenseurs

Puis comprendre :

« Si Aaron prend le centre, je déplace complètement la structure. »

Il clique :

**AARON → CENTRE**

Les positions changent.

Et soudain :

nouvelle configuration.

C’est une récompense intellectuelle.

---

# **91\. CE QU’IL FAUT ABSOLUMENT ÉVITER**

### **Menus permanents**

Non.

### **Barres partout**

Non.

### **Gros chiffres**

Non.

### **50 boutons**

Non.

### **Combos prédéfinis**

Non.

### **Animations humaines**

Non.

### **Scènes scriptées**

Non.

### **« Ultimate attacks »**

Non.

### **Système de rareté façon gacha**

Non.

### **Statistiques qui résolvent automatiquement les actions**

Non.

---

# **92\. CE QU’IL FAUT PRIVILÉGIER**

**Terrain d’abord.**

**Information ensuite.**

**Décision ensuite.**

**Statistiques en soutien.**

**Animation minimale mais élégante.**

**IA adaptative.**

**Conséquences lisibles.**

---

# **93\. LE PREMIER ÉCRAN QU’IL FAUT CODER**

Je commencerais littéralement par ça :

┌──────────────────────────────────────────┐  
│ NANGIS              0 — 0          LAGNY │  
│                              00:00       │  
├──────────────────────────────────────────┤  
│                                          │  
│                 TERRAIN                  │  
│                                          │  
│        ○              ○                 │  
│                                          │  
│              ○        ○                 │  
│                                          │  
│                   ●                      │  
│                                          │  
│              ○        ○                 │  
│                                          │  
│        ○              ○                 │  
│                                          │  
├──────────────────────────────────────────┤  
│ Aucune action sélectionnée               │  
│                                          │  
│ \[PAUSE\]     \[TACTIQUE\]     \[ANALYSE\]     │  
└──────────────────────────────────────────┘

Puis :

**Tu cliques sur Yanis.**

Et seulement à ce moment-là, l’interface d’action apparaît.

---

# **94\. LE PREMIER TEST**

Le premier prototype esthétique doit permettre cette séquence :

### **Écran 1**

Nangis 0–0 Lagny.

### **Écran 2**

Yanis reçoit.

### **Écran 3**

Tu cliques Yanis.

### **Écran 4**

Tu vois :

Passe / Attaque / Fixer / Tirer / Déplacer.

### **Écran 5**

Tu sélectionnes :

Passe → Aaron.

### **Écran 6**

La passe est dessinée.

### **Écran 7**

Kaël réagit.

### **Écran 8**

Aaron reçoit.

### **Écran 9**

Tu cliques Aaron.

### **Écran 10**

Tu sélectionnes :

Duel → Maël → intérieur.

### **Écran 11**

Maël réagit.

### **Écran 12**

Le duel se résout.

### **Écran 13**

Nouvelle situation.

Et tu recommences.

**Si cette boucle est belle, fluide et intéressante avec seulement des cercles, tu as déjà le cœur du jeu.**

---

# **95\. LA VISION ESTHÉTIQUE FINALE**

Je viserais quelque chose qui donne cette impression :

**un logiciel tactique de haut niveau transformé en jeu vidéo.**

Le joueur doit avoir envie de regarder le terrain.

Les cercles ne doivent pas paraître être une limitation.

Ils doivent devenir **le langage graphique du jeu**.

Et surtout, il faut que lorsque tu vois :

            ○ Kaël

      ○ Maël        ○ Layo

              ● Aaron

       ○ Erwan       ○ Yanis

tu comprennes déjà :

**« Il y a quelque chose à faire ici. »**

Sans qu’on ait besoin de te mettre dix boutons devant les yeux.

C’est exactement cette qualité de représentation qui permettra au jeu de rester abstrait tout en étant **beau, lisible et profondément tactique**.

