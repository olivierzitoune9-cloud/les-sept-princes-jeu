# AGENTS.md — sept-princes-jeu

Workspace dédié au jeu de handball tactique, exutoire 100 pour cent licite.
Séparé de jarvis-starter-kit. Ne pas remélanger avec Wisâl.

## Projet
- Univers : Les Sept Princes, appelé aussi Le Cid Prince ou Le Cid Prince dans tes brouillons. Le canon gameplay est le roman.
- Match pilote : Nangis contre Lagny, chapitres 44 à 48.
- Interface : terrain vu du dessus, ronds abstraits numérotés, trajectoires, zones. Aucune représentation d'être animé.
- Décisions : tour par tour avec fenêtres de décision, anticipation, mémoire, adaptation. Pas de script minute par minute.

## Règles non négociables
- 100 pour cent licite : pas de représentation imagée d'êtres animés, pas de polythéisme, pas de représentation d'âme, pas de magie, pas de musique imposée, pas de pari ni lootbox.
- Exhaustivité d'abord : capturer tout ce que le hand permet depuis le roman, simplifier seulement après pour la jouabilité.
- Moteur non scripté : jamais de si minute égale 22 alors sortir Yanis. Toujours des conditions avec fatigue, efficacité, pression, décision coach.
- Le manga est un boss de référence pour calibrer, pas une cinématique à rejouer.

## Documents de vérité
- `docs/00-discussion-ia-reference.md` : discussion IA de référence, à conserver.
- `docs/01-vision-gameplay.md` : vision 70 points, à conserver.
- `docs/02-analyse.md` : analyse et ossature.
- `docs/03-prototype-jouable.md` : prototype 110 sections issu de Downloads/LSP prototype.md, à conserver. C'est la spec du premier build.
- `docs/04-gameplay-design.md` : gameplay plus UI du prototype, terrain 40 par 20, jetons, gestes, feedback sobre.
- `docs/05-systeme-match.md` : spécification du système de match, simulation avec pauses décisionnelles, 3 vitesses, primitives et versions 0.1 à 1.0.
- `docs/06-document-fonctionnel.md` : synthèse opposable pour coder.
- `docs/07-design-system.md` : sobre, tactique, premium.
- `docs/08-plan-implementation.md` : versions et critères de réussite.
- `docs/INDEX.md` : ordre de lecture et cartographie documentaire.
- `docs/09-historique-decisions.md` : décisions adoptees et raisons.
- `docs/10-registre-decisions-ouvertes.md` : questions a trancher explicitement.
- `docs/11-protocole-validation.md` : gates et rapports de test.
- `docs/12-format-fiche-situation.md` : format canonique d extraction.
- `docs/13-fiches-situation-match-44-48.md` : extraction du match pilote.
- `docs/14-rapport-systeme-match-44-48.md` : rapport de calibration du moteur.
- `docs/15-recherche-handball-multilingue.md` : recherche externe reglementaire et technique.
- Doc gameplay supplémentaire annoncé par Aaron : à ajouter en `docs/04-*.md` dès réception, sans écraser les autres.

## Agents
- `agents/agent-extracteur-match.md` : déplie chap 44 à 48 en fiches Situation.
- `agents/agent-architecte-systeme.md` : transforme fiches en mécaniques avec niveaux simple, avancé, expert.
- `agents/agent-gardien-licite.md` : bloque tout écart licite avant intégration.

## Commande
- `/pilote-lsp` via `commands/pilote-lsp.md` : tour de contrôle. État en 30 secondes, contrôle licite, une seule prochaine action, bloc de transfert prêt à coller vers la conv de code. Le codage se fait ailleurs sur ton ordre, jamais ici sans ton feu vert.

## Méthode
1. Extraire le match entier chap 44 à 48 en fiches, possession par possession, sans découpage money time.
2. Valider avec le gardien du licite.
3. Verrouiller les décisions nécessaires dans l historique et le registre ouvert.
4. Coder le noyau minimal : terrain plus ronds plus ballon, déplacement, passe et réception, duel, tir plus gardien, défense, systèmes, fatigue, mémoire, mental, remplacements, temps morts, jeu à 7.
5. Tester selon le protocole de validation : Nangis contre Lagny doit pouvoir gagner, perdre, ressembler au manga une fois sur quelques parties, et diverger totalement les autres fois, avec rapport qui explique comment et pourquoi.
