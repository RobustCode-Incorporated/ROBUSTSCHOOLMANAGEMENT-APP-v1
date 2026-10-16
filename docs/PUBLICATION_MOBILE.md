# Publication mobile — Play Store et App Store

Guide opérationnel pour publier **Robust School** (`robust_school_mobile/`).
Contexte : D-U-N-S obtenu ; comptes développeur prêts.

| Store | Compte | Identifiant de l'app |
|---|---|---|
| Google Play Console | `robustcodeinc@gmail.com` | `com.robustcode.school` |
| Apple App Store Connect | `jeanlucluzemba@robust-code.com` (équipe `R6P6Y8948R`) | `com.robustcode.school` |

> ⚠️ `com.robustcode.school` devient **définitif** dès la première publication sur chaque store.

---

## 0. Déjà fait dans le code

- [x] Identifiant `com.robustcode.school` (Android `applicationId`/`namespace`, iOS `PRODUCT_BUNDLE_IDENTIFIER`)
- [x] Nom affiché « Robust School » (Android et iOS)
- [x] Permission `INTERNET` dans le manifeste principal (sans elle, l'app publiée ne joignait pas l'API)
- [x] Permission `REQUEST_INSTALL_PACKAGES` explicitement retirée (motif fréquent de refus Play)
- [x] HTTP autorisé **uniquement en debug** ; la version publiée exige HTTPS
- [x] Signature release lue depuis `android/key.properties` (ignoré par Git)
- [x] URL de l'API passée à la compilation : `--dart-define=API_URL=…`
- [x] Téléchargement de documents : suppression de la demande de permission « stockage », toujours refusée sur Android 13+ et absente sur iOS (les téléchargements échouaient sur les téléphones récents)
- [x] Politique de confidentialité : page publique `/confidentialite` sur le site web

---

## 1. Préparer ce Mac (une fois)

1. **Libérer au moins 15 Go** (disque à 98 % au 16/10). Pistes : Corbeille, `~/Downloads`, `docker system prune` (⚠️ supprime les conteneurs arrêtés et images inutilisées de tous vos projets), anciens simulateurs iOS (`xcrun simctl delete unavailable`), `brew cleanup`.
2. **Android Studio** (inclut le JDK requis) : <https://developer.android.com/studio>. Au premier lancement : SDK Manager → *Android SDK Command-line Tools*.
3. **Flutter** : `brew install --cask flutter`, puis :
   ```bash
   flutter doctor
   flutter doctor --android-licenses
   ```
4. **Xcode** (App Store) + `sudo gem install cocoapods` ou `brew install cocoapods`.
5. Dans le projet :
   ```bash
   cd robust_school_mobile
   flutter pub get
   flutter analyze
   dart run flutter_launcher_icons         # icônes à partir de assets/logo_black.png
   dart run flutter_native_splash:create   # écran de démarrage
   ```
   > L'application n'a encore jamais été compilée sur ce poste : `flutter analyze` peut signaler des dépendances à mettre à jour (`http 0.13`, `intl 0.18`).

## 2. Backend en ligne (prérequis aux deux stores)

Les équipes de revue Google et Apple se connectent à l'app : **l'API doit être en ligne en HTTPS** avec des comptes de démo. Voir [PLAN_DEPLOIEMENT.md](PLAN_DEPLOIEMENT.md) §2–3. Il faut :
- `https://api.<domaine>/api` accessible
- le site web en ligne, pour l'URL `https://app.<domaine>/confidentialite`
- deux comptes de démo, avec données fictives : un **élève** et un **professeur**

---

## 3. Android — Google Play

### 3.1 Clé d'upload (une seule fois, ~2 min)
```bash
mkdir -p ~/RobustSchool-keys
keytool -genkey -v -keystore ~/RobustSchool-keys/robustschool-upload.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```
Créer `robust_school_mobile/android/key.properties` :
```properties
storePassword=<mot de passe du keystore>
keyPassword=<mot de passe de la clé>
keyAlias=upload
storeFile=/Users/<vous>/RobustSchool-keys/robustschool-upload.jks
```
**Sauvegarder le `.jks` et les mots de passe** dans un gestionnaire de mots de passe, hors de ce Mac.

### 3.2 Construire
```bash
cd robust_school_mobile
flutter build appbundle --release \
  --dart-define=API_URL=https://api.<domaine>/api \
  --obfuscate --split-debug-info=build/symbols
```
→ `build/app/outputs/bundle/release/app-release.aab`

Vérifier les permissions finales :
```bash
flutter build apk --release --dart-define=API_URL=https://api.<domaine>/api
$ANDROID_HOME/build-tools/*/aapt dump permissions build/app/outputs/flutter-apk/app-release.apk
```
Attendu : `INTERNET` (et éventuellement `ACCESS_NETWORK_STATE`), **pas** `REQUEST_INSTALL_PACKAGES`.

