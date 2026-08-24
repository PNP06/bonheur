# Artheureux — architecture canonique

Ce dossier est la source structurée des deux éditions de *L’art d’être heureux*. Les fichiers JSON portent les mêmes 50 noyaux dans le même ordre, mais l’édition jeunesse possède ses propres titres et ses propres textes, écrits pour les 10–15 ans.

## Flux éditorial

`Sources publiques et repères privés → rédaction originale → JSON canonique → validations → DOCX/PDF/web → contrôles KDP et QA éditoriale`

Chaque règle conserve sa traçabilité dans `source`, son état dans `status`, ses chemins d’images dans `image` et son identifiant de publication dans `publication`. Les règles ne passent à `ready` qu’après rédaction, vérification de source, contrôle de langue, non-répétition et revue éditoriale.

Les PDF privés présents dans le dossier de travail ne sont jamais des entrées publiées. Ils servent au repérage ou à la comparaison interne uniquement ; aucun texte, visuel ou habillage privé n’est copié dans les livrables ni ajouté à Git.

## Contrat des données

- `adult.json` et `youth.json` contiennent chacun exactement 50 règles, `rule-01` à `rule-50`, dans l’ordre.
- La jeunesse relie chaque règle avec `parent_rule_id` sans copier les textes adultes.
- Les métadonnées KDP distinguent 6 × 9 pouces adulte et 7 × 10 pouces jeunesse, paperback couleur premium, papier blanc, intérieur sans bleed, images à 300 DPI effectifs minimum et texte à 7 pt minimum.
- Les fourchettes éditoriales du contrat sont contrôlées uniquement pour les règles `ready`. Les données `planned` sont des fiches de préparation.

## Contrôles de contenu

Depuis la racine du dépôt :

```powershell
python Artheureux/scripts/validate_content.py Artheureux/data/adult.json Artheureux/data/youth.json
```

Le schéma de forme est dans `schema/rule.schema.json`. Les générateurs consomment uniquement les JSON validés et produisent des livrables séparés pour l’impression KDP et le téléchargement web.

## Livraison papier

La commande de livraison est stricte par défaut : elle refuse de produire un dossier final tant que les 50 illustrations de l’édition ne sont pas prêtes et contrôlées.

```powershell
python Artheureux/scripts/build_interior_release.py --edition both --publish-web
```

Chaque dossier d’édition contient la source DOCX, le PDF intérieur KDP, le PDF allégé pour le site, la pagination des règles, la couverture complète calculée d’après le nombre final de pages et la fiche de contrôle. L’option `--publish-web` copie les PDF web validés vers `downloads` puis met à jour atomiquement `data/downloads.json` ; le site active alors les boutons correspondants sans sonder des URL absentes.

Pour une prévisualisation de travail seulement, le verrou des images peut être levé explicitement :

```powershell
python Artheureux/scripts/build_interior_release.py --edition adult --allow-incomplete-images --output-dir tmp/release-preview
```

Les fichiers produits dans `tmp` ne sont pas des livrables. Les PDF finaux du site seront exportés séparément dans `downloads` après la QA intégrale.

## Ingestion d’une illustration validée

Après téléchargement d’une image générée et contrôle visuel, l’outil d’ingestion produit les deux variantes, met à jour la règle canonique et relance les validateurs :

```powershell
python Artheureux/scripts/ingest_generated_image.py --edition adult --rule 7 --input C:\chemin\image.png --alt "Description concise de la scène"
```

Il refuse les sources de moins de 1254 pixels sur leur plus petit côté et n’écrase pas une règle déjà prête sans `--force`.

Une planche-contact facilite ensuite la revue d’ensemble ; `--strict` garantit que les 50 vignettes sont présentes avant la revue Terra finale :

```powershell
python Artheureux/scripts/build_image_contact_sheet.py --edition adult --strict --output tmp/contact-sheet-adult.png
```
