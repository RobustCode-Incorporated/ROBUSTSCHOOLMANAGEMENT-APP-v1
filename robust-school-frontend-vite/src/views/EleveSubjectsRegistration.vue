<template>
    <div class="eleve-subjects-registration">
      <h2>Inscription aux matières</h2>
  
      <h3>Matières disponibles</h3>
      <div v-if="loading">Chargement...</div>
      <ul v-else>
        <li v-for="subject in availableSubjects" :key="subject.id">
          {{ subject.name }}
          <button @click="enroll(subject.id)" :disabled="isEnrolled(subject.id)">
            {{ isEnrolled(subject.id) ? 'Inscrit' : 'S\'inscrire' }}
          </button>
        </li>
      </ul>
  
      <h3>Matières inscrites</h3>
      <ul v-if="enrolledSubjects.length">
        <li v-for="subject in enrolledSubjects" :key="subject.id">
          {{ subject.name }}
          <button @click="unenroll(subject.id)">Se désinscrire</button>
        </li>
      </ul>
      <p v-else>Aucune matière inscrite.</p>
  
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
  </template>
  
  <script>
  import api from '../plugins/axios'
  import store from '../store'
  
  export default {
    name: 'EleveSubjectsRegistration',
    data() {
      return {
        availableSubjects: [],
        enrolledSubjects: [],
        loading: false,
        error: null,
        successMessage: null,
        userId: null,
      }
    },
    methods: {
      async fetchAvailableSubjects() {
        try {
          this.error = null
          const res = await api.get('/subjects')
          this.availableSubjects = res.data
        } catch (err) {
          this.error = 'Erreur lors du chargement des matières.'
        }
      },
      async fetchEnrolledSubjects() {
        try {
          this.error = null
          const res = await api.get(`/student-assignments/${this.userId}/subjects`)
          this.enrolledSubjects = res.data
        } catch (err) {
          this.error = 'Erreur lors du chargement des matières inscrites.'
        }
      },
      isEnrolled(subjectId) {
        return this.enrolledSubjects.some(subj => subj.id === subjectId)
      },
      async enroll(subjectId) {
        try {
          this.error = null
          this.successMessage = null
          await api.post('/student-assignments', {
            studentId: this.userId,
            subjectId,
          })
          this.successMessage = 'Inscription réussie.'
          this.fetchEnrolledSubjects()
        } catch (err) {
          this.error = err.response?.data?.message || 'Erreur lors de l\'inscription.'
        }
      },
      async unenroll(subjectId) {
        try {
          this.error = null
          this.successMessage = null
          await api.delete(`/student-assignments/${this.userId}/subjects/${subjectId}`)
          this.successMessage = 'Désinscription réussie.'
          this.fetchEnrolledSubjects()
        } catch (err) {
          this.error = err.response?.data?.message || 'Erreur lors de la désinscription.'
        }
      }
    },
    mounted() {
      this.userId = store.state.user?.id
      this.fetchAvailableSubjects()
      this.fetchEnrolledSubjects()
    }
  }
  </script>
  
  <style scoped>
  .eleve-subjects-registration {
    max-width: 700px;
    margin: auto;
    padding: 1rem;
  }
  button {
    margin-left: 1rem;
    padding: 0.3rem 0.6rem;
  }
  .error {
    color: red;
    margin-top: 1rem;
  }
  .success {
    color: green;
    margin-top: 1rem;
  }
  </style>