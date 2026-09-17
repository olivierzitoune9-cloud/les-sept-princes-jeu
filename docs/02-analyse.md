# 02 — Analyse de la vision (par Muse Spark)

## Ce que les deux docs disent vraiment

Les deux documents convergent vers une seule idée forte, formulée dans le point 70 de la vision :
gagner parce qu'on a compris, pas parce qu'on a les meilleures stats.

Le jeu visé n'est ni un Pokémon like ni un FM like. C'est :
- une boucle observation, adaptation, contre adaptation, usure, clutch ;
- jouée à plusieurs niveaux en même temps : déplacement, intention, interaction, anticipation, adaptation, collectif, match ;
- avec une interface à ronds abstraits, sans représentation d'être animé, sans shirk, sans âme, sans musique imposée.

Le doc discussion apporte la méthode : ne pas limiter d'abord, capturer tout depuis le match Lagny contre Nangis chapitres 44 à 48, avec le format Situation, infos, décisions porteur, décisions partenaires, décisions défenseurs, timing, résultat, conséquences, nouvelles options.

Le doc vision apporte le système : 70 points qui couvrent porteur, trajectoires, intervalles, fixation, duel, passes, blocs, pivot, permutations, strict avec coût, déclencheurs SI X ALORS Y, patterns et faux patterns, gardien stratège, profils qui modifient les solutions et pas seulement les chiffres, brouillard d'information, scouting, entraînement.

## Points forts à garder tels quels

1. Situations plutôt que boutons. Exemple Pierre fixe, Erwan, Yanis, croisé Aaron, menace Teddy et Edgar, lâcher Erwan. C'est une chaîne de décisions, pas une combinaison bouton.
2. Intervalles dynamiques. Aaron proche de Layo ouvre entre Aaron et Edgar. On crée pour exploiter ensuite.
3. Strict avec coût. Kaël neutralise Yanis mais libère Aaron. Pas de solution défensive absolue.
4. Défense à phases. 1-2-3 hybride phase Aaron plus Yanis puis Edgar. Déclencheurs programmables.
5. Gardien comme lecteur. Liam lit Malone artiste qui cherche la roucoulette. Duel mental à deux niveaux.
6. Patterns enregistrés et découverts en jouant, pas donnés. 63 pour cent côté gauche, recherche de Malone après fixation Kaël.
7. Fatigue qui rend une stratégie gagnante intenable. Le 1-2-3 marche puis épuise.
8. Niveaux de contrôle simple, intermédiaire, expert. Indispensable pour ne pas faire une usine à gaz.

## Trois risques majeurs

1. Explosion combinatoire. Si chaque porteur a 12 déplacements fois 10 intentions fois 6 passes fois 6 trajectoires, chaque possession devient injouable. Il faudra contraindre par le contexte : proposer seulement les décisions pertinentes pour la situation, comme le dit le point 56.
2. IA interprétation contre IA stats. Le doc demande une IA qui se trompe intelligemment, qui croit qu'Aaron va passer demi puis se fait surprendre par Yanis. C'est le plus dur à coder. Il faut le traiter comme un module à part, pas comme un bonus de difficulté.
3. Fidélité au roman contre jouabilité. Se calquer sur Lagny contre Nangis est bon pour le pilote, mais le roman contient des ellipses et des focuses narratifs. Il faudra distinguer action montrée, action impliquée, action à inventer pour boucher les trous sans trahir l'esprit.

## Ce que je propose comme ossature pour la suite

- Un noyau situationnel : état avec positions en zones, intervalles avec état ouvert ou fermé, ballon, fatigue, connaissance des duos, patterns observés, chrono, temps morts.
- Un langage d'ordres ouvert : verbe plus cible plus timing, pour attaque et défense, avec 6 verbes de base seulement.
- Un moteur de résolution en ordre hand réel : fixation, aide, passe ou tir, gardien, transition.
- Un module anticipation : intention défensive secrète qui donne bonus si elle colle, malus si elle rate.
- Un module mémoire : patterns perso et équipe, avec découverte progressive et brouillard.
- Un module profils : même situation résolue différemment par Yanis passe, Aaron duel, Erwan accélération, Malone tir improbable, Kaël nouvelle combinaison.

Match pilote verrouillé : Lagny contre Nangis, chapitres 44 à 48. Prochaine étape : déplier chaque possession en fiche Situation avec les 8 champs de la méthode, sans filtrer d'abord.
