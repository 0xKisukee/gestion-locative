import './assets/tailwind.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Configure Axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
axios.defaults.headers.common['Content-Type'] = 'application/json'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Add request interceptor for authentication
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

// Check authentication state before mounting
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
console.log("Checking auth (on refresh)" + authStore)
authStore.checkAuth()

app.mount('#app')
