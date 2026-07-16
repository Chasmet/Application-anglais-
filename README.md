# Quiz Anglais+

Application mobile d’apprentissage anglais-français pensée pour Android.

## Fonctions

- Quiz audio anglais vers français
- Quiz français vers anglais
- Jeu de paires anglais-français
- Construction de phrases mot par mot
- Voix normale et voix lente
- Affichage de la réponse anglaise et de la traduction après validation
- Roadmap de 10 séries
- Séries rapides de 3, 5 ou 10 activités
- Révision automatique des erreurs
- Vies, XP, étoiles et série quotidienne
- Profils séparés Yvane et Nelvyn
- Sauvegarde locale sur le téléphone
- PWA installable et APK Android hors ligne

## Version web

`https://chasmet.github.io/Application-anglais-/`

## APK Android

Le workflow GitHub Actions `Construire APK Android` génère automatiquement un APK à chaque mise à jour importante.

Dans GitHub :

1. Ouvrir l’onglet `Actions`.
2. Ouvrir le dernier workflow vert.
3. Télécharger l’artefact `Quiz-Anglais-Plus-APK`.
4. Ouvrir le ZIP puis installer `app-debug.apk` sur Android.

## Structure

- `index.html` : application complète
- `words.js` : banque de vocabulaire
- `lessons.js` : phrases anglaises et traductions françaises
- `android/` : projet APK Android
- `.github/workflows/build-apk.yml` : construction automatique de l’APK
