<template>
  <div class="privacy">
    <header class="header">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
    </header>

    <main class="content">
      <h2>Politique de confidentialité</h2>
      <p class="updated">Dernière mise à jour : 16 octobre 2026</p>

      <p>
        Robust School (site web et applications mobiles Android et iOS) est édité par
        <strong>ROBUST CODE S.A.R.L</strong>, 1431 bis Avenue Prison, Quartier Ndolo,
        Commune de Barumbu, Kinshasa, République démocratique du Congo
        (RCCM : CD/KNG/RCCM/24-B-03978). Robust School est utilisé par des établissements
        scolaires pour gérer les notes, l'emploi du temps et les documents de cours.
      </p>

      <h3>1. Données collectées</h3>
      <ul>
        <li><strong>Compte</strong> : prénom, nom, adresse email, rôle (élève, professeur, administrateur) et mot de passe (stocké chiffré, jamais en clair).</li>
        <li><strong>Scolarité</strong> : classe, matières suivies ou enseignées, emploi du temps, notes et appréciations.</li>
        <li><strong>Documents</strong> : fichiers de cours déposés par les enseignants ou l'administration.</li>
        <li><strong>Données techniques</strong> : jeton de connexion, conservé sur l'appareil dans un stockage sécurisé.</li>
      </ul>
      <p>Nous ne collectons ni la localisation, ni les contacts, ni les photos de l'appareil. Aucune publicité n'est affichée et aucune donnée n'est vendue.</p>

      <h3>2. Finalités</h3>
      <p>
        Les données servent uniquement au fonctionnement du service scolaire : connexion,
        consultation des notes et de l'emploi du temps, partage de documents, édition des bulletins.
      </p>

      <h3>3. Qui a accès aux données</h3>
      <ul>
        <li>Un <strong>élève</strong> ne voit que ses propres notes et les documents de ses classes et matières.</li>
        <li>Un <strong>professeur</strong> voit les élèves inscrits à ses matières et gère ses propres notes.</li>
        <li>L'<strong>administration de l'établissement</strong> gère les comptes, les classes et les matières.</li>
        <li>ROBUST CODE S.A.R.L agit en tant que prestataire technique de l'établissement et ne partage les données avec aucun tiers, sauf obligation légale.</li>
      </ul>

      <h3>4. Sécurité</h3>
      <p>
        Les échanges entre l'application et le serveur sont chiffrés (HTTPS). Les mots de passe
        sont hachés. L'accès aux données est contrôlé selon le rôle de chaque utilisateur.
      </p>

      <h3>5. Conservation</h3>
      <p>
        Les données sont conservées tant que l'élève ou l'enseignant fait partie de l'établissement.
        Lorsqu'un compte est retiré, il est archivé afin de conserver l'historique scolaire (notes,
        bulletins), puis supprimé à la demande de l'établissement.
      </p>

      <h3>6. Mineurs</h3>
      <p>
        Les comptes des élèves sont créés et gérés par l'établissement scolaire, qui est responsable
        de l'information des élèves et de leurs représentants légaux.
      </p>

      <h3>7. Vos droits</h3>
      <p>
        Vous pouvez demander l'accès, la correction ou la suppression de vos données auprès de votre
        établissement, ou directement auprès de nous à l'adresse
        <a href="mailto:jeanlucluzemba@robust-code.com">jeanlucluzemba@robust-code.com</a>.
      </p>

      <h3>8. Contact</h3>
      <p>
        ROBUST CODE S.A.R.L — <a href="mailto:jeanlucluzemba@robust-code.com">jeanlucluzemba@robust-code.com</a>
      </p>

      <router-link to="/login" class="back">← Retour à la connexion</router-link>
    </main>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPolicy',
}
</script>

<style scoped>
.privacy {
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
  background: #fafafa;
  color: #222;
}

.header {
  background-color: #0e2c5a;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header .logo {
  width: 40px;
  height: auto;
}

.header h1 {
  font-family: 'Ysabeau Office', serif;
  font-size: 1.2rem;
  margin: 0;
}

.content {
  max-width: 760px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
  line-height: 1.6;
}

.content h2 {
  color: #0e2c5a;
  margin-bottom: 0.25rem;
}

.content h3 {
  color: #104b71;
  margin-top: 1.75rem;
}

.updated {
  color: #707070;
  font-size: 0.9rem;
}

.content ul {
  padding-left: 1.25rem;
}

.content a {
  color: #104b71;
}

.back {
  display: inline-block;
  margin-top: 2rem;
}
</style>
