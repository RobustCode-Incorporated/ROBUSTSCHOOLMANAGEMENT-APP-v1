<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h2 class="title">ROBUST SCHOOL MANAGEMENT SYSTEM</h2>
      <nav class="menu">
        <router-link to="/eleve/timetable" class="menu-item">📅 Emploi du temps</router-link>
        <router-link to="/eleve/notes" class="menu-item">📊 Mes notes</router-link>
        <router-link to="/eleve/documents" class="menu-item">📁 Documents</router-link>
        <router-link to="/eleve/matieres" class="menu-item">📚 Mes matières</router-link>
      </nav>
    </aside>

    <!-- Main panel -->
    <div class="main-panel">
      <!-- Top bar -->
      <div class="top-bar">
        <div class="greeting">Bienvenue {{ studentFirstName }} {{ studentLastName }}</div>
        <button class="logout-button" @click="handleLogout">🚪 Se déconnecter</button>
      </div>

      <!-- Main content -->
      <div class="main-content">
        <h2>📅 Mon emploi du temps</h2>

        <div v-if="loading">Chargement de l'emploi du temps...</div>
        <div v-if="error" class="error">{{ error }}</div>

        <div v-if="!loading && !timetable.length" class="empty-message">
          Aucun créneau trouvé dans votre emploi du temps.
        </div>

        <div v-if="!loading && timetable.length" class="dashboard-widgets">
          <table class="timetable-table">
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
                <td>
                  {{ entry.timetableProfessor ? entry.timetableProfessor.firstName + ' ' + entry.timetableProfessor.lastName : 'N/A' }}
                </td>
                <td>{{ entry.location || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import api from '../plugins/axios'

const store = useStore()
const router = useRouter()

const studentFirstName = computed(() => store.state.user?.firstName || '')
const studentLastName = computed(() => store.state.user?.lastName || '')

const loading = ref(false)
const error = ref(null)
const timetable = ref([])

const fetchTimetable = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/timetable/eleve')
    timetable.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || "Erreur lors du chargement de l'emploi du temps."
  } finally {
    loading.value = false
  }
}

// Ajoute cette fonction pour gérer la déconnexion
const handleLogout = () => {
  // Nettoyer l'état utilisateur dans le store
  store.dispatch('logout')  // vide user + token

  // Supprimer le token stocké localement si tu en as un
  localStorage.removeItem('token')

  // Rediriger vers la page login
  router.push('/login')
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const jour = jours[d.getDay()]
  const dateFr = d.toLocaleDateString('fr-FR')
  return `${jour} ${dateFr}`
}

onMounted(() => {
  fetchTimetable()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ysabeau+Office&family=ABeeZee&family=Inter&display=swap');

.dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: 'ABeeZee', sans-serif;
}

.sidebar {
  width: 260px;
  background-color: #0E2C5A;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

.logo {
  width: 60px;
  margin: 0 auto 1rem auto;
}

.title {
  text-align: center;
  font-family: 'Ysabeau Office', sans-serif;
  font-size: 1rem;
  margin-bottom: 2rem;
  letter-spacing: 1px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-item {
  color: white;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.menu-item:hover,
.router-link-active {
  background-color: #104B71;
}

.main-panel {
  flex: 1;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
}

.top-bar {
  padding: 1rem 2rem;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Inter', sans-serif;
  border-bottom: 1px solid #ddd;
}

.logout-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.greeting {
  font-size: 1.2rem;
  font-family: 'Ysabeau Office', sans-serif;
  color: #0E2C5A;
}

.main-content {
  padding: 3rem 2rem;
  font-family: 'Ysabeau Office', sans-serif;
}

.dashboard-widgets {
  padding: 2rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-top: 1.5rem;
}

.timetable-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.95rem;
}

.timetable-table th,
.timetable-table td {
  border: 1px solid #ccc;
  padding: 0.8rem;
  text-align: center;
}

.empty-message {
  margin-top: 1.5rem;
  font-style: italic;
  color: #666;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>