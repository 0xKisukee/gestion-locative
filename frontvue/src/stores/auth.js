import { defineStore } from 'pinia'
import axios from 'axios'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isAuthenticated = ref(false)

  const getUserRole = computed(() => user.value?.role || null)

  async function login(email, password) {
    try {
      const response = await axios.post('/api/user/login', { email, password })
      const { token: newToken, user: newUser } = response.data

      token.value = newToken
      user.value = newUser
      isAuthenticated.value = true

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))

      return true
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function register(username, email, role, password) {
    try {
      const response = await axios.post('/api/user/create', { username, email, role, password })
      return response.data
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  function logout() {
    token.value = null
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function checkAuth() {
    const storedToken = localStorage.getItem('token')
    const storedUser = JSON.parse(localStorage.getItem('user'))

    if (storedToken && storedUser) {
      try {
        // Vérifier si le token est valide en faisant une requête à l'API
        await axios.get('/api/user/me')

        token.value = storedToken
        user.value = storedUser
        isAuthenticated.value = true
        return true
      } catch (error) {
        // Si le token est invalide ou expiré, on déconnecte l'utilisateur
        console.log(error)
        logout()
        return false
      }
    }

    return false
  }

  return {
    user,
    token,
    isAuthenticated,
    getUserRole,
    login,
    register,
    logout,
    checkAuth
  }
})
