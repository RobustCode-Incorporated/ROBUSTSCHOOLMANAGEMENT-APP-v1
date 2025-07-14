<template>
  <div class="header">
    <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
    <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
  </div>

  <div class="prof-timetable">
    <h2>🗓️ Mon emploi du temps</h2>

    <table v-if="timetable.length > 0" class="styled-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Heure</th>
          <th>Matière</th>
          <th>Classe</th>
          <th>Lieu</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in timetable" :key="entry.id">
          <td>{{ formatDate(entry.date) }}</td>
          <td>{{ entry.startTime }} - {{ entry.endTime }}</td>
          <td>{{ entry.timetableSubject?.name || 'Non défini' }}</td>
          <td>{{ entry.timetableClassroom?.name || 'N/A' }} ({{ entry.timetableClassroom?.level || '-' }})</td>
          <td>{{ entry.location || 'Non précisé' }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else class="no-data">Vous n'avez pas de créneaux d'emploi du temps.</p>
  </div>
</template>

<script>
import axios from '../plugins/axios'

export default {
  name: 'ProfTimetable',
  data() {
    return {
      timetable: []
    }
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const jourSemaine = jours[d.getDay()];
      const dateFr = d.toLocaleDateString('fr-FR'); // format jj/mm/aaaa
      return `${jourSemaine} ${dateFr}`;
    }
  },
  async mounted() {
    try {
      const res = await axios.get('/timetable/professeur')
      this.timetable = res.data
    } catch (err) {
      console.error("Erreur chargement emploi du temps :", err)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=ABeeZee&display=swap');

.wrapper {
  font-family: 'ABeeZee', sans-serif;
}

.header {
  background-color: #0e2c5a;
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 45px;
}

.header h1 {
  font-family: 'Ysabeau Office', sans-serif;
  font-size: 1.4rem;
  margin: 0;
}

.prof-timetable {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
  font-family: 'ABeeZee', sans-serif;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 1rem;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.styled-table thead {
  background-color: #0e2c5a;
  color: white;
  text-transform: uppercase;
}

.styled-table th,
.styled-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

.styled-table tbody tr:hover {
  background-color: #f9f9f9;
}

.no-data {
  margin-top: 1rem;
  text-align: center;
  color: #666;
}
</style>