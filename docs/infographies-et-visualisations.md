# Infographies et visualisations proposées

Ce fichier propose des supports visuels exploitables dans GitHub. Les diagrammes Mermaid sont rendus directement par GitHub dans les fichiers Markdown compatibles.

## 1. Architecture générale du bien-être

```mermaid
flowchart TD
    SWB[Bien-etre subjectif] --> Vie[Satisfaction de vie]
    SWB --> AP[Affects positifs]
    SWB --> AN[Affects negatifs limites]

    EUD[Eudemonie] --> Autonomie
    EUD --> Competence
    EUD --> Relations
    EUD --> Sens

    Flourishing --> SWB
    Flourishing --> EUD
    Flourishing --> Sante[Sante physique et mentale]
    Flourishing --> Secu[Stabilite materielle]
```

**Usage** : expliquer que le bonheur scientifique n'est pas une émotion unique.

## 2. Carte des déterminants majeurs

```mermaid
mindmap
  root((Bonheur durable))
    Relations
      Couple de qualite
      Amitie
      Famille soutenante
      Solitude faible
    Corps
      Sommeil
      Activite physique
      Sante
      Alimentation
    Psychologie
      Autonomie
      Competence
      Sens
      Regulation emotionnelle
    Socio-economie
      Securite financiere
      Travail soutenable
      Statut relatif
    Environnement
      Nature
      Lumiere
      Loisirs actifs
      Numerique maitrise
```

**Usage** : support d'introduction pour présenter la logique systémique.

## 3. Matrice importance / contrôlabilité

| Facteur | Importance | Contrôlabilité | Priorité |
|---|---:|---:|---|
| Sommeil | Très élevée | Moyenne à élevée | Haute |
| Relations proches | Très élevée | Moyenne | Haute |
| Activité physique | Élevée | Élevée | Haute |
| Santé physique | Très élevée | Moyenne | Haute |
| Autonomie | Élevée | Moyenne | Haute |
| Compétence | Élevée | Élevée | Haute |
| Sens | Élevée | Moyenne | Haute |
| Sécurité financière | Élevée si précarité | Moyenne | Variable mais forte si stress financier |
| Personnalité | Très élevée | Faible à moyenne | Indirecte |
| Statut social | Modérée | Faible à moyenne | Faible si coût élevé |
| Richesse élevée | Faible à modérée après sécurité | Moyenne | Faible à modérée |
| Gratitude | Faible à modérée | Élevée | Complément |

```mermaid
quadrantChart
    title Importance vs controlabilite
    x-axis Faible controlabilite --> Forte controlabilite
    y-axis Faible importance --> Forte importance
    quadrant-1 Leviers prioritaires
    quadrant-2 Determinants a proteger
    quadrant-3 Faible priorite
    quadrant-4 Complements faciles
    Sommeil: [0.75, 0.95]
    Relations: [0.55, 0.95]
    Activite physique: [0.85, 0.85]
    Sante: [0.55, 0.9]
    Autonomie: [0.6, 0.8]
    Competence: [0.8, 0.75]
    Sens: [0.65, 0.75]
    Finances securisees: [0.55, 0.75]
    Personnalite: [0.25, 0.85]
    Statut: [0.35, 0.45]
    Richesse elevee: [0.45, 0.35]
    Gratitude: [0.9, 0.4]
```

## 4. Boucle négative typique

```mermaid
flowchart LR
    Stress[Stress chronique] --> SommeilBas[Sommeil reduit]
    SommeilBas --> Irritabilite[Irritabilite]
    Irritabilite --> Conflits[Conflits ou retrait]
    Conflits --> Isolement[Isolement]
    Isolement --> Ruminations[Ruminations]
    Ruminations --> Stress
    SommeilBas --> Sedentarite[Sedentarite]
    Sedentarite --> Fatigue[Fatigue]
    Fatigue --> Stress
```

**Message clé** : il faut casser la boucle au point le moins coûteux : sommeil, marche, réduction numérique, contact fiable ou charge de travail.

## 5. Boucle positive réaliste

