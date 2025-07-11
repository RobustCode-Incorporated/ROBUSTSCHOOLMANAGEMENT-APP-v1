<template>
  <div class="eleve-notes">
    <h2>📊 Mes Notes</h2>

    <table class="styled-table" v-if="notes.length">
      <thead>
        <tr>
          <th>Matière</th>
          <th>Classe</th>
          <th>Note</th>
          <th>Commentaire</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="note in notes" :key="note.id">
          <td>{{ note.subject?.name || '-' }}</td>
          <td>{{ note.classroom ? note.classroom.name + ' - ' + note.classroom.level : '-' }}</td>
          <td>{{ note.value }}</td>
          <td>{{ note.comment || '-' }}</td>
          <td>{{ formatDate(note.date) }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else class="empty-msg">Aucune note disponible pour le moment.</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import api from '../plugins/axios'

export default {
  name: 'EleveNotes',
  data() {
    return {
      notes: [],
      error: null
    }
  },
  methods: {
    async fetchNotes() {
      try {
        const res = await api.get('/notes')
        this.notes = res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur lors du chargement des notes.'
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    }
  },
  mounted() {
    this.fetchNotes()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ysabeau+Office&family=ABeeZee&family=Inter&display=swap');

.eleve-notes {
  max-width: 1000px;
  margin: auto;
  padding: 2rem 1.5rem;
  font-family: 'ABeeZee', sans-serif;
}

.eleve-notes h2 {
  font-family: 'Ysabeau Office', sans-serif;
  font-size: 1.4rem;
  color: #0E2C5A;
  margin-bottom: 1.5rem;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 5px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.styled-table thead {
  background-color: #0e2c5a;
  color: white;
  font-family: 'Inter', sans-serif;
}

.styled-table th,
.styled-table td {
  padding: 0.85rem 1rem;
  text-align: center;
  border-bottom: 1px solid #ccc;
}

.styled-table tbody tr:hover {
  background-color: #f5f8fa;
}

.empty-msg {
  font-style: italic;
  color: #555;
  margin-top: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>