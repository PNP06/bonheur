# Spécification KDP — Artheureux

## Formats d’impression

Les deux éditions sont des paperbacks en couleur premium sur papier blanc. Le fichier intérieur est un PDF séparé pour chaque édition et doit être préparé sans bleed intérieur.

| Édition | Format fini | Impression / papier | Intérieur | Statut |
|---|---|---|---|---|
| Adulte | 6 × 9 pouces | Premium color / papier blanc | Sans bleed | Nouvelle édition |
| Jeunesse | 7 × 10 pouces | Premium color / papier blanc | Sans bleed | Édition jeunesse |

Les formats 6 × 9 et 7 × 10 pouces figurent dans les formats paperback KDP compatibles avec le premium color sur papier blanc. [KDP — Set Trim Size, Bleed, and Margins](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6)

## Intérieur

- Le PDF intérieur est au format fini exact de l’édition : 6 × 9 pouces pour l’adulte, 7 × 10 pouces pour la jeunesse.
- Aucun élément intérieur ne doit atteindre le bord de coupe ; le réglage KDP est donc **sans bleed**.
- Les images doivent avoir au minimum 300 DPI effectifs à leur taille d’impression. Une simple modification de la valeur DPI sans pixels supplémentaires ne constitue pas une amélioration. [KDP — Format Images in Your Book](https://kdp.amazon.com/en_US/help/topic/G202169030)
- Toutes les polices doivent être incorporées dans le PDF, ou apparaître comme « Embedded » / « Embedded Subset » lors du contrôle du PDF.
- Aucun texte ne doit être inférieur à 7 pt, y compris dans les images et les éléments de couverture. [KDP — Paperback Fonts](https://kdp.amazon.com/en_US/help/topic/G202145450)
- Les marges sont calculées après pagination finale, séparément pour chaque édition. La marge intérieure (gouttière) dépend du nombre final de pages ; les marges extérieure, haute et basse doivent respecter le minimum KDP applicable au livre sans bleed. [KDP — Set Trim Size, Bleed, and Margins](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6)
- Toute modification de mise en page, de taille de police, d’images ou de pagination impose de recalculer les marges et de régénérer le PDF.

Pour un intérieur sans bleed, le contrôle automatique compare la marge intérieure effective aux seuils KDP actuels : 0,375 pouce de 24 à 150 pages, 0,5 de 151 à 300, 0,625 de 301 à 500, 0,75 de 501 à 700 et 0,875 de 701 à 828 pages. Les marges extérieure, haute et basse restent au moins à 0,25 pouce. La mise en page Artheureux configure actuellement 0,86 pouce à l’intérieur, 0,58 à l’extérieur et 0,62 en haut et en bas ; la fiche finale recalcule le seuil applicable à la pagination réelle.

## Couverture

- La couverture est un fichier PDF complet séparé de l’intérieur : quatrième de couverture + dos + première de couverture sur une seule planche.
- Elle comprend un bleed de 0,125 pouce (3,2 mm) sur les quatre côtés.
- Pour le papier couleur Premium, la largeur du dos est calculée selon la formule KDP actuelle : `nombre de pages × 0,002347 pouce` (`nombre de pages × 0,0596 mm`).
- La largeur totale est `0,125 + largeur quatrième + largeur dos + largeur première + 0,125 pouce` ; la hauteur totale est `0,125 + hauteur de coupe + 0,125 pouce`.
- Le texte du dos n’est utilisé qu’au-dessus de 79 pages et conserve au moins 0,0625 pouce (1,6 mm) de sécurité de chaque côté.
- La largeur du dos et les dimensions totales de la couverture sont calculées **après pagination finale**, avec les paramètres exacts de l’édition : format, premium color, papier blanc et nombre final de pages.
- Le fichier final doit être produit à partir du gabarit ou du calculateur de couverture KDP correspondant. [KDP — Create a Paperback Cover](https://kdp.amazon.com/en_US/help/topic/G201953020)

## ISBN et édition adulte

- L’édition adulte est une nouvelle édition substantiellement nouvelle.
- Ne pas réutiliser l’ISBN `9798325081552`.
- Attribuer un nouvel ISBN compatible avec cette nouvelle édition et ce format paperback. KDP précise qu’un même ISBN ne peut pas être réutilisé pour une nouvelle édition comportant des changements significatifs. [KDP — What is an ISBN and Imprint?](https://kdp.amazon.com/en_US/help/topic/G201834170)

## Déclaration du contenu généré par IA

Lors de la publication ou de la republication, déclarer dans KDP tout contenu généré par IA utilisé dans le livre : texte, images, illustrations ou traductions. Cette déclaration couvre aussi les contenus générés puis fortement retouchés ; un contenu seulement assisté par IA doit être distingué du contenu généré selon les définitions KDP. [KDP — Content Guidelines, Artificial Intelligence (AI) content](https://kdp.amazon.com/en_US/help/topic/G200672390)

Le contrôle éditorial, la vérification des sources et la responsabilité du contenu restent humains, y compris lorsque le contenu est déclaré.

## PDF gratuit et KDP Select

Le PDF gratuit téléchargeable sur le site Bonheur est compatible avec ce plan parce que le projet ne publie aucun ebook inscrit à KDP Select. KDP Select est un programme réservé aux Kindle eBooks ; il ne s’applique donc pas aux deux paperbacks imprimés ni, dans ce projet, à un ebook KDP inexistant. [KDP — KDP Select](https://kdp.amazon.com/en_US/help/topic/G200798990)

Le PDF web reste un livrable distinct des fichiers intérieurs KDP : il doit être optimisé pour le téléchargement et ne doit pas être présenté comme un ebook KDP Select.

## Contrôle de livraison

- [ ] Format fini vérifié pour l’édition concernée.
- [ ] Premium color et papier blanc sélectionnés dans KDP.
- [ ] Intérieur sans bleed et PDF à pages simples.
- [ ] Images à au moins 300 DPI effectifs.
- [ ] Polices incorporées et taille minimale de 7 pt respectée.
- [ ] Pagination finale arrêtée avant calcul des marges et de la couverture.
- [ ] Marges recalculées selon la pagination finale.
- [ ] Couverture complète séparée, avec bleed de 0,125 pouce.
- [ ] ISBN adulte vérifié comme différent de `9798325081552`.
- [ ] Déclaration IA effectuée si du contenu a été généré par IA.
- [ ] Aucun ebook KDP Select utilisé ; PDF gratuit web vérifié séparément.
