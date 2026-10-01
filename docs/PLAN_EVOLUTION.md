# Plan de mise à niveau et d'évolution — Robust School Management

Point de départ : V1 fonctionnelle (le parcours admin → prof → élève marche de bout en bout), mais avec des failles de sécurité et plusieurs fonctions cassées (voir [ROADMAP_TESTS.md](ROADMAP_TESTS.md#bugs-déjà-identifiés-à-vérifier-puis-corriger)).
Ordre recommandé : **sécuriser → stabiliser → industrialiser → enrichir → passer en SaaS**.

---

## Phase 1 — Sécurité (urgent, ~1 semaine)
| Action | Détail |
|---|---|
| Protéger `/api/users` | Ajouter `authMiddleware(['admin'])` sur toutes les routes ; créer `GET /users/me` pour tout utilisateur connecté |
| Fermer l'inscription admin | `/auth/register` : rôle forcé à `eleve` (ou inscription fermée). Seul un admin crée les profs et les admins |
| Retirer `.env` de Git | Ajouter `.env` au `.gitignore`, fournir un `.env.example`, **changer le mot de passe DB et le `JWT_SECRET`** (ils sont dans l'historique Git) |
| Contrôle d'appartenance | Un prof ne modifie/supprime que ses propres notes et documents ; un élève ne télécharge que les documents de ses classes/matières |
| Uploads | Limite de taille (ex. 20 Mo), liste blanche de types (PDF, images, Office), nom de fichier aléatoire, contrôle de chemin sur `/download/:filename` |
| Durcissement HTTP | `helmet`, CORS restreint au domaine du frontend, `express-rate-limit` sur `/auth/login` |
| Journalisation | Retirer les `console.log` de tokens/rôles ; logger structuré (pino) |

## Phase 2 — Stabilisation (~2 semaines)
- **Modèle de données** : supprimer le doublon `StudentAssignments` / `student_assignments` (une seule table d'affectation élève↔classe), ce qui répare le bulletin PDF.
- **Migrations** : remplacer `sequelize.sync({ alter: true })` par des migrations `sequelize-cli` versionnées. `alter` en production risque de casser ou de perdre des données.
- **Routes manquantes** : CRUD `/teaching-assignments` pour la page admin, `/users/me`.
- **Validation** : schémas Joi sur toutes les routes d'écriture ; erreurs de validation renvoyées en 400 avec un message lisible.
- **Frontend** : un seul client HTTP (`plugins/axios.js`) partout ; URL de l'API via `VITE_API_URL` ; casse des imports corrigée ; intercepteur 401 → déconnexion automatique.
- **Mobile** : URL de l'API configurable (`--dart-define`).
- Nettoyage : contrôleurs inutilisés (`src/controllers/*` dupliquent la logique des routes), un seul fichier d'associations.

## Phase 3 — Qualité et industrialisation (~2 semaines)
- **Tests automatisés** : Jest + Supertest (API) sur une base de test ; Vitest (Vue) ; un scénario Playwright de bout en bout par rôle, à partir de la [roadmap de tests manuels](ROADMAP_TESTS.md).
- **CI GitHub Actions** : lint + tests + build à chaque push.
- **Docker** : `docker-compose.yml` (postgres + backend + frontend) pour démarrer avec une seule commande.
- **Seed** : script `npm run seed` (comptes et données de démo).
- **Stockage des fichiers** : passer du disque local à un stockage objet (S3 / Cloudflare R2 / Neon Storage) pour supporter plusieurs serveurs.
- **Sauvegardes** quotidiennes de la base.

## Phase 4 — Fonctionnalités métier (V1.1)
| Priorité | Fonctionnalité | Valeur |
|---|---|---|
| Haute | **Bulletins complets** : moyennes pondérées par coefficient, périodes (trimestres/semestres), rang, appréciations, PDF à l'en-tête de l'école | Cœur de métier |
| Haute | **Années scolaires et périodes** : archivage, passage en classe supérieure | Indispensable dès la 2ᵉ année |
| Haute | **Gestion des absences et retards** (appel par le prof, justificatifs) | Très demandé par les écoles |
| Haute | **Mot de passe oublié** (email) + changement de mot de passe | Autonomie des utilisateurs |
| Moyenne | **Espace parents** (rôle `parent`) : notes, absences, paiements de l'enfant | Différenciateur commercial |
| Moyenne | **Frais scolaires** : échéancier, paiements (Mobile Money M-Pesa / Orange Money / Airtel Money en RDC), reçus PDF | Source de revenus pour l'école |
| Moyenne | **Notifications** : email / SMS / push mobile (nouvelle note, absence, document) | Prévu V1.1 |
| Moyenne | **Import CSV/Excel** des élèves et profs | Mise en route rapide d'une école |
| Basse | **Messagerie interne** prof ↔ élève/parent | Prévu V2 |
| Basse | **i18n complet du frontend** (vue-i18n FR/EN, puis lingala/swahili) | La doc annonce le multilingue, mais le web est uniquement en français |
| Basse | **Mode hors ligne mobile** (cache des notes et de l'emploi du temps) | Connexion instable |

## Phase 5 — SaaS multi-établissements (V2)
- **Multi-tenant** : table `schools` + `schoolId` sur chaque table ; isolation obligatoire dans un middleware (un utilisateur ne voit jamais les données d'une autre école). Option : Row-Level Security PostgreSQL.
- **Rôle `superadmin`** (Robust Code) : création des écoles, abonnements, supervision.
- **Personnalisation par école** : logo, couleurs, en-tête des bulletins, barème (sur 20 / sur 10 / pourcentages), système de périodes.
- **Abonnements** : plans (nombre d'élèves), facturation, période d'essai.
- **Tableau de bord analytique** : taux de réussite par classe/matière, évolution des moyennes, assiduité.
- **Hébergement** : base managée (ex. Neon), backend conteneurisé, frontend sur CDN, domaine `*.robustschool.app` par école.
- **Conformité** : journal d'audit (qui a modifié quelle note et quand), export / suppression des données d'un élève, politique de confidentialité.

---

## Alignement « RSDDF » ⚠️ à confirmer
Je ne sais pas avec certitude à quoi renvoie **RSDDF**. Hypothèse retenue : un référentiel de **Responsabilité Sociétale et Développement Durable** appliqué aux établissements de formation, proche du label DD&RS. Si l'hypothèse est juste, voici les évolutions qui iraient dans ce sens :
- **Zéro papier** : bulletins, convocations et reçus 100 % numériques, signature électronique ; indicateur « pages économisées ».
- **Inclusion et accessibilité** : interface conforme WCAG 2.1 AA, mode faible bande passante, application mobile légère.
- **Suivi des indicateurs RS/DD de l'établissement** : parité filles/garçons, taux d'abandon, assiduité, actions éco-citoyennes. Module de reporting exportable.
- **Protection des données des mineurs** : minimisation, consentement des parents, durée de conservation.
- **Sobriété numérique** : images compressées, pagination, découpage du bundle frontend (aujourd'hui 892 Ko en un seul fichier).

👉 Si RSDDF désigne autre chose (un référentiel ministériel, une norme de reporting, un financeur), envoyez la définition ou le document de référence et cette section sera réécrite.

---

## Calendrier indicatif
| Période | Livrable |
|---|---|
| Semaine 1 | Phase 1 : sécurité |
| Semaines 2–3 | Phase 2 : stabilisation (tous les 🐞 de la roadmap de tests corrigés) |
| Semaines 4–5 | Phase 3 : tests automatisés, Docker, CI |
| Mois 2–3 | Phase 4 : bulletins, absences, parents, paiements |
| Mois 4–6 | Phase 5 : SaaS multi-écoles, pilote avec 2–3 établissements |
