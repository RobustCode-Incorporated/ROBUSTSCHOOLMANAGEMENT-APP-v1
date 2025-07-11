<template>
  <div class="classrooms-management">
    <!-- TOP BAR -->
    <header class="top-bar">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h2>ROBUST SCHOOL MANAGEMENT SYSTEM</h2>
    </header>

    <div class="content">
      <h3>Gestion des classes</h3>

      <section class="form-section">
        <h4>Ajouter une classe</h4>
        <form @submit.prevent="addClassroom">
          <input v-model="newClass.name" type="text" placeholder="Nom" required />
          <input v-model="newClass.level" type="text" placeholder="Niveau" required />
          <input v-model="newClass.academicYear" type="text" placeholder="Année scolaire" required />
          <button type="submit">Ajouter</button>
        </form>
        <p v-if="addError" class="error">{{ addError }}</p>
      </section>

      <button class="refresh" @click="fetchClassrooms">Rafraîchir la liste</button>

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Niveau</th>
            <th>Année scolaire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="classe in classrooms" :key="classe.id">
            <td>{{ classe.name }}</td>
            <td>{{ classe.level }}</td>
            <td>{{ classe.academicYear }}</td>
            <td>
              <button class="edit" @click="startEdit(classe)">Modifier</button>
              <button class="delete" @click="deleteClassroom(classe.id)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>

      <section v-if="editClass" class="edit-section">
        <h4>Modifier la classe</h4>
        <form @submit.prevent="updateClassroom">
          <input v-model="editClass.name" type="text" required />
          <input v-model="editClass.level" type="text" required />
          <input v-model="editClass.academicYear" type="text" required />
          <button type="submit">Mettre à jour</button>
          <button type="button" class="cancel" @click="cancelEdit">Annuler</button>
        </form>
        <p v-if="editError" class="error">{{ editError }}</p>
      </section>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import api from '../plugins/axios'

export default {
  name: 'ClassroomsManagement',
  data() {
    return {
      classrooms: [],
      error: null,
      newClass: {
        name: '',
        level: '',
        academicYear: '',
      },
      addError: null,
      editClass: null,
      editError: null,
    }
  },
  methods: {
    async fetchClassrooms() {
      try {
        const res = await api.get('/classrooms')
        this.classrooms = res.data
      } catch (err) {
        this.error = 'Erreur de chargement des classes.'
      }
    },
    async addClassroom() {
      try {
        this.addError = null
        await api.post('/classrooms', this.newClass)
        this.newClass = { name: '', level: '', academicYear: '' }
        this.fetchClassrooms()
      } catch (err) {
        this.addError = err.response?.data?.message || 'Erreur lors de l’ajout.'
      }
    },
    async deleteClassroom(id) {
      if (!confirm('Supprimer cette classe ?')) return
      try {
        await api.delete(`/classrooms/${id}`)
        this.fetchClassrooms()
      } catch (err) {
        this.error = 'Erreur lors de la suppression.'
      }
    },
    startEdit(classe) {
      this.editClass = { ...classe }
      this.editError = null
    },
    cancelEdit() {
      this.editClass = null
    },
    async updateClassroom() {
      try {
        await api.put(`/classrooms/${this.editClass.id}`, this.editClass)
        this.editClass = null
        this.fetchClassrooms()
      } catch (err) {
        this.editError = err.response?.data?.message || 'Erreur lors de la mise à jour.'
      }
    },
  },
  mounted() {
    this.fetchClassrooms()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=ABeeZee&family=Inter&family=Ysabeau+Office&display=swap');

.classrooms-management {
  font-family: 'ABeeZee', sans-serif;
}

.top-bar {
  display: flex;
  align-items: center;
  background-color: #0E2C5A;
  padding: 1rem 2rem;
  color: white;
}
.top-bar .logo {
  height: 40px;
  margin-right: 1rem;
}

.content {
  max-width: 900px;
  margin: auto;
  padding: 2rem;
}

form {
  margin-bottom: 1rem;
}
input {
  display: block;
  width: 100%;
  margin-bottom: 0.7rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}
button {
  padding: 0.5rem 1.2rem;
  border: none;
  background-color: #104B71;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
button:hover {
  background-color: #0e2c5a;
}
.refresh {
  margin-bottom: 1rem;
}
.edit {
  background-color: #104B71;
  margin-right: 0.5rem;
}
.delete {
  background-color: #e74c3c;
}
.cancel {
  background-color: #777;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th, td {
  border: 1px solid #ccc;
  padding: 0.7rem;
  text-align: center;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>