
ROBUST CODE S.A.R.L | 1431 bis Avenue Prison, Quartier Ndolo, Commune de Barumbu|RCCM: CD/KNG/RCCM/24-B-03978 |ID Nationale: 01-J6100-N69522B 

Numéro d’impôt: A2439824P  

Phone number: +32467613480 

E-mail: luzembajean-luc@outlook.com 

Picture 

Documentation Technique — Robust School Management App 

  

📌 Présentation générale 

  

Robust School Management App est une plateforme complète de gestion académique destinée aux établissements éducatifs. Elle permet une gestion centralisée des élèves, professeurs, matières, emplois du temps, documents et notes. 

  

L’application est structurée autour d’un backend en Node.js/Express avec Sequelize (ORM pour PostgreSQL), un frontend web en Vue.js et une application mobile en Flutter pour élèves et professeurs. L’application est multilingue (Français et Anglais), responsive et conçue pour un déploiement évolutif en SaaS. 

🧱 Architecture générale 

📦 robust-school/ 

├── backend/ (Node.js + Express + Sequelize + PostgreSQL) 

├── frontend/ (Vue.js) 

└── mobile/ (Flutter) 

  

🔧 Backend 

  

⚙️ Stack technique 

	•	Langage : JavaScript (Node.js) 

	•	Framework : Express.js 

	•	ORM : Sequelize 

	•	Base de données : PostgreSQL 

	•	Sécurité : Middleware d’authentification JWT 

	•	Internationalisation : i18next 

  

📂 Modèles de données (tables) 

Table 

Description 

Users 

Stocke les utilisateurs (élèves, professeurs, administrateurs) 

StudentAssignments 

Assignation des élèves à une classe 

Classrooms 

Gestion des classes de l’établissement 

Documents 

Fichiers partagés entre enseignants et élèves 

Notes 

Notes des élèves pour les matières 

StudentSubjects 

Inscription des élèves à des matières 

Subjects 

Matières enseignées 

TeachingAssignments 

Attribution des matières aux professeurs 

TimetableEntries 

Créneaux horaires (emploi du temps) 

SequelizeMeta 

Gestion des migrations Sequelize 

  

  

🔒 Authentification et rôles 

	•	Système JWT avec rôles : admin, teacher, student 

	•	Middleware authMiddleware([role]) pour sécuriser les routes 

  

📡 API REST 

  

L’API expose des routes sécurisées pour chaque ressource : 

	•	/api/users — CRUD utilisateurs (admin seulement) 

	•	/api/classrooms — CRUD classes 

	•	/api/subjects — CRUD matières 

	•	/api/notes — Gestion des notes par professeurs 

	•	/api/documents — Upload & gestion des documents 

	•	/api/timetable — CRUD emploi du temps 

	•	/api/student-subjects — Inscription des élèves aux matières 

  

⸻ 

  

🖥️ Frontend Web (Vue.js) 

  

🌐 Technologies 

	•	Vue.js 3 

	•	Heroicons 

	•	Vue-Cal pour l’agenda 

	•	Axios pour la communication avec l’API 

	•	CSS personnalisé avec Tailwind utility-style 

  

🎨 Design unifié 

	•	Polices utilisées : 

	•	Ysabeau Office : Titre principal 

	•	ABeeZee : Champs de saisie 

	•	Inter : Boutons 

	•	Apple SD Gothic Neo : Liens secondaires 

	•	Couleurs principales : 

	•	Bleu foncé : #0E2C5A 

	•	Bleu bouton : #104B71 

	•	Gris clair : #707070 

  

🧭 Pages disponibles 

  

1. Authentification 

	•	Connexion 

	•	Enregistrement 

	•	Changement de langue 

  

2. Dashboard administrateur 

	•	Gestion des utilisateurs 

	•	Gestion des classes, matières, notes 

	•	Calendrier des événements 

	•	Téléversement de documents 

  

3. Dashboard professeur 

	•	Visualisation des classes et matières 

	•	Gestion des notes des élèves 

	•	Upload de documents par matière 

  

4. Dashboard élève 

	•	Emploi du temps dynamique 

	•	Notes obtenues 

	•	Téléchargement des documents 

  

⸻ 

  

📱 Application mobile (Flutter) 

  

📦 Technologies 

	•	Flutter (Dart) 

	•	Intégration API REST avec http 

	•	State management : Provider 

	•	Routes : Définies dans main.dart 

	•	Écrans adaptés pour les profils élève et professeur 

  

📲 Écrans principaux 

	•	LoginScreen 

	•	DashboardScreen 

	•	ProfNotesScreen : Ajout/modification des notes 

	•	TimetableScreen : Affichage dynamique de l’emploi du temps 

	•	DocumentScreen : Consultation et téléchargement de fichiers 

  

Les écrans reprennent la logique et l’apparence de la version web, avec une cohérence des couleurs, polices, et composants UI. 

  

⸻ 

  

📤 Export PDF 

	•	Export des notes au format relevé universitaire 

	•	Génération côté serveur avec ReportLab (Python) ou future intégration avec Node.js 

	•	Contient : 

	•	Logo de l’école 

	•	Informations élèves 

	•	Notes par matière 

	•	Pied de page personnalisé 

  

⸻ 

  

🌍 Multilingue 

	•	Prise en charge français / anglais 

	•	Détection de langue au démarrage 

	•	Possibilité de changer la langue dans les interfaces utilisateur 

  

⸻ 

  

🧪 Tests & Déploiement 

	•	Tests manuels sur environnements dev et prod 

	•	Frontend et backend déployables sur VPS, services cloud ou Docker 

	•	Préparation pour future version SaaS avec configuration multi-établissements 

  

 

📈 Roadmap (V1 → V2) 

Étape 

Objectif 

✅ V1 

Backend + Web + Mobile opérationnels 

🔜 V1.1 

Amélioration UI/UX + Ajout notifications 

🔜 V2 

Version SaaS multi-institutions, dashboard analytique, système de messagerie interne 

  

🧾 Annexes 

  

Structure des rôles dans Users : 

  

Role 

Description 

admin 

Gestion globale de l’application 

 

teacher 

 

Enseignement, gestion notes/docs 

 

student 

Suivi des cours, emploi du temps, notes 

 

  

✉️ Contact & Support 

  

Pour toute question, suggestion ou personnalisation du système : 

  

Responsable : Jean-Luc LUZEMBA 

Email : jeanlucluzemba@robust-code.com 

   

   
