<template>
    <Navbar />
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-12">
      <div class="max-w-md mx-auto">
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/70 border border-gray-100">
          <div class="p-8 text-center">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary-dark/10 flex items-center justify-center mx-auto mb-6 ring-4 ring-white">
              <i class="bi bi-person-circle text-4xl text-primary"></i>
            </div>
            <h2 class="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Connexion
            </h2>
            <p class="text-gray-600">Accédez à votre espace de gestion</p>
          </div>
          
          <div class="px-8 pb-8">
            <div v-if="errorMessage" 
              class="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center space-x-2 border border-red-100">
              <i class="bi bi-exclamation-circle"></i>
              <span>{{ errorMessage }}</span>
            </div>
            
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                    <i class="bi bi-envelope"></i>
                  </div>
                  <input 
                    type="email" 
                    class="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700" 
                    id="email" 
                    v-model="email"
                    placeholder="nom@exemple.com" 
                    required
                  >
                </div>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                    <i class="bi bi-lock"></i>
                  </div>
                  <input 
                    type="text" 
                    class="block w-full pl-11 pr-11 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700" 
                    id="password" 
                    v-model="password"
                    required
                  >
                </div>
              </div>
              
              <button 
                type="submit" 
                class="w-full py-2.5 px-4 bg-gradient-to-r from-primary to-primary-dark rounded-xl hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 disabled:opacity-50 font-medium text-sm"
                :disabled="loading"
              >
                <div class="flex items-center justify-center space-x-2">
                  <svg v-if="loading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <i v-else class="bi bi-box-arrow-in-right"></i>
                  <span>Se connecter</span>
                </div>
              </button>

            </form>
            
          </div>
        </div>

      </div>
    </main>
  </div>
  <Footer />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    
    console.log('Connexion test ')
    const res = await authStore.login(email.value, password.value)
    console.log('Connexion réussie ' + res)
    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur de connexion. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script> 