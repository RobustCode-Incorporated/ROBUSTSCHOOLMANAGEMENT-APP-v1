# Roadmap de tests manuels — Robust School Management

À dérouler sur **http://localhost:5173**, avec le backend lancé (voir [FONCTIONNALITES.md](FONCTIONNALITES.md#1-démarrer-le-projet-en-local)).
Cochez chaque case. Pour chaque échec, notez : page, action, résultat obtenu, message de la console navigateur (F12).

Légende : 🐞 = bug déjà identifié, le test doit échouer tant qu'il n'est pas corrigé.

Comptes : `admin@example.com / admin1234` · `prof@example.com / prof1234` · `eleve@example.com / eleve1234`

---

## Phase 0 — Préparation (5 min)
- [ ] Le backend affiche `Serveur lancé sur le port 5050` et `Base de données synchronisée`
- [ ] http://localhost:5050/ affiche « Bienvenue sur Robust School »
- [ ] http://localhost:5173 redirige vers `/login`
- [ ] Ouvrir la console développeur (F12), onglets **Console** et **Network**

## Phase 1 — Authentification (15 min)
- [ ] Connexion admin → redirection vers `/admin`
- [ ] Connexion prof → `/prof`
- [ ] Connexion élève → `/eleve`
- [ ] Mauvais mot de passe → message d'erreur clair, pas de redirection
- [ ] Email au format invalide → message d'erreur
- [ ] Accès direct à `/admin` sans être connecté → renvoi vers `/login`
- [ ] Connecté en élève, saisir `/admin` dans l'URL → renvoi (pas d'accès)
- [ ] Déconnexion admin → retour à `/login` ; le bouton « précédent » ne redonne pas accès
- [ ] Déconnexion prof → idem
- [ ] 🐞 Déconnexion depuis le **dashboard élève** → vérifier l'erreur `unknown mutation type: logout` dans la console
- [ ] 🐞 `/register` : créer un compte **Admin** → aujourd'hui c'est possible (faille). Noter le comportement après inscription (token `"undefined"` dans localStorage)
- [ ] Inscription avec un email déjà utilisé → « Email déjà utilisé »
- [ ] Mot de passe < 6 caractères → refusé

## Phase 2 — Administrateur (45 min)
### Dashboard
- [ ] Les compteurs (élèves, profs, matières, documents) correspondent aux données
- [ ] Le graphique en anneau s'affiche
- [ ] Le calendrier montre le créneau du 05/10/2026

### Utilisateurs `/admin/users`
- [ ] La liste affiche les 3 comptes, sans mot de passe visible
- [ ] Créer un prof « Marie Curie » → apparaît dans la liste
- [ ] Modifier son nom → enregistré après rechargement (F5)
- [ ] Changer son mot de passe → elle peut se connecter avec le nouveau
- [ ] Supprimer un utilisateur → disparaît
- [ ] 🐞 Sécurité : dans un onglet privé (non connecté), ouvrir http://localhost:5050/api/users → aujourd'hui la liste s'affiche (elle devrait renvoyer 401)

### Classes `/admin/classrooms`
- [ ] Créer « 5e B / 5e / 2026-2027 »
- [ ] Créer avec un champ vide → refusé
- [ ] Modifier puis supprimer une classe

### Matières `/admin/subjects`
- [ ] Créer « Français / FR101 / coef 3 »
- [ ] Créer une 2ᵉ matière avec le code `FR101` → doit être refusée (code unique). Noter le message affiché
- [ ] Modifier le coefficient, supprimer une matière

### Emploi du temps `/admin/timetable`
- [ ] Créer un créneau Français / Marie Curie / 5e B, lundi 08:00–09:00
- [ ] Heure de fin avant l'heure de début → refusé
- [ ] Créer 2 créneaux qui se chevauchent pour le même prof → noter le résultat (aucun contrôle de conflit n'existe aujourd'hui)
- [ ] Modifier puis supprimer un créneau

### Affectations enseignants `/admin/teaching-assignments`
- [ ] 🐞 La page charge-t-elle des données ? (attendu aujourd'hui : erreur, les routes API n'existent pas)

### Notes `/admin/notes`
- [ ] Toutes les notes sont listées (élève, prof, matière, classe)
- [ ] « Exporter en PDF » → un PDF lisible est téléchargé

### Documents `/admin/documents`
- [ ] Upload d'un PDF avec classe + matière → apparaît dans la liste
- [ ] Upload d'un gros fichier (> 20 Mo) → noter le comportement (aucune limite aujourd'hui)
- [ ] Téléchargement → le fichier est identique à l'original
- [ ] Suppression → disparaît de la liste

