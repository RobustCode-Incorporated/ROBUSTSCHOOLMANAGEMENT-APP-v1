# Robust School Management — Fonctionnalités

Plateforme de gestion scolaire : **backend** Node.js/Express + Sequelize + PostgreSQL, **frontend web** Vue 3 (Vite), **application mobile** Flutter.

Trois rôles : `admin`, `prof`, `eleve`. Authentification JWT (validité 24 h).

> Statut indiqué pour chaque fonctionnalité, d'après un test réel effectué le 02/10/2026 :
> ✅ fonctionne · ⚠️ fonctionne partiellement / avec défaut · ❌ cassé ou absent

---

## 1. Démarrer le projet en local

### Prérequis
- Node.js ≥ 20
- PostgreSQL 16 (ou Docker)
- (Mobile) Flutter SDK, non requis pour le web

### Base de données (via Docker)
```bash
cd robust-school-backend
set -a; source .env; set +a
docker run -d --name robust-school-db \
  -e POSTGRES_USER="$DB_USER" -e POSTGRES_PASSWORD="$DB_PASSWORD" -e POSTGRES_DB="$DB_NAME" \
  -p 5433:5432 -v robust-school-pgdata:/var/lib/postgresql/data postgres:16
```
> Le port **5433** est utilisé car 5432 est déjà pris sur cette machine par un autre projet (`rem-postgres`).
> Si 5432 est libre chez vous, utilisez `-p 5432:5432` et retirez `DB_PORT=5433` ci-dessous.

Pour arrêter / relancer la base : `docker stop robust-school-db` / `docker start robust-school-db`.

### Backend (port 5050)
```bash
cd robust-school-backend
npm install
mkdir -p uploads            # requis pour l'upload de documents
DB_PORT=5433 node src/app.js
```
Les tables sont créées automatiquement au démarrage (`sequelize.sync({ alter: true })`).

### Frontend web (port 5173)
```bash
cd robust-school-frontend-vite
npm install
npm run dev
```
Ouvrir **http://localhost:5173**.

### Comptes de test déjà créés
| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@example.com | admin1234 |
| Professeur | prof@example.com | prof1234 |
| Élève | eleve@example.com | eleve1234 |

Données de démo déjà présentes : classe **6e A (2026-2027)**, matière **Mathématiques (MATH101, coef. 4)**, un créneau le 05/10/2026 de 08:00 à 10:00 en Salle 1, l'élève inscrit en Maths avec une note de 15/20, et un document `cours.txt`.

### Mobile
L'URL de l'API est codée en dur dans `robust_school_mobile/lib/services/api_service.dart` (`http://172.20.10.7:5050/api`). Remplacez-la par l'IP locale de votre Mac, puis lancez `flutter run`.

---

## 2. Fonctionnalités par module

### 2.1 Authentification
| Fonctionnalité | Web | API | Statut |
|---|---|---|---|
| Connexion email + mot de passe | `/login` | `POST /api/auth/login` | ✅ |
| Inscription publique avec choix du rôle | `/register` | `POST /api/auth/register` | ⚠️ n'importe qui peut s'inscrire **admin** ; après inscription, le web enregistre un token `"undefined"` |
| Redirection selon le rôle | router | — | ✅ |
| Déconnexion | bouton dans chaque dashboard | — | ⚠️ la déconnexion depuis le dashboard élève appelle une mutation `logout` qui n'existe pas |
| Mot de passe oublié | — | — | ❌ absent |
| Multilingue FR/EN | — | `?lng=fr|en` (messages API) | ⚠️ côté API seulement ; l'interface web est uniquement en français |

