<template>
  <div class="eleve-documents">
    <!-- Header -->
    <div class="header">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
    </div>

    <!-- Contenu principal -->
    <div class="content">
      <h2>📄 Mes documents</h2>

      <div v-if="loading" class="loading">Chargement...</div>

      <div v-else>
        <table class="styled-table" v-if="documents.length">
          <thead>
            <tr>
              <th>Nom du fichier</th>
              <th>Matière</th>
              <th>Classe</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in documents" :key="doc.id">
              <td>{{ doc.originalName }}</td>
              <td>{{ getSubjectName(doc.subjectId) }}</td>
              <td>{{ getClassroomName(doc.classroomId) }}</td>
              <td>
                <button @click="downloadDocument(doc.filename)" class="btn-blue">⬇️ Télécharger</button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else class="empty-msg">Aucun document disponible pour l’instant.</p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../plugins/axios'

export default {
  name: 'EleveDocument',
  data() {
    return {
      documents: [],
      subjects: [],
      classrooms: [],
      error: null,
      loading: false,
    }
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true
        const [docsRes, subsRes, classRes] = await Promise.all([
          api.get('/documents'),
          api.get('/subjects'),
          api.get('/classrooms')
        ])
        this.documents = docsRes.data
        this.subjects = subsRes.data
        this.classrooms = classRes.data
      } catch (err) {
        this.error = 'Erreur lors du chargement des données.'
      } finally {
        this.loading = false
      }
    },
    getSubjectName(id) {
      const subject = this.subjects.find(sub => sub.id === id)
      return subject ? subject.name : '-'
    },
    getClassroomName(id) {
      const classroom = this.classrooms.find(cls => cls.id === id)
      return classroom ? `${classroom.name} - ${classroom.level}` : '-'
    },
    async downloadDocument(filename) {
      const url = `${api.defaults.baseURL}/documents/download/${filename}`

      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.$store.state.token}` // adapte selon ton store
          }
        })

        if (!res.ok) {
          throw new Error('Échec du téléchargement')
        }

        const blob = await res.blob()
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = filename
        link.click()
      } catch (err) {
        this.error = 'Erreur téléchargement du document.'
        console.error(err)
      }
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ysabeau+Office&family=ABeeZee&family=Inter&display=swap');

.eleve-documents {
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

.content {
  max-width: 950px;
  margin: auto;
  padding: 2rem 1rem;
  font-family: 'Ysabeau Office', sans-serif;
}

h2 {
  color: #0E2C5A;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.06);
  font-size: 0.95rem;
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

.btn-blue {
  background-color: #104b71;
  color: white;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-blue:hover {
  background-color: #0e2c5a;
}

.loading {
  font-style: italic;
  color: #555;
  padding: 1rem 0;
}

.empty-msg {
  font-style: italic;
  color: #777;
  margin-top: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>