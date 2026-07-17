# Quiz Anglais+ 3

Application mobile anglais-français pensée pour Android, utilisable hors ligne et sans API.

## Niveaux

- Débutant A1
- Moyen A2–B1
- Confirmé B1–B2
- Test de niveau automatique
- Roadmap indépendante de 10 séries pour chaque niveau

## Contenu

- Plus de 700 mots et expressions
- Plus de 140 phrases traduites
- 32 mini-dialogues
- 30 activités de grammaire
- Thèmes : salutations, nombres, couleurs, famille, corps, nourriture, animaux, maison, école, sport, voyage, météo, vêtements, métiers, santé, émotions, technologie, environnement, travail, société et phrasal verbs

## Activités

- Écoute anglais vers français
- Écoute et choix du mot anglais
- Français vers anglais
- Paires anglais-français
- Construction de phrases mot par mot
- Mot manquant
- Vrai ou faux
- Dictée au clavier
- Mini-dialogues
- Grammaire expliquée
- Voix normale et voix lente
- Affichage de l’anglais et du français après validation

## Progression

- Profils séparés Yvane et Nelvyn
- Vies, XP, étoiles et série quotidienne
- Défi du jour
- Entraînements rapides de 5 ou 10 questions
- Révision automatique des erreurs
- Suivi des mots maîtrisés
- Questions récentes évitées pour limiter les répétitions
- Progression sauvegardée sur le téléphone

## Version web

`https://chasmet.github.io/Application-anglais-/`

## APK Android

Le workflow GitHub Actions `Construire APK Android` vérifie les fichiers JavaScript, compile l’application Android et génère l’artefact `Quiz-Anglais-Plus-v3-APK`.

## Structure

- `index.html` : écrans de l’application
- `style.css` : interface mobile
- `app.js` : moteur des quiz et de la progression
- `words.js` : banque historique
- `words-debutant.js` : vocabulaire A1
- `words-moyen.js` : vocabulaire A2–B1
- `words-confirme.js` : vocabulaire B1–B2
- `lessons.js` et `phrases-extra.js` : phrases anglaises et traductions
- `activities-extra.js` : dialogues et grammaire
- `android/` : projet APK Android
- `.github/workflows/build-apk.yml` : construction automatique de l’APK
