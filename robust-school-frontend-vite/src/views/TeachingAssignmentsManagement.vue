<template>
  <div class="wrapper">
    <!-- Header avec logo -->
    <div class="header">
      <img src="/src/assets/logo_white.png" class="logo" />
      <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
    </div>

    <!-- Contenu principal -->
    <div class="teaching-management">
      <h2>🧑‍🏫 Affectations Matière - Professeur - Classe</h2>

      <!-- Formulaire -->
      <form @submit.prevent="addAssignment" class="form-assignment">
        <select v-model="selectedProfessor" required>
          <option disabled value="">Sélectionner un professeur</option>
          <option v-for="prof in professors" :key="prof.id" :value="prof.id">
            {{ prof.firstName }} {{ prof.lastName }}
          </option>
        </select>

        <select v-model="selectedSubject" required>
          <option disabled value="">Sélectionner une matière</option>
          <option v-for="subj in subjects" :key="subj.id" :value="subj.id">
            {{ subj.name }} ({{ subj.code }})
          </option>
        </select>

        <select v-model="selectedClassroom" required>
          <option disabled value="">Sélectionner une classe</option>
          <option v-for="cls in classrooms" :key="cls.id" :value="cls.id">
            {{ cls.name }} - {{ cls.level }}
          </option>
        </select>

        <button type="submit" class="btn-blue">Ajouter Affectation</button>
      </form>
      <p v-if="error" class="form-error">{{ error }}</p>

      <!-- Tableau -->
      <table class="styled-table">
        <thead>
          <tr>
            <th>Professeur</th>
            <th>Matière</th>
            <th>Classe</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="assign in assignments" :key="assign.id">
            <td>{{ assign.assignedProfessor?.firstName || 'N/A' }} {{ assign.assignedProfessor?.lastName || '' }}</td>
            <td>{{ assign.assignedSubject?.name || 'N/A' }}</td>
            <td>{{ assign.assignedClassroom?.name || 'N/A' }}</td>
            <td>
              <button @click="deleteAssignment(assign.id)" class="btn-delete">🗑️</button>
            </td>
          </tr>
          <tr v-if="assignments.length === 0">
            <td colspan="4" class="no-data">Aucune affectation enregistrée.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from '../plugins/axios'

export default {
  name: 'TeachingAssignmentsManagement',
  setup() {
    const assignments = ref([])
    const professors = ref([])
    const subjects = ref([])
    const classrooms = ref([])

    const selectedProfessor = ref('')
    const selectedSubject = ref('')
    const selectedClassroom = ref('')
    const error = ref(null)

    const loadData = async () => {
      try {
        const [resAssign, resProfs, resSubjects, resClasses] = await Promise.all([
          axios.get('teaching-assignments'),
          axios.get('users?role=prof'),
          axios.get('subjects'),
          axios.get('classrooms')
        ])

        assignments.value = resAssign.data
        professors.value = resProfs.data
        subjects.value = resSubjects.data
        classrooms.value = resClasses.data
      } catch (err) {
        console.error('Erreur chargement données:', err)
        error.value = 'Erreur lors du chargement des affectations.'
      }
    }

    const addAssignment = async () => {
      error.value = null
      try {
        await axios.post('teaching-assignments', {
          professorId: selectedProfessor.value,
          subjectId: selectedSubject.value,
          classroomId: selectedClassroom.value
        })
        await loadData()
        selectedProfessor.value = ''
        selectedSubject.value = ''
        selectedClassroom.value = ''
      } catch (err) {
        error.value = err.response?.data?.message || 'Erreur lors de l’ajout.'
      }
    }

    const deleteAssignment = async (id) => {
      if (!confirm('Supprimer cette affectation ?')) return
      try {
        await axios.delete(`teaching-assignments/${id}`)
        await loadData()
      } catch (err) {
        error.value = err.response?.data?.message || 'Erreur lors de la suppression.'
      }
    }

    onMounted(loadData)

    return {
      assignments,
      professors,
      subjects,
      classrooms,
      selectedProfessor,
      selectedSubject,
      selectedClassroom,
      error,
      addAssignment,
      deleteAssignment
    }
  }
}
</script>

<style scoped>
.form-error {
  color: #c0392b;
  margin: -0.5rem 0 1rem;
}

@import url('https://fonts.googleapis.com/css2?family=ABeeZee&family=Ysabeau+Office&display=swap');

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

.teaching-management {
  max-width: 950px;
  margin: auto;
  padding: 2rem 1rem;
}

h2 {
  margin-bottom: 1.5rem;
}

.form-assignment {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.form-assignment select {
  flex: 1 1 250px;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.btn-blue {
  background-color: #104b71;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-blue:hover {
  background-color: #0e2c5a;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-delete:hover {
  background-color: #c0392b;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
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
  background-color: #f3f6f9;
}

.no-data {
  text-align: center;
  font-style: italic;
  color: #777;
  padding: 1rem;
}
</style>