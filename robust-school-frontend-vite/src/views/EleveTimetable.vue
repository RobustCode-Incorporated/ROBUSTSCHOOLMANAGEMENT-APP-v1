<template>
  <div class="eleve-timetable">
    <h2>📅 Mon emploi du temps</h2>

    <table v-if="timetable.length">
      <thead>
        <tr>
          <th>Jour</th>
          <th>Début</th>
          <th>Fin</th>
          <th>Matière</th>
          <th>Professeur</th>
          <th>Classe</th>
          <th>Lieu</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in timetable" :key="entry.id">
          <td>{{ capitalize(entry.dayOfWeek) }}</td>
          <td>{{ entry.startTime }}</td>
          <td>{{ entry.endTime }}</td>
          <td>{{ entry.timetableSubject?.name || '—' }}</td>
          <td>
            {{ entry.timetableProfessor?.firstName || '—' }}
            {{ entry.timetableProfessor?.lastName || '' }}
          </td>
          <td>
            {{ entry.timetableClassroom ? entry.timetableClassroom.name + ' - ' + entry.timetableClassroom.level : '—' }}
          </td>
          <td>{{ entry.location || '—' }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else>Aucun créneau trouvé.</p>
    <p v-if="error" class="error">{{ error }}</p>
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
    capitalize(str) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
    }
  },
  async mounted() {
    try {
      const res = await api.get('/timetable/eleve') // ✅ appel de la bonne route
      this.timetable = res.data
    } catch (err) {
      this.error = err.response?.data?.message || 'Erreur lors du chargement.'
      console.error(err)
    }
  }
}
</script>

<style scoped>
.eleve-timetable {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  font-size: 0.95rem;
}

th, td {
  border: 1px solid #ccc;
  padding: 0.7rem;
  text-align: center;
}

th {
  background-color: #0e2c5a;
  color: white;
}

.error {
  color: red;
  margin-top: 1rem;
  font-weight: bold;
}
</style>