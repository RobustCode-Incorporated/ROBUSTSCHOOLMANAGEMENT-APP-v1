<template>
  <div class="eleve-notes">
    <!-- HEADER -->
    <header class="header">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
      <button class="logout-button" @click="handleLogout">🚪 Se déconnecter</button>
    </header>

    <!-- CONTENU -->
    <div class="content">
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
  </div>
</template>

<script>
import api from '../plugins/axios'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

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
      return new Date(date).toLocaleDateString('fr-FR')
    },
    handleLogout() {
      localStorage.removeItem('token')
      this.$store.commit('setUser', null)
      this.$router.push('/login')
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
  font-family: 'ABeeZee', sans-serif;
  min-height: 100vh;
  background-color: #f9f9f9;
}

/* Header */
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

/* Contenu */
.content {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: 'Ysabeau Office', serif;
}

.content h2 {
  color: #0E2C5A;
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
}

/* Table */
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
  text-align: center;
}

.error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}
</style>