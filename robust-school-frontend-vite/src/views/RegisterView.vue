<template>
  <div class="register-container">
    <!-- Bloc gauche -->
    <div class="left-panel">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1 class="title">ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
    </div>

    <!-- Bloc droit -->
    <div class="right-panel">
      <form class="register-form" @submit.prevent="handleRegister" v-if="!success">
        <label>Prénom</label>
        <input v-model="firstName" type="text" placeholder="Prénom" required />

        <label>Nom</label>
        <input v-model="lastName" type="text" placeholder="Nom" required />

        <label>Email</label>
        <input v-model="email" type="email" placeholder="Email" required />

        <label>Mot de passe</label>
        <input v-model="password" type="password" placeholder="Mot de passe" required />

        <!-- Choix du rôle réservé à l'admin ; l'inscription publique crée un compte élève -->
        <label v-if="isAdminCreation">Rôle</label>
        <select v-if="isAdminCreation" v-model="role" required>
          <option disabled value="">Choisir un rôle</option>
          <option value="ADMIN">Admin</option>
          <option value="PROF">Professeur</option>
          <option value="ELEVE">Élève</option>
        </select>

        <button type="submit">S'inscrire</button>
      </form>

      <!-- Message de succès -->
      <div v-else class="success-message">
        <p>✅ Enregistrement réussi !</p>
        <button @click="goToLogin">Se connecter</button>
      </div>

      <!-- Message d'erreur -->
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'
import store from '../store'
import api from '../plugins/axios'

export default {
  name: 'RegisterView',
  setup() {
    const firstName = ref('')
    const lastName = ref('')
    const email = ref('')
    const password = ref('')
    const role = ref('')
    const error = ref(null)
    const success = ref(false)
    const router = useRouter()
    const route = useRoute()
    const isAdminCreation = route.query.from === 'admin' && store.getters.userRole === 'admin'

    const handleRegister = async () => {
      try {
        error.value = null
        const userData = {
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          password: password.value,
        }

        if (isAdminCreation) {
          // Création par l'admin : route protégée, la session admin est conservée
          await api.post('/users', { ...userData, role: role.value.toLowerCase() })
          router.push('/admin/users')
        } else {
          await store.dispatch('register', userData)
          success.value = true
        }
      } catch (err) {
        console.error('Erreur inscription complète:', err)
        error.value =
          err.response?.data?.message ||
          err.response?.data?.detail?.[0]?.message ||
          err.message ||
          "Échec de l'inscription."
      }
    }

    const goToLogin = () => {
      router.push('/login')
    }

    return {
      firstName,
      lastName,
      email,
      password,
      role,
      isAdminCreation,
      error,
      success,
      handleRegister,
      goToLogin,
    }
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=ABeeZee&family=Inter&family=Ysabeau+Office&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

.register-container {
  display: flex;
  height: 100vh;
  font-family: 'ABeeZee', sans-serif;
}

.left-panel {
  width: 704px;
  background-color: #0E2C5A;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100vh;
}

.logo {
  width: 120px;
  margin-bottom: 20px;
}

.title {
  font-family: 'Ysabeau Office', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 1px;
}

.right-panel {
  flex: 1;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 80px;
}

.register-form label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

.register-form input,
.register-form select {
  width: 437px;
  height: 50px;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'ABeeZee', sans-serif;
}

.register-form button {
  background-color: #104B71;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  width: 437px;
  height: 60px;
}

.success-message {
  text-align: center;
  color: green;
}

.success-message button {
  margin-top: 16px;
  background-color: #104B71;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
}

.error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}
</style>