import { createStore } from 'vuex'
import axios from 'axios'

const userString = localStorage.getItem('user')
const user = userString && userString !== 'undefined' ? JSON.parse(userString) : null

const store = createStore({
  state: {
    token: localStorage.getItem('token') || null,
    user: user,
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_USER(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    CLEAR_AUTH(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
  actions: {
    async login({ commit }, credentials) {
      const res = await axios.post('http://localhost:5050/api/auth/login', credentials)
      console.log('Réponse login:', res.data)
      commit('SET_TOKEN', res.data.token)
      commit('SET_USER', res.data.user)
      return res.data.user
    },
    async register({ commit }, userData) {
      const res = await axios.post('http://localhost:5050/api/auth/register', userData)
      commit('SET_TOKEN', res.data.token)
      commit('SET_USER', res.data.user)
      return res.data.user
    },
    async registerWithoutLogin(_, userData) {
      const res = await axios.post('http://localhost:5050/users', userData)
      return res.data
    },
    logout({ commit }) {
      commit('CLEAR_AUTH')
    },
  },
  getters: {
    isAuthenticated: state => !!state.token,
    userRole: state => state.user?.role,
    userInfo: state => state.user,
  },
})

export default store