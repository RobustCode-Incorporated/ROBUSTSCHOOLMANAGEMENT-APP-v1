<template>
  <div class="subjects-wrapper">
    <!-- Header -->
    <div class="header">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
    </div>

    <div class="subjects-management">
      <h2>📚 Liste des matières disponibles</h2>

      <table class="styled-table" v-if="availableSubjects.length">
        <thead>
          <tr>
            <th>Matière</th>
            <th>Professeur</th>
            <th>Classe</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in availableSubjects" :key="subject.id">
            <td>{{ subject.name }}</td>
            <td>{{ subject.professor?.firstName }} {{ subject.professor?.lastName }}</td>
            <td>{{ subject.classroom?.name }} ({{ subject.classroom?.level }})</td>
            <td>
              <button @click="enroll(subject.id)" class="btn-blue">S'inscrire</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-msg">Aucune matière disponible actuellement.</p>

      <h2 style="margin-top: 3rem;">📝 Vos matières inscrites</h2>

      <table class="styled-table" v-if="enrolledSubjects.length">
        <thead>
          <tr>
            <th>Matière</th>
            <th>Professeur</th>
            <th>Classe</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in enrolledSubjects" :key="subject.id">
            <td>{{ subject.name }}</td>
            <td>{{ subject.professor?.firstName }} {{ subject.professor?.lastName }}</td>
            <td>{{ subject.classroom?.name }} ({{ subject.classroom?.level }})</td>
            <td>
              <button @click="unenroll(subject.id)" class="btn-red">Se désinscrire</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-msg">Vous n'êtes inscrit à aucune matière pour l'instant.</p>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import axios from '../plugins/axios'

export default {
  name: 'EleveSubjects',
  data() {
    return {
      availableSubjects: [],
      enrolledSubjects: [],
      error: null,
    }
  },
  async mounted() {
    await this.loadSubjects()
  },
  methods: {
    async loadSubjects() {
      try {
        const resAvailable = await axios.get('/subjects/available')
        const resEnrolled = await axios.get('/student-subjects')

        const enrolledIds = new Set(resEnrolled.data.map(s => s.id))

        this.enrolledSubjects = resEnrolled.data
        this.availableSubjects = resAvailable.data.filter(s => !enrolledIds.has(s.id))

      } catch (err) {
        this.error = "Erreur lors du chargement des matières."
        console.error(err)
      }
    },
    async enroll(subjectId) {
      try {
        await axios.post('/student-subjects', { subjectId })
        alert('Inscription réussie.')
        await this.loadSubjects()
      } catch (err) {
        this.error = "Erreur lors de l’inscription à la matière."
        console.error(err)
      }
    },
    async unenroll(subjectId) {
      try {
        await axios.delete(`/student-subjects/${subjectId}`)
        alert('Désinscription réussie.')
        await this.loadSubjects()
      } catch (err) {
        this.error = "Erreur lors de la désinscription."
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=ABeeZee&family=Ysabeau+Office&family=Inter&display=swap');

.subjects-wrapper {
  font-family: 'ABeeZee', sans-serif;
}

.header {
  background-color: #0e2c5a;
  color: white;
  padding: 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header .logo {
  width: 50px;
  height: auto;
}

.header h1 {
  font-family: 'Ysabeau Office', sans-serif;
  font-size: 1.4rem;
  margin: 0;
}

.subjects-management {
  max-width: 1000px;
  margin: auto;
  padding: 2.5rem 1.5rem;
}

h2 {
  font-family: 'Ysabeau Office', sans-serif;
  font-size: 1.3rem;
  color: #0e2c5a;
  margin-bottom: 1rem;
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
  padding: 0.9rem 1rem;
  text-align: center;
  border-bottom: 1px solid #ccc;
}

.styled-table tbody tr:hover {
  background-color: #f5f8fa;
}

button {
  padding: 0.45rem 0.9rem;
  font-size: 0.95rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.2s ease-in-out;
}

.btn-blue {
  background-color: #104b71;
  color: white;
}
.btn-blue:hover {
  background-color: #0e2c5a;
}

.btn-red {
  background-color: #e74c3c;
  color: white;
}
.btn-red:hover {
  background-color: #c0392b;
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