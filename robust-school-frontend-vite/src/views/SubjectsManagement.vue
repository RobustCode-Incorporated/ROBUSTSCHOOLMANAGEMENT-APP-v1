<template>
  <div class="subjects-wrapper">
    <!-- Header -->
    <div class="header">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
    </div>

    <div class="subjects-management">
      <h2>Gestion des matières</h2>

      <div class="add-form">
        <h3>Ajouter une matière</h3>
        <form @submit.prevent="addSubject">
          <input v-model="newSubject.name" type="text" placeholder="Nom" required />
          <input v-model="newSubject.code" type="text" placeholder="Code" required />
          <input v-model="newSubject.coefficient" type="number" placeholder="Coefficient" required />
          <button type="submit" class="btn-blue">Ajouter</button>
        </form>
        <p v-if="addError" class="error">{{ addError }}</p>
      </div>

      <button @click="fetchSubjects" class="btn-refresh">🔄 Rafraîchir la liste</button>
      <label class="archive-toggle">
        <input type="checkbox" v-model="showArchived" @change="fetchSubjects" />
        Afficher les archivés
      </label>
      <p v-if="info" class="info">{{ info }}</p>


      <table class="styled-table" v-if="subjects.length">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Code</th>
            <th>Coefficient</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in subjects" :key="subject.id">
            <td>{{ subject.name }}</td>
            <td>{{ subject.code }}</td>
            <td>{{ subject.coefficient }}</td>
            <td>
              <template v-if="showArchived">
                <button class="btn-edit" @click="restoreSubject(subject)">Restaurer</button>
              </template>
              <template v-else>
                <button @click="startEdit(subject)" class="btn-edit">Modifier</button>
                <button @click="deleteSubject(subject.id)" class="btn-delete">Supprimer</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="editSubject" class="edit-form">
        <h3>Modifier la matière</h3>
        <form @submit.prevent="updateSubject">
          <input v-model="editSubject.name" type="text" required />
          <input v-model="editSubject.code" type="text" required />
          <input v-model="editSubject.coefficient" type="number" required />
          <button type="submit" class="btn-update">Mettre à jour</button>
          <button @click="cancelEdit" type="button" class="btn-cancel">Annuler</button>
        </form>
        <p v-if="editError" class="error">{{ editError }}</p>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import api from '../plugins/axios'

export default {
  name: 'SubjectsManagement',
  data() {
    return {
      subjects: [],
      error: null,
      newSubject: { name: '', code: '', coefficient: '' },
      addError: null,
      editSubject: null,
      editError: null,
      showArchived: false,
      info: null,
    }
  },
  methods: {
    async restoreSubject(item) {
      try {
        const res = await api.post(`/subjects/${item.id}/restore`)
        this.info = res.data.message
        this.fetchSubjects()
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur lors de la restauration.'
      }
    },
    async fetchSubjects() {
      try {
        const res = await api.get('/subjects', { params: this.showArchived ? { archived: true } : {} })
        this.subjects = res.data
      } catch (err) {
        this.error = 'Erreur de chargement des matières.'
      }
    },
    async addSubject() {
      try {
        this.addError = null
        await api.post('/subjects', this.newSubject)
        this.newSubject = { name: '', code: '', coefficient: '' }
        this.fetchSubjects()
      } catch (err) {
        this.addError = err.response?.data?.message || 'Erreur lors de l’ajout.'
      }
    },
    async deleteSubject(id) {
      if (!confirm('Supprimer cette matière ?')) return
      try {
        const res = await api.delete(`/subjects/${id}`)
        this.info = res.data.message
        this.fetchSubjects()
      } catch (err) {
        this.error = 'Erreur lors de la suppression.'
      }
    },
    startEdit(subject) {
      this.editSubject = { ...subject }
      this.editError = null
    },
    cancelEdit() {
      this.editSubject = null
    },
    async updateSubject() {
      try {
        await api.put(`/subjects/${this.editSubject.id}`, this.editSubject)
        this.editSubject = null
        this.fetchSubjects()
      } catch (err) {
        this.editError = err.response?.data?.message || 'Erreur lors de la mise à jour.'
      }
    }
  },
  mounted() {
    this.fetchSubjects()
  }
}
</script>

<style scoped>
.archive-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 1rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
}
.info {
  color: #1e6b3a;
  margin-bottom: 1rem;
}

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
  max-width: 900px;
  margin: auto;
  padding: 2rem 1rem;
}

input {
  display: block;
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 0.6rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-blue {
  background-color: #104b71;
  color: white;
}
.btn-blue:hover {
  background-color: #0e2c5a;
}

.btn-refresh {
  background-color: #0e2c5a;
  color: white;
  margin: 1rem 0;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
}

.styled-table thead {
  background-color: #0e2c5a;
  color: white;
  font-family: 'Inter', sans-serif;
}

.styled-table th,
.styled-table td {
  padding: 0.8rem 1rem;
  text-align: center;
  border-bottom: 1px solid #ccc;
}

.styled-table tbody tr:hover {
  background-color: #f5f8fa;
}

.btn-edit {
  background-color: #104b71;
  color: white;
  margin-right: 0.5rem;
}
.btn-delete {
  background-color: #c0392b;
  color: white;
}
.btn-update {
  background-color: #104b71;
  color: white;
  margin-right: 0.5rem;
}
.btn-cancel {
  background-color: #888;
  color: white;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>