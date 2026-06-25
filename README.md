# Application anglais

Application mobile simple pour apprendre l’anglais avec des séries de quiz audio.

## Fonctionnalités

- Interface pensée pour téléphone Android
- Style quiz avec 4 réponses possibles
- Voix anglaise automatique avec le navigateur
- Bouton `Je ne peux pas écouter` pour afficher le mot écrit
- Profils `Yvane` et `Nelvyn`
- Roadmap sauvegardée sur le téléphone
- Séries bloquées / débloquées progressivement
- Étoiles par série
- Validation uniquement avec plus de 50 % de bonnes réponses
- Score final
- Meilleur score sauvegardé sur le téléphone
- Installation possible sur l’écran d’accueil Android
- Fonctionne sans serveur, sans API et sans compte

## Roadmap intégrée

La progression est séparée pour chaque profil.

Règle de validation :

- `0 étoile` : 50 % ou moins, la série n’est pas validée
- `1 étoile` : plus de 50 %, la série est validée
- `2 étoiles` : 70 % ou plus
- `3 étoiles` : 100 %

Une série validée débloque la série suivante.

## Fichiers

- `index.html` : contient toute l’application, le style, le JavaScript, la roadmap et la sauvegarde locale.
- `manifest.webmanifest` : permet l’installation comme application mobile.
- `icon.svg` : icône de l’application.
- `sw.js` : service worker pour rendre l’application installable et ouvrir plus vite.

## Déploiement GitHub Pages

1. Ouvre le dépôt GitHub.
2. Va dans `Settings`.
3. Va dans `Pages`.
4. Dans `Branch`, choisis `main`.
5. Choisis `/root`.
6. Clique sur `Save`.
7. Attends 1 à 3 minutes.

L’application sera disponible à cette adresse :

```text
https://chasmet.github.io/Application-anglais-/
```

## Installation sur Android

1. Ouvre le lien dans Chrome.
2. Attends que la page charge.
3. Si le bouton `INSTALLER L’APPLICATION` apparaît, appuie dessus.
4. Sinon, appuie sur les trois points en haut à droite de Chrome.
5. Appuie sur `Ajouter à l’écran d’accueil` ou `Installer l’application`.

## Limites V1

- La voix dépend du navigateur du téléphone.
- Les scores sont sauvegardés seulement sur l’appareil utilisé.
- Pas encore de compte en ligne.
- Pas encore d’images ou de niveaux avancés.
