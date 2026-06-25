# Application anglais

Application mobile simple pour apprendre l’anglais avec des séries de quiz audio.

## Fonctionnalités

- Interface pensée pour téléphone Android
- Style quiz avec 4 réponses possibles
- Voix anglaise automatique avec le navigateur
- Grande banque de vocabulaire anglais-français dans `words.js`
- Mots et petites phrases avec traduction française
- Profils `Yvane` et `Nelvyn`
- Roadmap sauvegardée sur le téléphone
- Séries bloquées / débloquées progressivement
- Étoiles par série
- Validation uniquement avec plus de 50 % de bonnes réponses
- Bouton `Terminer la roadmap` quand tout est validé
- Nouveau parcours créé après chaque roadmap terminée
- Installation possible sur l’écran d’accueil Android
- Fonctionne sans serveur, sans API et sans compte

## Banque de mots

Le fichier `words.js` contient une base élargie avec plusieurs thèmes : salutations, nombres, couleurs, famille, corps humain, nourriture, animaux, maison, école, verbes, adjectifs, football, jours, transport et phrases courtes.

## Roadmap intégrée

La progression est séparée pour chaque profil.

- `0 étoile` : 50 % ou moins, la série n’est pas validée
- `1 étoile` : plus de 50 %, la série est validée
- `2 étoiles` : 70 % ou plus
- `3 étoiles` : 100 %

Une série validée débloque la série suivante.

Quand toute la roadmap est validée, le bouton `Terminer la roadmap` remet le parcours à zéro et crée un nouveau parcours avec d’autres questions.

## Fichiers

- `index.html` : application, interface, quiz, roadmap et sauvegarde locale.
- `words.js` : banque de mots anglais-français.
- `manifest.webmanifest` : installation mobile.
- `icon.svg` : icône de l’application.
- `sw.js` : cache et installation.

## Déploiement GitHub Pages

1. Ouvre le dépôt GitHub.
2. Va dans `Settings`.
3. Va dans `Pages`.
4. Dans `Branch`, choisis `main`.
5. Choisis `/root`.
6. Clique sur `Save`.
7. Attends 1 à 3 minutes.

Lien :

```text
https://chasmet.github.io/Application-anglais-/
```

## Installation sur Android

1. Ouvre le lien dans Chrome.
2. Attends que la page charge.
3. Si le bouton `INSTALLER L’APPLICATION` apparaît, appuie dessus.
4. Sinon, appuie sur les trois points en haut à droite de Chrome.
5. Appuie sur `Ajouter à l’écran d’accueil` ou `Installer l’application`.
