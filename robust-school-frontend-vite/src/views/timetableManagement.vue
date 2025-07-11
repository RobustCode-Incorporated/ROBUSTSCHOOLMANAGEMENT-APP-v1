<template>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
    </div>

    <div class="timetable-management">
      <h2>Gestion de l'emploi du temps</h2>

      <!-- Formulaire d’ajout -->
      <form @submit.prevent="addEntry" class="add-form">
        <div class="form-group">
          <input v-model="form.date" type="date" required />
          <input v-model="form.startTime" type="time" required />
          <input v-model="form.endTime" type="time" required />
        </div>

        <div class="form-group">
          <select v-model="form.subjectId" required>
            <option disabled value="">Matière</option>
            <option v-for="subj in subjects" :key="subj.id" :value="subj.id">{{ subj.name }}</option>
          </select>
          <select v-model="form.classroomId" required>
            <option disabled value="">Classe</option>
            <option v-for="cls in classrooms" :key="cls.id" :value="cls.id">{{ cls.name }} - {{ cls.level }}</option>
          </select>
          <select v-model="form.professorId" required>
            <option disabled value="">Professeur</option>
            <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">{{ teacher.firstName }} {{ teacher.lastName }}</option>
          </select>
        </div>

        <button type="submit" class="btn-blue">Ajouter</button>
        <p v-if="formError" class="error">{{ formError }}</p>
      </form>

      <!-- Tableau des créneaux -->
      <table class="styled-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Matière</th>
            <th>Classe</th>
            <th>Professeur</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in entries" :key="entry.id">
            <td>{{ formatDate(entry.date) }}</td>
            <td>{{ entry.startTime }}</td>
            <td>{{ entry.endTime }}</td>
            <td>{{ getSubjectName(entry.subjectId) }}</td>
            <td>{{ getClassroomName(entry.classroomId) }}</td>
            <td>{{ getTeacherName(entry.professorId) }}</td>
            <td>
              <button @click="edit(entry)" class="btn-edit">✏️</button>
              <button @click="remove(entry.id)" class="btn-delete">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Bloc affichage des affectations du prof -->
      <div class="prof-assignments" v-if="assignments.length > 0" style="margin-top: 2rem;">
        <h2>📝 Mes affectations</h2>
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

      <!-- Formulaire de modification -->
      <div v-if="editForm.id" class="edit-form">
        <h3>Modifier le créneau</h3>
        <form @submit.prevent="updateEntry">
          <div class="form-group">
            <input v-model="editForm.date" type="date" required />
            <input v-model="editForm.startTime" type="time" required />
            <input v-model="editForm.endTime" type="time" required />
          </div>
          <div class="form-group">
            <select v-model="editForm.subjectId" required>
              <option disabled value="">Matière</option>
              <option v-for="subj in subjects" :key="subj.id" :value="subj.id">{{ subj.name }}</option>
            </select>
            <select v-model="editForm.classroomId" required>
              <option disabled value="">Classe</option>
              <option v-for="cls in classrooms" :key="cls.id" :value="cls.id">{{ cls.name }} - {{ cls.level }}</option>
            </select>
            <select v-model="editForm.professorId" required>
              <option disabled value="">Professeur</option>
              <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">{{ teacher.firstName }} {{ teacher.lastName }}</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" class="btn-blue">Mettre à jour</button>
            <button type="button" @click="cancelEdit" class="btn-cancel">Annuler</button>
          </div>
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
  name: 'TimetableManagement',
  data() {
    return {
      entries: [],
      form: {
        date: '',
        startTime: '',
        endTime: '',
        subjectId: '',
        classroomId: '',
        professorId: ''
      },
      editForm: {
        id: null,
        date: '',
        startTime: '',
        endTime: '',
        subjectId: '',
        classroomId: '',
        professorId: ''
      },
      error: null,
      formError: null,
      editError: null,
      subjects: [],
      classrooms: [],
      teachers: [],
      assignments: []
    }
  },
  methods: {
    async fetchEntries() {
      try {
        const res = await api.get('/timetable')
        this.entries = res.data
      } catch {
        this.error = 'Erreur chargement emploi du temps.'
      }
    },
    async fetchSubjects() {
      const res = await api.get('/subjects')
      this.subjects = res.data
    },
    async fetchClassrooms() {
      const res = await api.get('/classrooms')
      this.classrooms = res.data
    },
    async fetchTeachers() {
      const res = await api.get('/users?role=prof')
      this.teachers = res.data
    },
    async fetchAssignments() {
      try {
        const res = await api.get('/teaching-assignments/professor')
        this.assignments = res.data
      } catch (err) {
        console.error('Erreur chargement affectations :', err)
        this.assignments = []
      }
    },
    getSubjectName(id) {
      const s = this.subjects.find(el => el.id === id)
      return s?.name || id
    },
    getClassroomName(id) {
      const c = this.classrooms.find(el => el.id === id)
      return c ? `${c.name} - ${c.level}` : id
    },
    getTeacherName(id) {
      const t = this.teachers.find(el => el.id === id)
      return t ? `${t.firstName} ${t.lastName}` : id
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    async addEntry() {
      try {
        await api.post('/timetable', { ...this.form })
        this.form = {
          date: '',
          startTime: '',
          endTime: '',
          subjectId: '',
          classroomId: '',
          professorId: ''
        }
        this.fetchEntries()
      } catch (err) {
        this.formError = err.response?.data?.message || 'Erreur ajout.'
      }
    },
    async remove(id) {
      if (confirm('Supprimer ce créneau ?')) {
        await api.delete(`/timetable/${id}`)
        this.fetchEntries()
      }
    },
    edit(entry) {
      this.editForm = {
        id: entry.id,
        date: entry.date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        subjectId: entry.subjectId,
        classroomId: entry.classroomId,
        professorId: entry.professorId
      }
    },
    cancelEdit() {
      this.editForm = {
        id: null,
        date: '',
        startTime: '',
        endTime: '',
        subjectId: '',
        classroomId: '',
        professorId: ''
      }
    },
    async updateEntry() {
      try {
        await api.put(`/timetable/${this.editForm.id}`, { ...this.editForm })
        this.cancelEdit()
        this.fetchEntries()
      } catch (err) {
        this.editError = err.response?.data?.message || 'Erreur mise à jour.'
      }
    }
  },
  async mounted() {
    await Promise.all([
      this.fetchEntries(),
      this.fetchSubjects(),
      this.fetchClassrooms(),
      this.fetchTeachers()
    ])
    // Appeler fetchAssignments seulement si utilisateur est prof
    if (this.$store.state.user.role === 'prof') {
      await this.fetchAssignments()
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ysabeau+Office&family=ABeeZee&family=Inter&display=swap');

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

.timetable-management {
  max-width: 950px;
  margin: auto;
  padding: 2rem 1rem;
}

.add-form,
.edit-form {
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

input,
select {
  flex: 1;
  padding: 0.5rem;
  min-width: 180px;
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

.btn-edit {
  background-color: #3498db;
  color: white;
  margin-right: 0.3rem;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-cancel {
  background-color: #aaa;
  color: white;
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

.error {
  color: red;
  margin-top: 0.8rem;
}
</style>