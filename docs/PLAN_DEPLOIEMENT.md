# Plan de déploiement et de publication — Robust School Management

Objectif : mettre en ligne l'API et le site web, puis publier l'application mobile **Android sur le Google Play Store**.
Pré-requis : les points de sécurité **S1 à S6** et les fonctions cassées **F1 à F5** du [rapport de tests](RAPPORT_TESTS_2026-10-13.md) sont corrigés. Publier une app dont l'API expose tous les comptes serait un risque majeur, d'autant que les données concernent des élèves mineurs.

---

## 1. Architecture cible

```
 Téléphone Android ─┐
                    ├──HTTPS──▶  API Node/Express  ──▶  PostgreSQL managé
 Navigateur web ────┘   api.<domaine>     │
        ▲                                 └──▶  Stockage fichiers (documents)
        │
 Site Vue (statique)  app.<domaine>
```

| Brique | Recommandé | Alternative économique |
|---|---|---|
| Base de données | **Neon** (PostgreSQL managé, sauvegardes, branche de test gratuite) | PostgreSQL sur le même VPS |
| API | **Render** ou **Railway** (déploiement Docker depuis GitHub, HTTPS automatique) | **VPS** (Hetzner / OVH / Contabo) avec Docker Compose et Caddy pour le HTTPS |
| Documents | **Cloudflare R2** ou S3. Le disque d'un PaaS est effacé à chaque redéploiement, donc les fichiers seraient perdus. | Dossier `uploads/` sur le disque du VPS, sauvegardé chaque nuit |
| Site web | **Vercel** ou Netlify (gratuit, CDN, HTTPS) | Servi par Caddy sur le VPS |
| Domaine | ex. `robustschool.app` → `api.` + `app.` | — |

Deux environnements : **staging**, pour vos tests et ceux des testeurs Play, puis **production**.

---

## 2. Mise en ligne du backend (≈ 3–4 jours)

1. **Configuration par variables d'environnement** : `DATABASE_URL`, `JWT_SECRET` (nouveau, long et aléatoire), `CORS_ORIGIN`, `PORT`, identifiants du stockage. Ajouter `.env.example` et sortir `.env` de Git.
2. **Base** : remplacer `sequelize.sync({ alter: true })` par des **migrations** (`sequelize-cli db:migrate`), activer SSL vers Neon, fusionner les tables `StudentAssignments` / `student_assignments`.
3. **Upload** : passer de `multer.diskStorage` au stockage objet (R2/S3). Limiter la taille (20 Mo) et les types (PDF, images, Office).
4. **Durcissement** : `helmet`, CORS limité à `app.<domaine>`, limitation du nombre de tentatives sur `/auth/login`, route `/health` pour la supervision.
5. **Dockerfile** + déploiement automatique depuis la branche `main` (staging) et à partir d'un tag de version (production).
6. **Supervision** : logs centralisés, alerte si `/health` ne répond plus (UptimeRobot gratuit), sauvegarde quotidienne de la base.
7. Créer le **premier compte admin** par script (et non via `/register`).

## 3. Mise en ligne du site web (≈ 1 jour)

1. Remplacer toutes les URL `http://localhost:5050` par `import.meta.env.VITE_API_URL` (fichiers `plugins/axios.js`, `store/index.js`, `AdminDashboard.vue`…).
2. Corriger la casse des imports (`TimetableManagement.vue`, `ProfTimeTable.vue`). Sinon le build échoue sur les serveurs Linux de Vercel.
3. Ajouter la réécriture SPA (`vercel.json` : toutes les routes → `index.html`). Sinon, un F5 sur `/admin/users` affiche une erreur 404.
4. Brancher le dépôt GitHub sur Vercel (dossier racine `robust-school-frontend-vite`) avec `VITE_API_URL=https://api.<domaine>/api`.

---

## 4. Application Android → Google Play Store

