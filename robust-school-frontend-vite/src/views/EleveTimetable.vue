<template>
  <div class="eleve-timetable">

    <!-- HEADER -->
    <header class="header">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
      <button class="logout-button" @click="handleLogout">🚪 Se déconnecter</button>
    </header>

    <!-- CONTENT -->
    <div class="content">
      <h2>📅 Mon emploi du temps</h2>

      <div v-if="loading" class="loading">Chargement de l'emploi du temps...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="!loading && !timetable.length" class="empty-msg">
        Aucun créneau trouvé dans votre emploi du temps.
      </div>

      <table v-if="!loading && timetable.length" class="styled-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Heure début</th>
            <th>Heure fin</th>
            <th>Matière</th>
            <th>Professeur</th>
            <th>Lieu</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in timetable" :key="entry.id">
            <td>{{ formatDate(entry.date) }}</td>
            <td>{{ entry.startTime }}</td>
            <td>{{ entry.endTime }}</td>
            <td>{{ entry.timetableSubject?.name || 'N/A' }}</td>
            <td>{{ entry.timetableProfessor ? entry.timetableProfessor.firstName + ' ' + entry.timetableProfessor.lastName : 'N/A' }}</td>
            <td>{{ entry.location || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
import api from '../plugins/axios'

export default {
  name: 'EleveTimetable',
  data() {
    return {
      timetable: [],
      error: null
    }
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return 'N/A'
      const d = new Date(dateStr)
      const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
      const jourSemaine = jours[d.getDay()]
      const dateFr = d.toLocaleDateString('fr-FR') // jj/mm/aaaa
      return `${jourSemaine} ${dateFr}`
    }
  },
  async mounted() {
    try {
      const res = await api.get('/timetable/eleve')
      this.timetable = res.data
    } catch (err) {
      this.error = err.response?.data?.message || 'Erreur lors du chargement.'
      console.error(err)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ysabeau+Office&family=ABeeZee&family=Inter&display=swap');

.eleve-timetable {
  font-family: 'ABeeZee', sans-serif;
  min-height: 100vh;
  background-color: #f9f9f9;
}

/* Header bleu foncé avec logo + titre */
.header {
  background-color: #0e2c5a;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header .logo {
  width: 50px;
  height: auto;
}

.header h1 {
  font-family: 'Ysabeau Office', serif;
  font-size: 1.5rem;
  margin: 0;
  flex-grow: 1;
}

/* Contenu centré */
.content {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: 'Ysabeau Office', serif;
}

/* Titre principal */
h2 {
  color: #0E2C5A;
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
}

/* Table stylée */
.styled-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.06);
  font-size: 0.95rem;
  background: white;
}

.styled-table thead {
  background-color: #0e2c5a;
  color: white;
  font-family: 'Inter', sans-serif;
}

.styled-table th,
.styled-table td {
  padding: 0.85rem;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.styled-table tbody tr:hover {
  background-color: #f5f8fa;
}

/* Messages */
.loading {
  font-style: italic;
  color: #555;
  padding: 1rem 0;
  text-align: center;
}

.empty-msg {
  font-style: italic;
  color: #777;
  margin-top: 1rem;
  text-align: center;
}

.error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}

/* Bouton déconnexion dans header si tu en veux */
.logout-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #c0392b;
}
</style>
