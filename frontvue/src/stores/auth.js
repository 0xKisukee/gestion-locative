import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false
  }),

  getters: {
    getUserRole: (state) => state.user?.role || null,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    async login(email, password) {
      try {
        const response = await axios.post('/api/user/login', { email, password })
        const { token, user } = response.data
        
        this.token = token
        this.user = user
        this.isAuthenticated = true
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return true
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    async register(username, email, role, password) {
      try {
        const response = await axios.post('/api/user/create', { username, email, role, password })
        return response.data
      } catch (error) {
        console.error('Register error:', error)
        throw error
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    checkAuth() {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user'))
      
      if (token && user) {
        this.token = token
        this.user = user
        this.isAuthenticated = true
        return true
      }
      
      return false
    }
  }
}) 