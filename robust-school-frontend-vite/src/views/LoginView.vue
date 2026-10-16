<template>
  <div class="login-container">
    <!-- Bloc gauche -->
    <div class="left-panel">
      <img src="/src/assets/logo_white.png" alt="Logo" class="logo" />
      <h1 class="title">ROBUST SCHOOL MANAGEMENT SYSTEM</h1>
    </div>

    <!-- Bloc droit -->
    <div class="right-panel">
      <form class="login-form" @submit.prevent="handleLogin">
        <label>Email</label>
        <input type="email" v-model="email" placeholder="Email" required />

        <label>Mot de passe</label>
        <input type="password" v-model="password" placeholder="Mot de passe" required />

        <button type="submit" :disabled="loading">CONNEXION</button>
      </form>

      <p class="register-text">
        Don’t have an account?
        <router-link to="/register">Register</router-link>
      </p>

      <p v-if="error" class="error">{{ error }}</p>

      <router-link to="/confidentialite" class="privacy-link">Politique de confidentialité</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import store from '../store'

const email = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)
const router = useRouter()

const handleLogin = async () => {
  try {
    error.value = null
    loading.value = true
    const user = await store.dispatch('login', {
      email: email.value,
      password: password.value,
    })

    loading.value = false
    if (!user) {
      error.value = 'Utilisateur non trouvé ou réponse invalide.'
      return
    }

    const role = user.role?.toUpperCase?.() || ''
    if (role === 'ADMIN') router.push('/admin')
    else if (role === 'PROF') router.push('/prof')
    else if (role === 'ELEVE') router.push('/eleve')
    else router.push('/login')
  } catch (err) {
    loading.value = false
    error.value = err.response?.data?.message || 'Échec de la connexion.'
  }
}
</script>

<style scoped>
.privacy-link {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: #707070;
}

@import url('https://fonts.googleapis.com/css2?family=ABeeZee&family=Inter&family=Ysabeau+Office&display=swap');

.login-container {
  display: flex;
  height: 100vh;
  font-family: 'ABeeZee', sans-serif;
}

.left-panel {
  width: 704px;
  height: 100vh;
  background-color: #0E2C5A;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
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

.login-form label {
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
}

.login-form input {
  width: 437px;
  height: 50px;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'ABeeZee', sans-serif;
}

.login-form button {
  background-color: #104B71;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  width: 437px;
  height: 70px;
}

.login-form button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-text {
  margin-top: 20px;
  text-align: center;
  font-family: 'Apple SD Gothic Neo', sans-serif;
  color: #707070;
}

.register-text a {
  color: #104B71;
  text-decoration: none;
  margin-left: 5px;
}

.error {
  color: red;
  margin-top: 16px;
  text-align: center;
}
</style>