### 3.3 Play Console (`robustcodeinc@gmail.com`)
1. **Créer l'application** : nom « Robust School », langue par défaut Français, Application, Gratuite.
2. **Configurer l'application** (tableau de bord), dans l'ordre :
   - Accès à l'application → « Toutes les fonctionnalités sont soumises à restriction » → fournir les **identifiants élève et professeur de démo**
   - Annonces → Non
   - Classification du contenu → questionnaire IARC (catégorie Éducation ; pas de violence ni de contenu généré par des inconnus)
   - Public cible → **13 ans et +** (recommandé ; en dessous, la politique Familles s'applique)
   - Sécurité des données → voir §5
   - Règles relatives aux données de santé / financières → Non concerné
   - Politique de confidentialité → `https://app.<domaine>/confidentialite`
   - Catégorie : **Éducation**, email de contact : `jeanlucluzemba@robust-code.com`
3. **Fiche du Play Store** → voir §4.
4. **Test interne** → importer l'`.aab`, accepter **Play App Signing**, ajouter votre équipe comme testeurs.
5. **Test fermé** (école pilote), puis **Production** en déploiement progressif (10 % → 50 % → 100 %).

---

## 4. Textes des fiches (FR)

**Nom** (30 car. max) : `Robust School`

**Description courte** (80 car. max) :
> Notes, emploi du temps et cours de votre école, au même endroit.

**Description longue** :
> Robust School est l'application de votre établissement scolaire pour suivre la scolarité au quotidien.
>
> Pour les élèves :
> • Consultez vos notes et les appréciations de vos professeurs
> • Retrouvez votre emploi du temps de la semaine
> • Téléchargez les supports de cours partagés par vos enseignants
> • Gérez vos matières
>
> Pour les enseignants :
> • Saisissez et modifiez les notes de vos élèves
> • Consultez votre emploi du temps
> • Partagez vos documents de cours (PDF, Word, PowerPoint, images…)
>
> Vos données sont protégées : chaque élève ne voit que ses propres notes, et les échanges sont chiffrés.
>
> Robust School nécessite un compte fourni par votre établissement.
> Édité par ROBUST CODE S.A.R.L, Kinshasa.

**Visuels à produire**
| Élément | Play Store | App Store |
|---|---|---|
| Icône | 512×512 PNG | 1024×1024 PNG (générée par `flutter_launcher_icons`) |
| Bannière | 1024×500 | — |
| Captures téléphone | 2 à 8 (1080×1920 conseillé) | 6,7" (1290×2796) **et** 6,5" (1242×2688), 3 minimum |
| Captures tablette | facultatif | iPad 13" si l'app tourne sur iPad |

Écrans à capturer : connexion · notes élève · emploi du temps · documents · saisie de notes (prof).

---

## 5. Sécurité des données (Play) / Confidentialité (App Store)

| Donnée | Collectée | Partagée | Finalité | Obligatoire |
|---|---|---|---|---|
| Nom | Oui | Non | Fonctionnement de l'app, gestion du compte | Oui |
| Adresse email | Oui | Non | Gestion du compte | Oui |
| Identifiants utilisateur | Oui | Non | Gestion du compte | Oui |
| Autre contenu généré (notes, appréciations) | Oui | Non | Fonctionnement de l'app | Oui |
| Fichiers et documents | Oui | Non | Fonctionnement de l'app | Non |
| Localisation, contacts, photos, données financières, santé | **Non** | — | — | — |

- Données chiffrées en transit : **Oui** (HTTPS)
- Suppression sur demande : **Oui** (via l'établissement ou `jeanlucluzemba@robust-code.com`)
- App Store : *Data Not Used to Track You* ; données *Linked to You* : Nom, Email, User ID, Other User Content.

---

## 6. iOS — App Store (`jeanlucluzemba@robust-code.com`)

1. **Identifiant** : <https://developer.apple.com/account> → Identifiers → `+` → App IDs → `com.robustcode.school`.
2. **App Store Connect** → Apps → `+` → Nouvelle app : plateforme iOS, nom « Robust School », langue Français, bundle ID `com.robustcode.school`, SKU `robustschool-ios`.
3. Ouvrir `robust_school_mobile/ios/Runner.xcworkspace` dans Xcode → cible Runner → *Signing & Capabilities* → équipe `R6P6Y8948R`, *Automatically manage signing*.
4. Construire :
   ```bash
   cd robust_school_mobile
   flutter build ipa --release --dart-define=API_URL=https://api.<domaine>/api
   ```
   → `build/ios/ipa/*.ipa`, à envoyer avec l'app **Transporter** (Mac App Store) ou `xcrun altool`.
5. **TestFlight** : testeurs internes, puis externes (école pilote ; la première version externe passe une revue rapide).
6. Fiche App Store : textes du §4, URL de confidentialité, URL d'assistance (site web), **compte de démo dans « Informations de revue »**, classification d'âge (questionnaire → 4+ ou 9+).
7. Soumettre à la revue (24–48 h en général).

---

## 7. Checklist avant soumission

- [ ] API en HTTPS + comptes de démo élève et prof avec données fictives
- [ ] `https://app.<domaine>/confidentialite` en ligne
- [ ] Testé sur un vrai téléphone Android **et** un iPhone en build release : connexion, notes, emploi du temps, téléchargement et ouverture d'un PDF, upload prof
- [ ] `version` dans `pubspec.yaml` incrémentée à chaque envoi (`1.0.0+1` → `1.0.1+2`…)
- [ ] Keystore + mots de passe sauvegardés hors du Mac