### 4.1 Préparer le poste (½ jour)
- Installer **Flutter** (`brew install --cask flutter`) puis lancer `flutter doctor`. Le SDK Android est déjà présent sur ce Mac (`~/Library/Android/sdk`).
- Accepter les licences : `flutter doctor --android-licenses`.
- Tester sur un téléphone réel en mode développeur, ou sur l'émulateur.

### 4.2 Mettre le code en conformité (1–2 jours)
| Action | Fichier |
|---|---|
| Identifiant unique et définitif, par ex. `cd.robustcode.school` ou `com.robustcode.school`. **Il ne pourra plus jamais être changé après publication.** Déplacer aussi le package Kotlin `MainActivity`. | `android/app/build.gradle.kts` (`namespace`, `applicationId`) |
| Ajouter `<uses-permission android:name="android.permission.INTERNET"/>` | `android/app/src/main/AndroidManifest.xml` |
| URL de l'API passée au build : `const apiUrl = String.fromEnvironment('API_URL')`, en **HTTPS** | `lib/services/api_service.dart` |
| Nom affiché sur le téléphone : « Robust School » | `AndroidManifest.xml` (`android:label`) |
| `description` du `pubspec.yaml` ; version `1.0.0+1` puis +1 à chaque envoi | `pubspec.yaml` |
| Générer icônes et splash : `dart run flutter_launcher_icons` puis `dart run flutter_native_splash:create` | — |
| Vérifier les permissions finales (`aapt dump permissions` sur l'APK). Si `REQUEST_INSTALL_PACKAGES` apparaît (plugin `open_file`), remplacer le plugin par `open_filex` ou retirer la permission dans le manifeste. | `pubspec.yaml` |
| Version Android cible : régler `targetSdk` sur l'exigence en vigueur dans la Play Console au moment de l'envoi | `build.gradle.kts` |
| Mettre à jour les dépendances anciennes (`http 0.13`, `intl 0.18`) et lancer `flutter analyze` | `pubspec.yaml` |

### 4.3 Signature de l'application (½ jour) ⚠️ critique
```bash
keytool -genkey -v -keystore ~/robustschool-upload.jks -keyalg RSA -keysize 2048 \
        -validity 10000 -alias upload
```
- Créer `android/key.properties` (mots de passe, chemin du `.jks`) et l'ajouter au `.gitignore`.
- Dans `build.gradle.kts`, déclarer un `signingConfig` « release » qui lit `key.properties`, à la place de `signingConfigs.getByName("debug")`.
- **Sauvegarder le `.jks` et les mots de passe** dans un coffre (1Password, Bitwarden) et hors de l'ordinateur. Avec **Play App Signing** (obligatoire), une clé d'upload perdue peut être réinitialisée via le support Google, mais la procédure prend du temps.

### 4.4 Construire le paquet
```bash
flutter build appbundle --release \
  --dart-define=API_URL=https://api.<domaine>/api \
  --obfuscate --split-debug-info=build/symbols
```
Résultat : `build/app/outputs/bundle/release/app-release.aab`. Google Play exige le format `.aab` (pas d'`.apk`) pour toute nouvelle application.

### 4.5 Compte Google Play Console
| Option | Coût | Conditions |
|---|---|---|
| **Compte Organisation** (recommandé : ROBUST CODE S.A.R.L) | 25 $ une fois | Numéro **D-U-N-S** de la société (gratuit, compter 1 à 4 semaines), site web, email et téléphone vérifiés. **Pas de test fermé obligatoire.** |
| Compte Personnel | 25 $ une fois | Pièce d'identité. **Test fermé obligatoire avant la production : au moins 12 testeurs inscrits pendant 14 jours consécutifs.** |

👉 Demander le D-U-N-S **dès maintenant** : c'est l'étape la plus longue.

### 4.6 Fiche Play Store et déclarations
- **Fiche** : nom (30 caractères max), description courte (80) et longue (4 000), icône 512×512, bannière 1024×500, au moins 2 captures téléphone (idéalement une par écran clé : connexion, notes, emploi du temps, documents).
- **Politique de confidentialité** : URL publique obligatoire (page sur le site web). Elle doit couvrir les données collectées (nom, email, notes, documents), la finalité, la conservation, la suppression et un contact.
- **Sécurité des données (Data safety)** : déclarer les données personnelles et scolaires collectées, chiffrées en transit (HTTPS), et la possibilité de demander leur suppression.
- **Accès à l'application** : l'app exige une connexion, il faut donc **fournir à Google un compte de démo élève et un compte prof** sur l'API de production, avec des données fictives.
- **Public cible** : les utilisateurs sont des élèves, donc potentiellement des mineurs. Si des moins de 13 ans sont visés, la **politique Familles** de Google s'applique (exigences renforcées). Option plus simple : public cible « 13 ans et + », avec des comptes créés uniquement par l'établissement.
- **Classification du contenu** (questionnaire IARC), **publicités** : non, **catégorie** : Éducation.

### 4.7 Pistes de publication
1. **Test interne** (jusqu'à 100 testeurs, disponible en quelques minutes) : votre équipe.
2. **Test fermé** : une école pilote (enseignants et élèves). Obligatoire pendant 14 jours si compte personnel.
3. **Production** en **déploiement progressif** : 10 % → 50 % → 100 % des utilisateurs, en surveillant les plantages.
4. Examen Google : de quelques heures à environ 7 jours pour une première publication.

### 4.8 Après publication
- **Firebase Crashlytics** pour suivre les plantages, et Android Vitals dans la Play Console.
- À chaque mise à jour : incrémenter `version` dans `pubspec.yaml`, reconstruire l'`.aab`, publier en test interne, puis en production.
- Changement d'API incompatible : garder l'API rétro-compatible, car les utilisateurs ne mettent pas tous à jour en même temps.

### 4.9 iOS (plus tard)
Compte Apple Developer (99 $/an, D-U-N-S également requis pour une organisation), Xcode sur ce Mac, `flutter build ipa`, puis TestFlight et App Store. Mêmes prérequis : identifiant (`com.robustcode.school`), HTTPS, politique de confidentialité.

---

## 5. Calendrier indicatif

| Semaine | Travaux | En parallèle |
|---|---|---|
| S1 | Correctifs sécurité S1–S6 + bugs F1–F5 | **Demande D-U-N-S** · achat du domaine |
| S2 | Backend + base + stockage en **staging** ; site web sur Vercel | Rédaction de la politique de confidentialité |
| S3 | App mobile : identifiant, permissions, HTTPS, signature, icônes ; tests sur téléphones réels | Création du compte Play Console |
| S4 | Production backend/web ; fiche Play Store ; **test interne** | Captures d'écran, textes |
| S5–S6 | **Test fermé** avec une école pilote (14 jours si compte personnel) | Corrections remontées |
| S7 | **Production Android** en déploiement progressif | — |

## 6. Budget indicatif

| Poste | Coût |
|---|---|
| Google Play Console | 25 $ (une fois) |
| Domaine | ~10–20 $/an |
| Neon / Render / Railway (démarrage) | 0–25 $/mois selon l'offre |
| ou VPS tout-en-un | ~5–15 $/mois |
| Cloudflare R2 (documents) | gratuit jusqu'à 10 Go |
| Apple Developer (si iOS) | 99 $/an |

## 7. Décisions à prendre ensemble
1. **Hébergement** : PaaS (Neon + Render/Railway + Vercel, plus simple) ou **VPS unique** (moins cher, plus de maintenance) ?
2. **Nom de domaine** ?
3. **Identifiant de l'app** (définitif) : `com.robustcode.school` ?
4. **Compte Play** : organisation (D-U-N-S) ou personnel (test fermé de 14 jours) ?
5. **Âge minimum** des utilisateurs de l'app : 13 ans et + ou plus jeune (politique Familles) ?
6. **École pilote** pour le test fermé ?
