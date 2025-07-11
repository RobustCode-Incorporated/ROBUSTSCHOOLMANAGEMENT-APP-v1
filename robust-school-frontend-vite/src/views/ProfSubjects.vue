<template>
  <div class="prof-subjects">
    <h2>Mes Matières et Élèves inscrits</h2>

    <div v-if="loading">Chargement en cours...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="subjects.length" class="subject-list">
      <div v-for="(subject, index) in subjects" :key="index" class="subject-card">
        <h3>{{ subject.name }} ({{ subject.code }})</h3>
        <table>
          <thead>
            <tr>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in subject.students" :key="student.id">
              <td>{{ student.firstName }}</td>
              <td>{{ student.lastName }}</td>
              <td>{{ student.email }}</td>
              <td>
                <router-link :to="`/prof/note/${student.id}/${subject.id}`">
                  <button>📝 Noter</button>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="!loading">Aucune matière avec des élèves inscrits pour l'instant.</div>
  </div>
</template>

<script>
import api from '../plugins/axios';

export default {
  name: 'ProfSubjects',
  data() {
    return {
      subjects: [],
      loading: false,
      error: null
    };
  },
  async mounted() {
    this.loading = true;
    try {
      const res = await api.get('/subjects/professor/enrolled-students');
      // Regrouper par matière
      const grouped = {};
      for (const item of res.data) {
        const sid = item.subject.id;
        if (!grouped[sid]) {
          grouped[sid] = {
            ...item.subject,
            students: []
          };
        }
        grouped[sid].students.push(item.student);
      }
      this.subjects = Object.values(grouped);
    } catch (err) {
      this.error = err.response?.data?.message || 'Erreur lors du chargement';
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.prof-subjects {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
}
.subject-card {
  background-color: #f9f9f9;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}
th, td {
  border: 1px solid #ddd;
  padding: 0.6rem;
  text-align: left;
}
button {
  background-color: #0e2c5a;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #104b71;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>