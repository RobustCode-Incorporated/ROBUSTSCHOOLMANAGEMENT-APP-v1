<template>
  <div class="prof-notes">
    <h2>🎓 Gestion des notes</h2>

    <form @submit.prevent="handleSubmit" class="note-form">
      <label>Matière enseignée :</label>
      <select v-model="form.subjectId" required>
        <option disabled value="">Sélectionner une matière</option>
        <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>

      <label>Élève inscrit :</label>
      <select v-model="form.studentId" required>
        <option disabled value="">Sélectionner un élève</option>
        <option v-for="s in filteredStudents" :key="s.student.id" :value="s.student.id">
          {{ getStudentName(s.student.id) }} ({{ getSubjectName(s.subject.id) }})
        </option>
      </select>

      <label>Note (0-20)</label>
      <input v-model.number="form.value" type="number" min="0" max="20" step="0.1" placeholder="Note" required />

      <label>Commentaire</label>
      <input v-model="form.comment" type="text" placeholder="Commentaire (optionnel)" />

      <label>Date</label>
      <input v-model="form.date" type="date" required />

      <div class="form-buttons">
        <button type="submit">{{ editMode ? 'Mettre à jour' : 'Ajouter la note' }}</button>
        <button v-if="editMode" @click="cancelEdit" type="button">Annuler</button>
      </div>

      <p v-if="formError" class="error">{{ formError }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </form>

    <hr />
    <h3>🗂️ Liste des notes enregistrées</h3>
    <table>
      <thead>
        <tr>
          <th>Élève</th>
          <th>Matière</th>
          <th>Note</th>
          <th>Commentaire</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="note in notes" :key="note.id">
          <td>{{ getStudentName(note.studentId) }}</td>
          <td>{{ getSubjectName(note.subjectId) }}</td>
          <td>{{ note.value }}</td>
          <td>{{ note.comment || '-' }}</td>
          <td>{{ formatDate(note.date) }}</td>
          <td>
            <button @click="startEdit(note)">✏️</button>
            <button @click="confirmDelete(note)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '../plugins/axios';

export default {
  name: 'ProfNotes',
  data() {
    return {
      enrolled: [],
      notes: [],
      form: {
        studentId: '',
        subjectId: '',
        value: null,
        comment: '',
        date: new Date().toISOString().split('T')[0],
      },
      editMode: false,
      formError: null,
      successMessage: null,
    }
  },
  computed: {
    subjects() {
      const uniqueSubjects = new Map();
      this.enrolled.forEach(e => {
        if (!uniqueSubjects.has(e.subject.id)) {
          uniqueSubjects.set(e.subject.id, e.subject);
        }
      });
      return Array.from(uniqueSubjects.values());
    },
    filteredStudents() {
      return this.enrolled.filter(e => e.subject.id === this.form.subjectId);
    }
  },
  methods: {
    async fetchData() {
      try {
        const [enrolledRes, notesRes] = await Promise.all([
          api.get('/subjects/professor/enrolled-students'),
          api.get('/notes/professeur')
        ])
        this.enrolled = enrolledRes.data;
        this.notes = notesRes.data;
      } catch (err) {
        this.formError = 'Erreur lors du chargement des données.';
        console.error(err);
      }
    },
    getStudentName(id) {
      const match = this.enrolled.find(e => e.student.id === id);
      return match ? `${match.student.firstName} ${match.student.lastName}` : 'Inconnu';
    },
    getSubjectName(id) {
      const subject = this.subjects.find(s => s.id === id);
      return subject ? subject.name : 'Inconnu';
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    startEdit(note) {
      this.editMode = true;
      this.form = {
        id: note.id,
        studentId: note.studentId,
        subjectId: note.subjectId,
        value: note.value,
        comment: note.comment,
        date: note.date.split('T')[0],
      };
    },
    cancelEdit() {
      this.form = {
        studentId: '',
        subjectId: '',
        value: null,
        comment: '',
        date: new Date().toISOString().split('T')[0],
      };
      this.editMode = false;
    },
    async handleSubmit() {
      this.formError = null;
      try {
        if (this.editMode) {
          await api.put(`/notes/${this.form.id}`, this.form);
          this.successMessage = 'Note mise à jour';
        } else {
          await api.post('/notes', this.form);
          this.successMessage = 'Note enregistrée';
        }
        this.cancelEdit();
        this.fetchData();
      } catch (err) {
        this.formError = err.response?.data?.message || 'Erreur lors de la sauvegarde';
      }
    },
    async confirmDelete(note) {
      if (!confirm('Supprimer cette note ?')) return;
      try {
        await api.delete(`/notes/${note.id}`);
        this.fetchData();
      } catch (err) {
        this.formError = 'Erreur lors de la suppression.';
      }
    }
  },
  mounted() {
    this.fetchData();
  }
}
</script>

<style scoped>
.prof-notes {
  max-width: 800px;
  margin: auto;
  padding: 2rem;
  font-family: 'Ysabeau Office', sans-serif;
}
.note-form {
  display: grid;
  gap: 0.7rem;
  margin-bottom: 2rem;
}
input,
select {
  padding: 0.5rem;
  font-size: 1rem;
  width: 100%;
  font-family: 'ABeeZee', sans-serif;
}
.form-buttons {
  display: flex;
  gap: 1rem;
}
button {
  padding: 0.5rem 1rem;
  cursor: pointer;
  background-color: #0e2c5a;
  color: white;
  border: none;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
}
button:hover {
  background-color: #104b71;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th,
td {
  border: 1px solid #ccc;
  padding: 0.6rem;
  text-align: center;
}
.error {
  color: red;
}
.success {
  color: green;
  margin-top: 1rem;
}
</style>