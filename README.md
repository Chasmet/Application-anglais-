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

Le workflow `Vérifier et construire Anglais+` exécute les tests web et Android, compile l’application et vérifie son démarrage et ses réglages sur émulateur Android 35. L’artefact `Anglais-Plus-4.0.0-preview` contient une application de test séparée, « Anglais+ Test ».

La publication de l’APK principal nécessite la clé privée correspondant à la version actuellement distribuée. Le workflow vérifie cette compatibilité avant de créer une nouvelle release ; sans les secrets de signature, seule la version de test est produite. Voir [DEVELOPMENT.md](DEVELOPMENT.md).

La version 4.0 ajoute la reprise des séances, l’export/restauration de la progression, le choix de voix et de taille du texte, et des dialogues corrigés. Les sauvegardes se trouvent dans Réglages. Voir [les changements](RELEASE-NOTES.md).

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
