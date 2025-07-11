// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index.js'

//import './assets/main.css' // si tu as des styles globaux

const app = createApp(App)

app.use(store)
app.use(router)

app.mount('#app')