```mermaid
flowchart LR
    Reveil[Reveil stable] --> Lumiere[Lumiere matinale]
    Lumiere --> Marche[Marche courte]
    Marche --> Energie[Energie accrue]
    Energie --> Regulation[Meilleure regulation]
    Regulation --> Relations[Relations plus faciles]
    Relations --> Soutien[Soutien social]
    Soutien --> StressBas[Stress reduit]
    StressBas --> Sommeil[Sommeil meilleur]
    Sommeil --> Reveil
```

## 6. Hiérarchie des interventions

```mermaid
flowchart TD
    N1[Niveau 1: Effet maximal / effort minimal] --> A1[Reveil stable]
    N1 --> A2[Marche dehors]
    N1 --> A3[Contact fiable]
    N1 --> A4[Notifications off]

    N2[Niveau 2: Habitudes structurantes] --> B1[Sommeil 7-9 h]
    N2 --> B2[Activite physique durable]
    N2 --> B3[Relations proches]
    N2 --> B4[Budget securite]
    N2 --> B5[Competence]

    N3[Niveau 3: Optimisation avancee] --> C1[Redesign professionnel]
    N3 --> C2[Communauté]
    N3 --> C3[Projet de contribution]
    N3 --> C4[Environnement residentiel]
```

## 7. Carte des illusions humaines

```mermaid
flowchart TD
    Illusions[Illusions humaines] --> Hedonique[Adaptation hedonique]
    Illusions --> Projection[Biais de projection]
    Illusions --> Plaisir[Poursuite du plaisir]
    Illusions --> Materiel[Materialisme]
    Illusions --> Comparaison[Comparaison sociale]
    Illusions --> FOMO[FoMO]
    Illusions --> Succes[Illusion du succes]
    Illusions --> Romance[Illusion romantique]
    Illusions --> Controle[Illusion de controle]

    Hedonique --> CM1[Evaluer les semaines ordinaires]
    Projection --> CM2[Tester avant decision irreversible]
    Plaisir --> CM3[Mesurer satisfaction apres coup]
    Materiel --> CM4[Acheter temps, sante, lien]
    Comparaison --> CM5[Reduire vitrines sociales]
    FOMO --> CM6[Plages sans notifications]
    Succes --> CM7[Calculer cout total]
    Romance --> CM8[Evaluer qualite relationnelle]
    Controle --> CM9[Separer controle et influence]
```

## 8. Infographie proposée : les 10 variables sur plusieurs décennies

Format recommandé : roue ou radar à 10 axes.

Axes :

1. relations proches fiables ;
2. sommeil ;
3. santé ;
4. activité physique ;
5. autonomie ;
6. compétence ;
7. sens ;
8. sécurité financière ;
9. régulation émotionnelle ;
10. environnement attentionnel.

Notation : 0 à 4, issue du questionnaire.

## 9. Infographie proposée : pyramide des priorités

```mermaid
flowchart BT
    P1[Base: sommeil, sante, securite materielle]
    P2[Relations fiables et activite physique]
    P3[Autonomie et competence]
    P4[Sens et contribution]
    P5[Optimisations: gratitude, loisirs, spiritualite, performance]
    P1 --> P2 --> P3 --> P4 --> P5
```

Lecture : les optimisations supérieures sont moins rentables si la base est dégradée.

## 10. Graphique recommandé pour présentation

Créer un graphique en barres horizontales avec quatre colonnes qualitatives :

- importance ;
- niveau de preuve ;
- contrôlabilité ;
- délai d'effet.

Données proposées :

| Variable | Importance | Preuve | Contrôlabilité | Délai d'effet |
|---|---:|---:|---:|---:|
| Sommeil | 5 | 5 | 4 | 5 |
| Relations | 5 | 4 | 3 | 3 |
| Activité physique | 5 | 5 | 4 | 4 |
| Santé | 5 | 4 | 3 | 3 |
| Autonomie | 4 | 4 | 3 | 3 |
| Compétence | 4 | 4 | 4 | 3 |
| Sens | 4 | 3 | 3 | 2 |
| Finances | 4 | 4 | 3 | 2 |
| Numérique | 3 | 3 | 4 | 5 |
| Gratitude | 2 | 4 | 5 | 4 |

## 11. Message visuel central

Le message à mettre en avant dans tout support graphique :

> Le bonheur durable n'est pas maximisé par une émotion unique, mais par la réduction des expositions toxiques et le renforcement répété des facteurs protecteurs.
