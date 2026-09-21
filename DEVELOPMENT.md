# Développement et publication

Node 22 : `npm ci --ignore-scripts`, puis `npm run check && npm test`.
Java 17, Android SDK 35 et Gradle 8.10.2 : dans `android`, lancer `gradle :app:testDebugUnitTest :app:assembleDebug :app:lintDebug`.
Les fichiers web à la racine sont copiés dans les assets par `syncWebAssets`.

L’APK de test utilise `com.chasmet.quizanglais.preview` et le nom « Anglais+ Test » : il s’installe séparément, avec sa propre progression. L’APK principal conserve `com.chasmet.quizanglais` et l’origine WebView historique des données.

La publication nécessite quatre secrets GitHub Actions :

- `ANDROID_KEYSTORE_BASE64` : keystore privé de l’APK actuellement distribué, encodé en base64.
- `ANDROID_KEYSTORE_PASSWORD` : mot de passe du keystore.
- `ANDROID_KEY_ALIAS` : alias de sa clé.
- `ANDROID_KEY_PASSWORD` : mot de passe de la clé.

Ne jamais committer un keystore, ni en créer un autre pour contourner une incompatibilité. La clé exposée dans l’ancienne PR #10 n’est pas utilisée. Sans la clé privée originale, une mise à jour conservant l’installation existante ne peut pas être garantie. Référence : https://developer.android.com/studio/publish/app-signing

Le workflow compare la signature et le code de version à l’APK de la dernière release avant publication. Une version déjà publiée n’est jamais remplacée. Incrémenter `versionCode`, `versionName`, les notes et le nom du cache du service worker à chaque release.

La validation automatique comprend les parcours web sous jsdom, les règles de mise à jour sous JUnit, Android Lint, le contenu de l’APK et un démarrage sur émulateur Android 35. La latence réelle du micro, les voix installées, la permission d’installation et les interruptions audio restent à vérifier sur téléphone.
