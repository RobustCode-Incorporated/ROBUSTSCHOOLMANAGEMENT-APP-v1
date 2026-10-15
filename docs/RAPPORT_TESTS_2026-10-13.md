# Rapport de tests fonctionnels — 13/10/2026

Environnement : local (API `localhost:5050`, web `localhost:5173`, PostgreSQL 16 sous Docker).
Méthode :
- **API** : 68 tests automatisés couvrant tous les endpoints et les 3 rôles, avec contrôle des droits et des cas limites.
- **Web** : 29 tests dans un vrai navigateur (Chromium via Playwright). Chaque page de chaque rôle est ouverte, avec capture des erreurs JS et des requêtes en échec. La déconnexion, l'inscription et l'affichage mobile (375 px) sont aussi testés.
- **Mobile** : lecture du code et de la configuration. L'application n'a pas pu être lancée, faute de Flutter installé sur la machine.

Les données créées par les tests ont été supprimées. Seuls les 3 comptes de démo restent.

## Synthèse

| Périmètre | Résultat |
|---|---|
| API | **52 / 68** ✅ |
| Web (navigateur) | **24 / 29** ✅ |
| Mobile — endpoints appelés | tous existent et fonctionnent ✅ |
| Mobile — prêt pour le Play Store | ❌ 5 bloquants (voir plus bas) |

---

## ✅ Ce qui fonctionne

**Authentification** : connexion des 3 rôles, redirection par rôle, refus des mauvais mots de passe, des emails invalides, des mots de passe trop courts, des emails en double, des tokens invalides ou absents. Déconnexion admin et prof.

**Admin**
- Dashboard (compteurs, graphique, calendrier)
- Utilisateurs : créer, lister sans mot de passe, filtrer par rôle, modifier, supprimer
- Classes : créer, valider les champs, modifier, supprimer
- Matières : créer, modifier, supprimer
- Emploi du temps : créer, refuser une heure de fin avant le début, modifier, supprimer
- Affectation élève → classe
- Toutes les notes, avec export PDF
- Documents

**Professeur**
- Dashboard avec matières, classes et nombre d'élèves
- Emploi du temps personnel
- Liste des élèves inscrits
- Notes : saisir, modifier et supprimer les siennes. Il ne peut pas noter une matière qui n'est pas la sienne.
- Documents : upload et suppression

**Élève**
- Matières disponibles, inscription (doublon refusé), désinscription
- Emploi du temps calculé selon les matières suivies
- Ses notes, et seulement les siennes
- Documents : liste et téléchargement, contenu vérifié identique
- Il ne peut pas télécharger le bulletin d'un autre élève

**Sécurité OK** : le téléchargement est limité au dossier `uploads` (pas de lecture du `.env`). Les droits de base par rôle sont respectés : un prof ne crée pas de classe, un élève ne voit pas toutes les notes.

**Mobile** : les 13 appels API de l'application (login, notes élève/prof, emploi du temps, documents, matières) répondent correctement.

---

## ❌ Ce qui bloque

### Sécurité — bloquant avant toute mise en ligne
| # | Problème | Constat |
|---|---|---|
| S1 | `/api/users` sans aucune protection | Un visiteur anonyme liste tous les utilisateurs, **crée un compte admin**, modifie ou supprime n'importe qui. Un élève connecté aussi. |
| S2 | Inscription publique en **admin** | `POST /auth/register` avec `role: admin` → 201 |
| S3 | Un prof modifie la note d'un **autre** prof | `PUT /notes/:id` → 200, note réellement modifiée |
| S4 | Un élève voit les documents de **toutes** les classes | `GET /documents` sans filtre → documents d'autres classes visibles |
| S5 | Aucun contrôle du type de fichier envoyé | Un `.html` contenant du script est accepté |
| S6 | `.env` (mot de passe DB, `JWT_SECRET`) versionné dans Git | — |

### Fonctionnel
| # | Problème | Où |
|---|---|---|
| F1 | **Bulletin PDF** : toujours 404 « Classe non trouvée » | API `/pdf/bulletin/:id` |
| F2 | **Affectations enseignants** : la page ne charge rien (routes `GET/POST /teaching-assignments` absentes) | `/admin/teaching-assignments` |
| F3 | **Profil élève** vide (`/users/me` absent) | `/eleve/profile` |
| F4 | **Inscription aux matières** (élève) : appel à une route inexistante. Message d'erreur affiché, et « Aucune matière inscrite » alors que l'élève est inscrit. Page sans mise en forme. | `/eleve/inscription-matieres` |
| F5 | **Inscription `/register`** : le site enregistre le token `"undefined"` et reste sur la page | `/register` |
| F6 | Une note `"abc"` est acceptée et **enregistrée comme `NaN`** | `POST /notes` |
| F7 | Note > 20, code matière en double, matière incomplète → **« Erreur serveur » (500)** au lieu d'un message clair | notes, matières |
| F8 | Deux créneaux qui se chevauchent pour le même prof sont acceptés | emploi du temps |
| F9 | La suppression d'un élève ou d'une matière laisse des **notes orphelines** (élève/matière vidés) | base de données |
| F10 | Déconnexion élève : erreur console `unknown mutation type: logout` (la déconnexion fonctionne quand même) | `/eleve` |
| F11 | Page « Mes notes » élève : déborde de 161 px sur mobile (tableau trop large) | `/eleve/notes` |
| F12 | Page « Gestion des notes » admin : pas de menu latéral, pas de retour au dashboard | `/admin/notes` |

### Mobile — bloquants pour le Play Store
| # | Problème | Fichier |
|---|---|---|
| M1 | Identifiant `com.example.robust_school_mobile` : **refusé par Google Play** | `android/app/build.gradle.kts` |
| M2 | Version release signée avec la **clé de debug** : refusée par Google Play | `android/app/build.gradle.kts` |
| M3 | Permission `INTERNET` absente du manifeste principal : **l'app publiée ne pourra pas joindre l'API** | `android/app/src/main/AndroidManifest.xml` |
| M4 | API en `http://172.20.10.7` codée en dur : Android bloque le HTTP non chiffré, il faut une API en **HTTPS** publique | `lib/services/api_service.dart` |
| M5 | Aucun backend en ligne pour l'instant | — |
| M6 | À vérifier : le plugin `open_file` peut déclarer `REQUEST_INSTALL_PACKAGES`, ce qui déclenche un refus Play si non justifié | `pubspec.yaml` |

---

## Ordre de correction recommandé
1. **S1 à S6** (sécurité) : aucune mise en ligne avant.
2. **F1 à F5** (pages cassées).
3. **F6 à F9** (validation et intégrité des données).
4. **M1 à M6**, en même temps que le déploiement du backend (voir [PLAN_DEPLOIEMENT.md](PLAN_DEPLOIEMENT.md)).
5. **F10 à F12** (finitions).
