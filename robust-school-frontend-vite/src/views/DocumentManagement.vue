<template>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
    </div>

    <!-- Contenu -->
    <div class="document-management">
      <h2>📄 Gestion des documents</h2>

      <!-- Formulaire -->
      <form @submit.prevent="uploadDocument" enctype="multipart/form-data" class="upload-form">
        <select v-model="form.classroomId" required>
          <option disabled value="">Choisir une classe</option>
          <option v-for="cls in classrooms" :key="cls.id" :value="cls.id">
            {{ cls.name }} - {{ cls.level }}
          </option>
        </select>

        <select v-model="form.subjectId" required>
          <option disabled value="">Choisir une matière</option>
          <option v-for="subj in subjects" :key="subj.id" :value="subj.id">
            {{ subj.name }}
          </option>
        </select>

        <input type="file" @change="handleFileChange" required ref="fileInput" />

        <button type="submit" class="btn-blue" :disabled="loading">
          {{ loading ? 'Téléversement...' : 'Téléverser' }}
        </button>
      </form>

      <p v-if="formError" class="error">{{ formError }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <!-- Liste -->
      <h3>📚 Liste des documents</h3>
      <div v-if="loadingList">Chargement des documents...</div>
      <table class="styled-table" v-else>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Classe</th>
            <th>Matière</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in documents" :key="doc.id">
            <td>{{ doc.originalName }}</td>
            <td>{{ getClassroomName(doc.classroomId) }}</td>
            <td>{{ getSubjectName(doc.subjectId) }}</td>
            <td>
              <button @click="downloadDocument(doc.filename)" class="btn-blue">⬇️Télécharger</button>
              <button v-if="canDelete" @click="deleteDocument(doc.id)" class="btn-delete">🗑️Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import api from '../plugins/axios'

export default {
  name: 'DocumentManagement',
  data() {
    return {
      classrooms: [],
      subjects: [],
      documents: [],
      form: {
        classroomId: '',
        subjectId: '',
        file: null,
      },
      loading: false,
      loadingList: false,
      formError: null,
      successMessage: null,
      error: null,
      userRole: null,
    }
  },
  computed: {
    canDelete() {
      return this.userRole === 'admin' || this.userRole === 'prof'
    }
  },
  methods: {
    async fetchClassrooms() {
      try {
        const res = await api.get('/classrooms')
        this.classrooms = res.data
      } catch {
        this.error = 'Erreur chargement des classes'
      }
    },
    async fetchSubjects() {
      try {
        const res = await api.get('/subjects')
        this.subjects = res.data
      } catch {
        this.error = 'Erreur chargement des matières'
      }
    },
    async fetchDocuments() {
      try {
        this.loadingList = true
        const res = await api.get('/documents')
        this.documents = res.data
      } catch {
        this.error = 'Erreur chargement des documents'
      } finally {
        this.loadingList = false
      }
    },
    handleFileChange(event) {
      this.form.file = event.target.files[0]
    },
    async uploadDocument() {
      if (!this.form.file) {
        this.formError = 'Veuillez sélectionner un fichier.'
        return
      }

      this.loading = true
      this.formError = null
      this.successMessage = null

      const formData = new FormData()
      formData.append('file', this.form.file)
      formData.append('classroomId', this.form.classroomId)
      formData.append('subjectId', this.form.subjectId)

      try {
        const res = await api.post('/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if ([200, 201].includes(res.status)) {
          this.successMessage = 'Document téléversé avec succès.'
          this.form = { classroomId: '', subjectId: '', file: null }
          this.$refs.fileInput.value = null
          this.fetchDocuments()
        } else {
          this.formError = 'Erreur inattendue lors du téléversement.'
        }
      } catch (err) {
        this.formError = err.response?.data?.message || 'Erreur lors du téléversement.'
      } finally {
        this.loading = false
      }
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
    },
    async deleteDocument(id) {
      if (!confirm('Supprimer ce document ?')) return
      try {
        await api.delete(`/documents/${id}`)
        this.fetchDocuments()
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur suppression.'
      }
    },
    getClassroomName(id) {
      const c = this.classrooms.find(cls => cls.id === id)
      return c ? `${c.name} - ${c.level}` : id
    },
    getSubjectName(id) {
      const s = this.subjects.find(sub => sub.id === id)
      return s?.name || id
    }
  },
  mounted() {
    this.userRole = this.$store.state.user?.role || null
    this.fetchClassrooms()
    this.fetchSubjects()
    this.fetchDocuments()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=ABeeZee&family=Inter&family=Ysabeau+Office&display=swap');

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

.document-management {
  max-width: 950px;
  margin: auto;
  padding: 2rem 1rem;
}

.upload-form {
  margin-bottom: 1.5rem;
}

select, input[type="file"] {
  display: block;
  margin-bottom: 0.6rem;
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.btn-blue {
  background-color: #104b71;
  color: white;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
  margin-left: 0.4rem;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 1rem;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
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

.error {
  color: red;
  margin-top: 0.8rem;
}

.success {
  color: green;
  margin-top: 0.8rem;
}
</style>