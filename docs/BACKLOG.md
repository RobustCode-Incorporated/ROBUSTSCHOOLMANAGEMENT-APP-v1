# Backlog projet — Robust School Management

Mis à jour le 16/10/2026. Objectif à court terme : **test pilote dans une école**, puis **publication Android** (voir [PLAN_DEPLOIEMENT.md](PLAN_DEPLOIEMENT.md)).

Légende priorité : **P0** bloque toute mise en ligne · **P1** bloque le pilote · **P2** nécessaire avant la production · **P3** amélioration

---

## ✅ Terminé

| Réf. | Sujet | Livré dans |
|---|---|---|
| S1–S6 | Failles de sécurité (users ouverts, inscription admin, notes, documents, uploads, `.env`) | PR #1 `fix/securite` |
| F1 | Bulletin PDF (lisait une table vide) | PR #3 `fix/fonctionnel` |
| F2 | Page Affectations enseignants : routes API ajoutées, lien réactivé dans le menu admin | PR #3 |
| F3 | Profil élève (`/users/me`) | PR #1 |
| F4 | Page Inscription aux matières cassée → redirigée vers « Mes matières », qui gère déjà l'inscription | PR #3 |
| F5 | Inscription `/register` (token `"undefined"`) | PR #1 |
| F6–F7 | Notes et matières : validation, messages clairs au lieu d'erreurs 500 | PR #1 et #3 |
| F8 | Emploi du temps : chevauchements refusés (même prof ou même classe) | PR #3 |
| F10 | Déconnexion élève (mutation inexistante) | PR #3 |
| F11 | Page Mes notes : débordement sur mobile | PR #3 |
| D1 / F9 | **Archivage** : un élève, prof, matière ou classe ayant des notes est archivé au lieu d'être supprimé (notes conservées, compte bloqué, restauration possible) | PR #4 `feat/archivage` |
| O1 | PR #1, #3, #2 fusionnées dans `main`, branches supprimées | — |
| M1 (code) | App mobile prête pour les stores : identifiant `com.robustcode.school`, permission INTERNET, signature release, URL d'API configurable, nom « Robust School », téléchargements réparés sur Android 13+/iOS | PR #5 `feat/mobile-publication` |
| — | Politique de confidentialité publique `/confidentialite` (exigée par les stores) + guide [PUBLICATION_MOBILE.md](PUBLICATION_MOBILE.md) | PR #5 |

État des tests au 16/10 : API 70/70 · sécurité 26/26 · archivage 26/26 · pages web 29/29.

---

## 🔜 À faire

| Prio | Réf. | Sujet | Estimation |
|---|---|---|---|
| **P0** | O2 | Changer les anciens secrets partout où ils servent encore (dépôt public, historique Git) | 15 min |
| P1 | T1 | Remplacer `sequelize.sync({ alter: true })` par des migrations versionnées ; supprimer la table vide `StudentAssignments` | 1–2 j |
| P1 | T2 | URL de l'API configurable (`VITE_API_URL` pour le web, `--dart-define` pour le mobile) | 0,5 j |
| P1 | T3 | Casse des imports (`TimetableManagement.vue`, `ProfTimeTable.vue`) : le build échouera sur un serveur Linux | 15 min |
| P1 | B1 | Bulletin : **moyenne pondérée par coefficient**, logo de l'école, périodes (trimestres) | 2 j |
| P1 | M2 | Installer Android Studio (JDK) + Flutter + Xcode/CocoaPods, générer la clé d'upload, premier build et test sur vrais téléphones ([guide](PUBLICATION_MOBILE.md) §1 et §3) | 1 j |
| P1 | M3 | Mettre en ligne l'API en HTTPS + comptes de démo (exigé par les revues Google et Apple) | voir T2 et [PLAN_DEPLOIEMENT.md](PLAN_DEPLOIEMENT.md) |
| P1 | M4 | Fiches store : captures d'écran, icône, bannière ; formulaires Sécurité des données / Confidentialité ([guide](PUBLICATION_MOBILE.md) §4–5) | 0,5 j |
| ✅ | O3 | **D-U-N-S obtenu.** Comptes prêts : Play Console `robustcodeinc@gmail.com`, App Store `jeanlucluzemba@robust-code.com` | — |
| **P0** | O4 | **Libérer de l'espace disque** (≈ 4–6 Go libres, 98 % utilisés) : Flutter + build Android demandent 10–15 Go ; Docker se bloque quand le disque est plein | vous |
| P2 | T4 | Limitation des tentatives sur `/auth/login`, `helmet`, CORS restreint | 0,5 j |
| P2 | T5 | Retirer `node_modules` du dépôt (6 525 fichiers suivis) | 15 min |
| P2 | T6 | Tests automatisés dans le dépôt (Jest/Supertest + Playwright) et CI GitHub Actions | 2–3 j |
| P2 | U1 | Page Gestion des notes (admin) : pas de menu ni de retour au dashboard | 0,5 j |
| P2 | U2 | Mot de passe oublié / changement de mot de passe | 1–2 j |
| P3 | U3 | Interface FR/EN (vue-i18n) | 2 j |
| P3 | — | Fonctionnalités V1.1 : absences, espace parents, paiements Mobile Money, notifications | voir [PLAN_EVOLUTION.md](PLAN_EVOLUTION.md) |

---

## ⚠️ Points d'attention

- **Fichier `.env` local** : les anciens commits de `main` (avant la PR #1) suivent encore l'ancien `.env`. Revenir sur un de ces commits **supprime le `.env` local** au retour. Garder une copie du `.env` hors du dépôt.
- **Section RSDDF** du plan d'évolution : définition du sigle toujours à confirmer.
- **Application mobile** : jamais compilée ni lancée sur ce poste (pas de Flutter ni de Java, disque plein). Le code et la configuration ont été vérifiés et préparés ; le premier `flutter analyze` peut demander des mises à jour de dépendances.
