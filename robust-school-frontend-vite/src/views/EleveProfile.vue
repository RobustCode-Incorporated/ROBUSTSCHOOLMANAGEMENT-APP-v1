

<template>
  <div class="eleve-profile">
    <h2>Profil de l'élève</h2>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else-if="loading">Chargement...</div>
    <div v-else>
      <p><strong>Prénom :</strong> {{ user.firstName }}</p>
      <p><strong>Nom :</strong> {{ user.lastName }}</p>
      <p><strong>Email :</strong> {{ user.email }}</p>
      <p><strong>Rôle :</strong> {{ user.role }}</p>
      <p v-if="user.classroom">
        <strong>Classe :</strong> {{ user.classroom.name }} - {{ user.classroom.level }}
      </p>
      <p v-else><em>Pas de classe assignée</em></p>
    </div>
  </div>
</template>

<script>
import api from '../plugins/axios'

export default {
  name: 'EleveProfile',
  data() {
    return {
      user: null,
      error: null,
      loading: true,
    }
  },
  async mounted() {
    try {
      const res = await api.get('/users/me')
      this.user = res.data
    } catch (err) {
      this.error = err.response?.data?.message || 'Erreur lors du chargement du profil.'
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.eleve-profile {
  max-width: 600px;
  margin: auto;
  padding: 1rem;
}
p {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.error {
  color: red;
  margin-bottom: 1rem;
}
</style>