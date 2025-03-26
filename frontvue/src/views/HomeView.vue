<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <Navbar />

  <div class="min-h-screen bg-gray-50">

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-4xl font-bold mb-6">Simplifiez la gestion de vos biens immobiliers</h2>
          <p class="text-xl mb-8">Une solution complète pour gérer vos propriétés, locataires et paiements en toute
            simplicité.</p>
          <template v-if="!authStore.isAuthenticated">
            <div class="flex justify-center space-x-4">
              <router-link to="/register"
                class="px-8 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition-all duration-300">
                Commencer gratuitement
              </router-link>
              <router-link to="/login"
                class="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary transition-all duration-300">
                Se connecter
              </router-link>
            </div>
          </template>
        </div>
      </div>
    </section>

  </div>
  
  <Footer />
</template>