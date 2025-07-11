<template>
  <div class="users-wrapper">
    <!-- Header -->
    <div class="header">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1>ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
    </div>

    <div class="users-management">
      <h2>Gestion des utilisateurs</h2>

      <router-link :to="{ name: 'Register', query: { from: 'admin' } }">
        <button class="btn-blue">+ Ajouter un utilisateur</button>
      </router-link>

      <!-- Formulaire d’édition -->
      <div v-if="editUser" class="edit-user-form">
        <h3>Modifier utilisateur</h3>
        <form @submit.prevent="handleUpdateUser">
          <input v-model="editUser.firstName" type="text" placeholder="Prénom" required />
          <input v-model="editUser.lastName" type="text" placeholder="Nom" required />
          <input v-model="editUser.email" type="email" placeholder="Email" required />
          <input v-model="editUser.password" type="password" placeholder="Nouveau mot de passe (laisser vide)" />
          <select v-model="editUser.role" required>
            <option disabled value="">Sélectionnez un rôle</option>
            <option value="ADMIN">Admin</option>
            <option value="PROF">Professeur</option>
            <option value="ELEVE">Élève</option>
          </select>
          <div class="form-buttons">
            <button type="submit" class="btn-update">Enregistrer</button>
            <button type="button" @click="cancelEditUser" class="btn-cancel">Annuler</button>
          </div>
        </form>
        <p v-if="editUserError" class="error">{{ editUserError }}</p>
      </div>

      <button @click="fetchUsers" class="btn-refresh">🔄 Rafraîchir la liste</button>

      <!-- Tableau utilisateurs -->
      <table class="styled-table">
        <thead>
          <tr>
            <th>Nom complet</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button @click="startEditUser(user)" class="btn-edit">Modifier</button>
              <button @click="confirmDelete(user)" class="btn-delete">Supprimer</button>
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
  name: 'UsersManagement',
  data() {
    return {
      users: [],
      error: null,
      editUser: null,
      editUserError: null,
    }
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await api.get('/users')
        this.users = res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur chargement utilisateurs'
      }
    },
    startEditUser(user) {
      this.editUser = { ...user, password: '' }
      this.editUserError = null
    },
    cancelEditUser() {
      this.editUser = null
      this.editUserError = null
    },
    async handleUpdateUser() {
      try {
        const payload = { ...this.editUser }
        if (!payload.password) delete payload.password
        await api.put(`/users/${this.editUser.id}`, payload)
        this.editUser = null
        this.fetchUsers()
      } catch (err) {
        this.editUserError = err.response?.data?.message || 'Erreur mise à jour'
      }
    },
    async confirmDelete(user) {
      if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return
      try {
        await api.delete(`/users/${user.id}`)
        this.fetchUsers()
      } catch (err) {
        this.error = err.response?.data?.message || 'Erreur suppression'
      }
    },
  },
  mounted() {
    this.fetchUsers()
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ysabeau+Office&family=ABeeZee&family=Inter&display=swap');

.users-wrapper {
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

.users-management {
  max-width: 900px;
  margin: auto;
  padding: 2rem 1rem;
}

input,
select {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
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

.btn-refresh {
  background-color: #0e2c5a;
  color: white;
  margin: 1rem 0;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
  margin-top: 1rem;
  border-radius: 6px;
  overflow: hidden;
}

.styled-table thead {
  background-color: #0e2c5a;
  color: white;
  font-family: 'Inter', sans-serif;
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

.btn-edit {
  background-color: #104b71;
  color: white;
  margin-right: 0.4rem;
}
.btn-delete {
  background-color: #c0392b;
  color: white;
}

.btn-update {
  background-color: #104b71;
  color: white;
  margin-right: 0.4rem;
}
.btn-cancel {
  background-color: #999;
  color: white;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>