import axios from 'axios'
import store from '../store'

const api = axios.create({
  baseURL: 'http://localhost:5050/api',
})

// Intercepteur pour ajouter le token dans l'en-tête Authorization
api.interceptors.request.use(config => {
  const token = store.state.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

export default api
