<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1 class="title">ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
      <nav class="menu">
        <router-link to="/admin/users" class="menu-item">👤 Gérer les utilisateurs</router-link>
        <router-link to="/admin/classrooms" class="menu-item">🏫 Gérer les classes</router-link>
        <router-link to="/admin/subjects" class="menu-item">📚 Gérer les matières</router-link>
        <router-link to="/admin/timetable" class="menu-item">📅 Gérer l'emploi du temps</router-link>
        <router-link to="/admin/documents" class="menu-item">📁 Gérer les documents</router-link>
        <router-link to="/admin/notes" class="menu-item">📝 Gérer les notes</router-link>
        <!--<router-link to="/admin/teaching-assignments" class="menu-item">👨‍🏫 Gérer les affectations</router-link>-->
      </nav>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-panel">
      <header class="top-bar">
        <div class="greeting">Bienvenue, {{ adminFirstName }} {{ adminLastName }}</div>
        <button class="logout-button" @click="handleLogout">Se déconnecter</button>
      </header>

      <section class="main-content">
        <!-- Statistiques -->
        <div class="dashboard-stats-box">
          <template v-if="loadingStats">
            <p>Chargement des statistiques...</p>
          </template>
          <template v-else-if="statsError">
            <p class="error-msg">❌ {{ statsError }}</p>
          </template>
          <template v-else>
            <DashboardStats :stats="dashboardStats" />
          </template>
        </div>

        <!-- Graphique + Calendrier -->
        <div class="flex-graphs">
          <DonutChart v-if="donutData" class="donut-chart" :data="donutData" />
          <div class="calendar-box">
            <vue-cal :events="calendarEvents" style="height: 320px" />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import DashboardStats from '../components/DashboardStats.vue'
import DonutChart from '../components/DonutChart.vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import axios from 'axios'

const store = useStore()
const router = useRouter()

const adminFirstName = computed(() => store.state.user?.firstName || '')
const adminLastName = computed(() => store.state.user?.lastName || '')

const handleLogout = () => {
  store.dispatch('logout')
  router.push('/login')
}

const dashboardStats = ref([])
const loadingStats = ref(false)
const statsError = ref(null)

const calendarEvents = ref([])

const donutData = computed(() => {
  const students = dashboardStats.value.find(s => s.label.includes('Élèves'))?.value || 0
  const teachers = dashboardStats.value.find(s => s.label.includes('Profs'))?.value || 0

  return {
    labels: ['Élèves', 'Profs'],
    values: [students, teachers]
  }
})

const fetchDashboardStats = async () => {
  try {
    loadingStats.value = true
    statsError.value = null
    const token = store.state.token

    const response = await axios.get('http://localhost:5050/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = response.data

    dashboardStats.value = [
      { label: 'Total Élèves', value: data.students, icon: '🎓' },
      { label: 'Total Profs', value: data.teachers, icon: '👨‍🏫' },
      { label: 'Matières disponibles', value: data.subjects, icon: '📚' },
      { label: 'Documents partagés', value: data.documents, icon: '📁' },
    ]
  } catch (error) {
    statsError.value = "Impossible de charger les statistiques"
    console.error(error)
  } finally {
    loadingStats.value = false
  }
}

const fetchCalendarEvents = async () => {
  try {
    const token = store.state.token
    const response = await axios.get('http://localhost:5050/api/admin/timetable', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('Réponse calendrier:', response.data)
    const rawTimetables = response.data

    calendarEvents.value = rawTimetables.map(entry => {
      // Extraction année, mois, jour depuis entry.date
      const [year, month, day] = entry.date.split('-').map(Number)

      const [startHour, startMinute] = entry.startTime.split(':').map(Number)
      const [endHour, endMinute] = entry.endTime.split(':').map(Number)

      // Construire les dates JavaScript avec les bons paramètres (mois = 0-based)
      const start = new Date(year, month - 1, day, startHour, startMinute)
      const end = new Date(year, month - 1, day, endHour, endMinute)

      return {
        title: `${entry.timetableSubject?.name || 'Matière'} (${entry.timetableClassroom?.name || 'Classe'})`,
        start,
        end,
        content: 'Cours prévu',
        class: 'event-classroom'
      }
    })

  } catch (err) {
    console.error('Erreur lors du chargement des événements :', err)
  }
}

onMounted(() => {
  fetchDashboardStats()
  fetchCalendarEvents()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ysabeau+Office&family=ABeeZee&family=Inter&display=swap');

.dashboard-layout {
  display: flex;
  height: 100vh;
  font-family: 'ABeeZee', sans-serif;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  background-color: #0E2C5A;
  color: white;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
}

.logo {
  width: 50px;
  margin: 0 auto 0.8rem auto;
}

.title {
  text-align: center;
  font-family: 'Ysabeau Office', sans-serif;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.menu-item {
  color: white;
  text-decoration: none;
  font-size: 0.85rem;
  padding: 0.5rem 0.8rem;
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
  overflow-y: auto;
}

.top-bar {
  padding: 0.8rem 1.5rem;
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
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.greeting {
  font-size: 1rem;
  font-family: 'Ysabeau Office', sans-serif;
  color: #0E2C5A;
}

.main-content {
  padding: 1.5rem 1.5rem;
  font-family: 'Ysabeau Office', sans-serif;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.dashboard-stats-box {
  background: #fff;
  padding: 1.2rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.error-msg {
  color: #e74c3c;
  font-weight: bold;
  font-family: 'Inter', sans-serif;
  margin: 0;
}

.flex-graphs {
  display: flex;
  gap: 1rem;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.flex-graphs > * {
  flex: 1 1 48%;
  max-height: 320px;
}

.calendar-box {
  background: white;
  padding: 0.8rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 320px;
  overflow: hidden;
}

/* Ajustement DonutChart */
.donut-chart {
  max-width: 320px !important;
  max-height: 320px !important;
}

/* Pour le composant DashboardStats (avec icônes) */
.stats-container {
  display: flex;
  gap: 1rem;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.stat-card {
  flex: 1 1 22%;
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  font-size: 0.85rem;
}

.stat-number {
  font-size: 1.5rem;
  color: #0E2C5A;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.stat-label {
  margin-top: 0.4rem;
  color: #707070;
}
</style>