## Phase 3 — Professeur (30 min)
- [ ] Dashboard : matière Mathématiques / 6e A, avec le nombre d'élèves = 1
- [ ] Calendrier : créneau du 05/10
- [ ] `/prof/timetable` : affiche uniquement les créneaux de ce prof
- [ ] `/prof/notes` : l'élève Jean Luc apparaît dans la liste des inscrits
- [ ] Ajouter une note de 12,5 avec un commentaire → visible dans la liste
- [ ] 🐞 Note de 25 → aujourd'hui « Erreur serveur » (attendu : « La note doit être entre 0 et 20 »)
- [ ] Note de -1 → idem
- [ ] Modifier une note → la nouvelle valeur apparaît côté élève
- [ ] Supprimer une note
- [ ] Noter une matière qui n'est pas la sienne (via un 2ᵉ prof) → refusé (403)
- [ ] `/prof/documents` : upload d'un document pour 6e A / Maths
- [ ] Le prof voit-il les documents des autres profs ? Noter le comportement

## Phase 4 — Élève (30 min)
- [ ] Dashboard s'affiche avec ses infos
- [ ] `/eleve/inscription-matieres` : s'inscrire à Français
- [ ] Se réinscrire à la même matière → « Déjà inscrit »
- [ ] `/eleve/matieres` : Maths + Français, avec le prof et la classe
- [ ] Se désinscrire de Français → disparaît ; ses créneaux disparaissent de l'emploi du temps
- [ ] `/eleve/timetable` : créneaux des seules matières suivies
- [ ] `/eleve/notes` : 15/20 en Maths avec le commentaire « Bien »
- [ ] `/eleve/documents` : `cours.txt` visible et téléchargeable
- [ ] 🐞 `/eleve/profile` : aujourd'hui erreur (route `/users/me` absente)
- [ ] 🐞 Bulletin PDF : http://localhost:5050/api/pdf/bulletin/{id-élève} (avec token) → aujourd'hui 404 « Classe non trouvée »
- [ ] Un élève ne doit pas pouvoir télécharger le bulletin d'un autre élève (403)

## Phase 5 — Transverse (20 min)
- [ ] **Responsive** : tester chaque dashboard en largeur mobile (F12 → icône téléphone, 375 px)
- [ ] **Navigateurs** : Chrome, Safari, Firefox
- [ ] **Session** : après 24 h (ou en supprimant le token), la prochaine action renvoie au login, sans écran blanc
- [ ] **Rechargement** : F5 sur chaque page ne déconnecte pas l'utilisateur
- [ ] **Accents** : noms avec é, è, ç, œ et apostrophes enregistrés et affichés correctement
- [ ] **Langue API** : `http://localhost:5050/?lng=en` → message en anglais

## Phase 6 — Mobile (après installation de Flutter)
- [ ] Changer `baseUrl` dans `lib/services/api_service.dart` avec l'IP du Mac
- [ ] Connexion élève et prof
- [ ] Notes, emploi du temps, documents (téléchargement + ouverture du fichier)
- [ ] Prof : upload d'un document depuis le téléphone
- [ ] Android et iOS

---

## Modèle de fiche bug
```
ID : BUG-001
Rôle : élève | prof | admin
Page / endpoint :
Étapes :
  1.
  2.
Résultat attendu :
Résultat obtenu :
Console / réponse réseau :
Gravité : bloquant | majeur | mineur | cosmétique
```

## Bugs déjà identifiés (à vérifier puis corriger)
| # | Gravité | Description | Fichier |
|---|---|---|---|
| 1 | Bloquant (sécurité) | `/api/users` sans authentification (lister, créer, modifier, supprimer) | `robust-school-backend/src/routes/usersRoutes.js` |
| 2 | Bloquant (sécurité) | Inscription publique en tant qu'admin | `authController.js`, `RegisterView.vue` |
| 3 | Bloquant (sécurité) | `.env` (mot de passe DB + `JWT_SECRET`) versionné dans Git | `robust-school-backend/.env` |
| 4 | Majeur | Bulletin PDF toujours en 404 (2 tables d'affectation élève↔classe) | `models/index.js`, `pdfRoutes.js` |
| 5 | Majeur | Page Affectations enseignants : routes API manquantes | `teachingAssignmentRoutes.js`, `TeachingAssignmentsManagement.vue` |
| 6 | Majeur | Profil élève : `/users/me` manquant | `usersRoutes.js`, `EleveProfile.vue` |
| 7 | Majeur | Un prof peut modifier/supprimer n'importe quelle note | `noteRoutes.js` (PUT/DELETE) |
| 8 | Moyen | Note hors 0–20 → 500 au lieu de 400 | `noteRoutes.js` |
| 9 | Moyen | Déconnexion élève : mutation `logout` inexistante | `EleveDashboard.vue` |
| 10 | Moyen | Après inscription, token `"undefined"` stocké | `store/index.js` |
| 11 | Moyen | Dossier `uploads/` absent du dépôt → upload en erreur sur une installation neuve | backend |
| 12 | Mineur | Imports dont la casse diffère des noms de fichiers (`TimetableManagement.vue`, `ProfTimeTable.vue`) : le build fonctionne sur macOS mais cassera sur un serveur Linux | `router/index.js` |
| 13 | Mineur | URL `http://localhost:5050` codée en dur (web) et IP codée en dur (mobile) | `plugins/axios.js`, `store/index.js`, `api_service.dart` |
