# Index documentaire

## Sources de verite

Ces documents fondent les decisions de gameplay :

1. `00-discussion-ia-reference.md` : intention et profondeur tactique ;
2. `01-vision-gameplay.md` : vision et situations ;
3. `03-prototype-jouable.md` : perimetre du premier build ;
4. `04-gameplay-design.md` : interactions et presentation ;
5. `05-systeme-match.md` : simulation et temporalite.

`02-analyse.md` est conserve comme document de travail historique. Il ne tranche aucune decision.

## Contrats derives

- `06-document-fonctionnel.md` : exigences fonctionnelles ;
- `07-design-system.md` : presentation et interaction ;
- `08-plan-implementation.md` : jalons et criteres de sortie.

## Gouvernance du projet

- `09-historique-decisions.md` : decisions prises et raisons ;
- `10-registre-decisions-ouvertes.md` : points a trancher sans les inventer ;
- `11-protocole-validation.md` : tests, rapports et gates ;
- `12-format-fiche-situation.md` : format de l extraction du match.
- `13-fiches-situation-match-44-48.md` : extraction du match pilote ;
- `14-rapport-systeme-match-44-48.md` : synthese de calibration du moteur.
- `15-recherche-handball-multilingue.md` : regles et principes techniques externes.
- `16-plan-vertical-slice-et-jeu-complet.md` : parcours de test avant extension du contenu.
- `17-audit-ecart-doc-code.md` : ecarts mesures entre sources de verite et code, plan de correction.

## Ordre de lecture avant le code

1. lire 00, 01, 03, 04 et 05 ;
2. lire 06, 07 et 08 ;
3. lire 09 et 10 pour connaitre les decisions et les reserves ;
4. lire 11 et 12 avant l extraction ou l implementation du jalon 0.1.
5. lire 13 et 14 avant de coder une regle issue du match pilote.
6. consulter 15 pour toute regle de handball qui depasse le corpus narratif.
7. suivre 16 pour construire et valider la vertical slice avant les autres personnages.