### 2.2 Espace Administrateur (`/admin`)
| Fonctionnalité | Page | Statut |
|---|---|---|
| Statistiques (élèves, profs, matières, documents) + graphique en anneau + calendrier | `/admin` | ✅ |
| Gestion des utilisateurs (lister, modifier, supprimer) | `/admin/users` | ⚠️ fonctionne, mais l'API `/api/users` **n'exige aucune connexion** |
| Gestion des classes (CRUD) | `/admin/classrooms` | ✅ |
| Gestion des matières (CRUD, code unique, coefficient) | `/admin/subjects` | ✅ |
| Emploi du temps : créer / modifier / supprimer des créneaux | `/admin/timetable` | ✅ (crée aussi l'affectation prof↔matière↔classe) |
| Affectations des enseignants | `/admin/teaching-assignments` | ❌ appelle des routes API inexistantes (`GET/POST/DELETE /teaching-assignments`) |
| Consultation de toutes les notes + export PDF (jsPDF) | `/admin/notes` | ✅ |
| Gestion des documents (upload, liste, suppression) | `/admin/documents` | ✅ |
| Affectation élève → classe | API `POST /api/student-assignments` | ⚠️ enregistrée dans une table que le bulletin PDF ne lit pas |

### 2.3 Espace Professeur (`/prof`)
| Fonctionnalité | Page | Statut |
|---|---|---|
| Dashboard : matières/classes enseignées, nombre d'élèves, calendrier | `/prof` | ✅ |
| Saisie / modification / suppression de notes (0–20) | `/prof/notes` | ⚠️ une note hors 0–20 renvoie « Erreur serveur » (500) au lieu d'un message clair ; un prof peut modifier/supprimer la note d'un autre prof via l'API |
| Liste des élèves inscrits à ses matières | `/prof/notes` | ✅ |
| Upload / suppression de documents par classe et matière | `/prof/documents` | ✅ |
| Emploi du temps personnel | `/prof/timetable` | ✅ |

### 2.4 Espace Élève (`/eleve`)
| Fonctionnalité | Page | Statut |
|---|---|---|
| Dashboard | `/eleve` | ✅ (déconnexion défectueuse, voir 2.1) |
| Inscription / désinscription aux matières | `/eleve/inscription-matieres`, `/eleve/matieres` | ✅ |
| Consultation des notes | `/eleve/notes` | ✅ |
| Emploi du temps (selon les matières suivies) | `/eleve/timetable` | ✅ |
| Téléchargement des documents | `/eleve/documents` | ✅ |
| Profil | `/eleve/profile` | ❌ appelle `/api/users/me`, qui n'existe pas |
| Bulletin PDF (PDFKit côté serveur) | API `GET /api/pdf/bulletin/:id` | ❌ renvoie toujours « Classe non trouvée » (404) |

### 2.5 Application mobile (Flutter)
Écrans : Login, Dashboard élève/prof, Notes (élève, prof), Emploi du temps (élève, prof), Documents (élève, prof : upload + téléchargement), Matières élève.
Statut : **non testée** (Flutter n'est pas installé sur cette machine).

---

## 3. Référence API

| Ressource | Endpoints | Rôles |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` | public |
| Users | `GET/POST /users`, `PUT/DELETE /users/:id` | ⚠️ **aucun contrôle** |
| Dashboard | `GET /dashboard` | tous |
| Admin | `GET /admin/stats`, `/admin/timetable/*` | admin |
| Classes | `GET/POST /classrooms`, `PUT/DELETE /classrooms/:id` | lecture : tous ; écriture : admin |
| Matières | `GET/POST /subjects`, `PUT/DELETE /subjects/:id`, `GET /subjects/available`, `GET /subjects/enrolled`, `GET /subjects/professor/enrolled-students` | variable |
| Affectations profs | `GET /teaching-assignments/professor` | prof |
| Affectations élèves | `GET/POST /student-assignments`, `DELETE /student-assignments/:id` | admin |
| Inscriptions matières | `GET/POST /student-subjects`, `DELETE /student-subjects/:subjectId` | élève |
| Notes | `POST /notes`, `GET /notes`, `GET /notes/all`, `GET /notes/professeur`, `PUT/DELETE /notes/:id` | variable |
| Emploi du temps | `GET/POST /timetable`, `PUT/DELETE /timetable/:id`, `GET /timetable/professeur`, `GET /timetable/eleve` | variable |
| Documents | `POST /documents` (multipart `file`), `GET /documents`, `GET /documents/classroom/:id`, `GET /documents/download/:filename`, `DELETE /documents/:id` | variable |
| PDF | `GET /pdf/bulletin/:studentId` | élève (soi-même), admin |

Toutes les routes sont préfixées par `http://localhost:5050/api`. Exemples de requêtes : [`test.http`](../test.http).

---

## 4. Modèle de données

`Users` (rôle, classroomId) · `classrooms` · `subjects` (code, coefficient, professorId, classroomId) · `teaching_assignments` (prof + matière + classe, unique) · `student_subjects` (élève ↔ matière) · `student_assignments` (élève ↔ classe) · `notes` (0–20, commentaire, date) · `timetable_entries` (date, heures, salle) · `documents` (fichier, classe, matière, auteur).

⚠️ Une table `StudentAssignments` existe aussi, en double de `student_assignments`. Elle est créée par l'association `belongsToMany` dans `models/index.js`.
