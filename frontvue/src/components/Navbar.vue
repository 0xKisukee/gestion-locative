<template>
    <header class="bg-white/70 backdrop-blur-sm border-b border-gray-200">
        <nav class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                
                <!-- Logo -->
                <router-link to="/" class="flex space-x-2">
                    <svg class="w-8 h-8 text-primary group-hover:scale-110 transition-transform" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h1
                        class="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text">
                        Gestion Locative
                    </h1>
                </router-link>

                <!-- Auth Buttons -->
                <div class="flex items-center space-x-6">
                    <template v-if="!authStore.isAuthenticated">
                        <router-link to="/login" class="text-primary hover:text-primary-dark transition-colors">
                            Connexion
                        </router-link>
                        <router-link to="/register"
                            class="px-6 py-2.5 text-primary border-2 border-primary rounded-full hover:bg-primary hover:text-white transition-all duration-300 font-medium text-sm flex items-center space-x-2 hover:shadow-lg hover:shadow-primary/20">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Inscription</span>
                        </router-link>
                    </template>

                    <template v-else>
                        <router-link to="/dashboard" class="text-primary hover:text-primary-dark transition-colors">
                            Dashboard
                        </router-link>
                        <button @click="handleLogout">
                            Déconnexion
                        </button>
                    </template>
                </div>

            </div>
        </nav>
    </header>
</template>

<script setup>
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'

    const router = useRouter()
    const authStore = useAuthStore()

    const handleLogout = async () => {
        await authStore.logout()
        router.push('/')
    }
</script>