<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h2 class="title">ROBUST SCHOOL MANAGEMENT SYSTEM</h2>
      <nav class="menu">
        <router-link to="/prof/notes" class="menu-item">📊 Gestion des notes</router-link>
        <router-link to="/prof/documents" class="menu-item">📁 Documents</router-link>
        <router-link to="/prof/timetable" class="menu-item">📅 Emploi du temps</router-link>
      </nav>
    </aside>

    <!-- Contenu principal -->
    <div class="main-panel">
      <!-- Top bar -->
      <div class="top-bar">
        <div class="greeting">Bienvenue Professeur {{ user.firstName }} {{ user.lastName }}</div>
        <button class="logout-button" @click="logout">Se déconnecter</button>
      </div>

      <!-- Donut + Calendrier -->
      <div class="widgets-container">
        <DonutChart v-if="donutData" :data="donutData" class="donut-chart" />
        <vue-cal v-if="calendarEvents.length" :events="calendarEvents" style="height: 320px; flex:1;" />
      </div>

      <!-- ** Tableau des affectations prof ** -->
      <div class="prof-assignments" v-if="assignments.length > 0" style="margin: 2rem;">
        <h2>📝 Mes Affectations</h2>
        <table class="styled-table">
          <thead>
            <tr>
              <th>Matière</th>
              <th>Classe</th>
              <th>Niveau</th>
              <th>Nombre d'élèves</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="assignment in assignments" :key="assignment.id">
              <td>{{ assignment.assignedSubject?.name || 'Non défini' }}</td>
              <td>{{ assignment.assignedClassroom?.name || 'N/A' }}</td>
              <td>{{ assignment.assignedClassroom?.level || '-' }}</td>
              <td>{{ assignment.assignedClassroom?.studentsCount ?? 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script>
import api from '../plugins/axios'
import DonutChart from '../components/DonutChart.vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'

export default {
  name: 'ProfDashboard',
  components: {
    DonutChart,
    VueCal
  },
  data() {
    return {
      timetable: [],
      loading: false,
      error: null,
      user: this.$store.state.user,
      donutData: null,
      calendarEvents: [],
      assignments: []  // <-- Ajouté ici
    }
  },
  methods: {
    capitalize(text) {
      if (!text) return ''
      return text.charAt(0).toUpperCase() + text.slice(1)
    },
    async fetchTimetable() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/timetable/professeur')
        this.timetable = res.data

        // Préparer les events pour le calendrier
        this.calendarEvents = this.timetable.map(entry => {
          const [year, month, day] = entry.date.split('-').map(Number)
          const [startHour, startMinute] = entry.startTime.split(':').map(Number)
          const [endHour, endMinute] = entry.endTime.split(':').map(Number)

          return {
            title: `${entry.timetableSubject?.name || 'Matière'} (${entry.timetableClassroom?.name || 'Classe'})`,
            start: new Date(year, month - 1, day, startHour, startMinute),
            end: new Date(year, month - 1, day, endHour, endMinute),
            content: 'Cours prévu',
            class: 'event-classroom'
          }
        })

      } catch (err) {
        this.error = err.response?.data?.message || "Erreur lors du chargement de l'emploi du temps."
      } finally {
        this.loading = false
      }
    },
    async fetchDonutData() {
      try {
        const res = await api.get('/teaching-assignments/professor')

        const assignments = res.data

        const uniqueSubjects = new Set(assignments.map(a => a.assignedSubject?.id))

        const totalStudents = assignments.reduce((sum, a) => {
          return sum + (a.assignedClassroom?.studentsCount || 0)
        }, 0)

        this.donutData = {
          labels: ['Matières', 'Élèves'],
          values: [uniqueSubjects.size, totalStudents],
        }

      } catch (error) {
        console.error('Erreur chargement données donut:', error)
      }
    },
    // ** Nouvelle méthode fetchAssignments **
    async fetchAssignments() {
      try {
        const res = await api.get('/teaching-assignments/professor')
        this.assignments = res.data
      } catch (error) {
        console.error('Erreur chargement affectations:', error)
      }
    },
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  },
  mounted() {
    this.fetchTimetable()
    this.fetchDonutData()
    this.fetchAssignments()  // <-- Appel ajouté ici
  }
}
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
}

.timetable-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
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

.widgets-container {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.05);
  align-items: center;
}
.donut-chart {
  max-width: 320px;
  max-height: 320px;
  flex: 0 0 320px;
}

/* Pour styliser l’événement du calendrier si besoin */
.event-classroom {
  background-color: #104B71 !important;
  color: white !important;
  border-radius: 6px !important;
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
</style>