<template>

  <div class="flex flex-col md:flex-row gap-4 p-4">

    <!-- Main Content -->
    <div class="w-full md:w-3/4 lg:w-5/6">
      <!-- Welcome Section -->
      <div class="bg-white rounded-lg shadow-sm mb-4">
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-3">Bonjour, {{ authStore.user?.username }} !</h2>
          <p class="text-gray-600 m-0">Voici un aperçu de votre activité</p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center mb-3">
            <div class="w-12 h-12 rounded-full bg-opacity-10 flex items-center justify-center mr-3">
              <i class="bi bi-house-door text-primary text-xl"></i>
            </div>
            <div>
              <h6 class="text-gray-600 text-sm mb-1">Propriétés</h6>
              <h3 class="text-2xl font-semibold m-0">{{ stats.properties }}</h3>
            </div>
          </div>
          <div class="h-1 bg-gray-200 rounded-full">
            <div class="h-full rounded-full" style="width: 75%"></div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center mb-3">
            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <i class="bi bi-people text-green-600 text-xl"></i>
            </div>
            <div>
              <h6 class="text-gray-600 text-sm mb-1">Locataires</h6>
              <h3 class="text-2xl font-semibold m-0">{{ stats.tenants }}</h3>
            </div>
          </div>
          <div class="h-1 bg-gray-200 rounded-full">
            <div class="h-full bg-green-600 rounded-full" style="width: 85%"></div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center mb-3">
            <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
              <i class="bi bi-cash-stack text-yellow-600 text-xl"></i>
            </div>
            <div>
              <h6 class="text-gray-600 text-sm mb-1">Revenus mensuels</h6>
              <h3 class="text-2xl font-semibold m-0">{{ stats.monthlyIncome }}€</h3>
            </div>
          </div>
          <div class="h-1 bg-gray-200 rounded-full">
            <div class="h-full bg-yellow-600 rounded-full" style="width: 65%"></div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center mb-3">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <i class="bi bi-ticket-perforated text-red-600 text-xl"></i>
            </div>
            <div>
              <h6 class="text-gray-600 text-sm mb-1">Tickets actifs</h6>
              <h3 class="text-2xl font-semibold m-0">{{ stats.activeTickets }}</h3>
            </div>
          </div>
          <div class="h-1 bg-gray-200 rounded-full">
            <div class="h-full bg-red-600 rounded-full" style="width: 45%"></div>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Recent Activity -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-4 border-b">
              <h5 class="text-lg font-semibold m-0">Activité récente</h5>
            </div>
            <div class="divide-y">
              <div v-for="activity in recentActivity" :key="activity.id" class="p-4">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <i :class="[activity.icon, activity.iconColor]"></i>
                  </div>
                  <div class="flex-grow">
                    <h6 class="font-medium mb-1">{{ activity.title }}</h6>
                    <p class="text-sm text-gray-600 m-0">{{ activity.description }}</p>
                  </div>
                  <small class="text-gray-500">{{ activity.time }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div>
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-4 border-b">
              <h5 class="text-lg font-semibold m-0">Actions rapides</h5>
            </div>
            <div class="p-4">
              <div class="space-y-2">
                <button
                  class="w-full px-4 py-2 border border-primary text-primary rounded hover:text-white transition-all duration-300">
                  <i class="bi bi-plus-circle mr-2"></i> Ajouter une propriété
                </button>
                <button
                  class="w-full px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition-all duration-300">
                  <i class="bi bi-person-plus mr-2"></i> Ajouter un locataire
                </button>
                <button
                  class="w-full px-4 py-2 border border-yellow-600 text-yellow-600 rounded hover:bg-yellow-600 hover:text-white transition-all duration-300">
                  <i class="bi bi-cash mr-2"></i> Enregistrer un paiement
                </button>
                <button
                  class="w-full px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white transition-all duration-300">
                  <i class="bi bi-ticket-perforated mr-2"></i> Créer un ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Mock data for demonstration
const stats = ref({
  properties: 8,
  tenants: 12,
  monthlyIncome: 12500,
  activeTickets: 3
})

const recentActivity = ref([
  {
    id: 1,
    icon: 'bi bi-house-door-fill',
    iconColor: 'text-primary',
    title: 'Nouvelle propriété ajoutée',
    description: 'Appartement T3 - 123 Rue de Paris',
    time: 'Il y a 2h'
  }
])
</script>