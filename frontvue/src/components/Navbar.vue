<template>
    <header class="bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 transition-all duration-300" 
            :class="{ 'shadow-md': scrolled }">
        <nav class="container mx-auto px-6 py-3">
            <div class="flex items-center justify-between">
                
                <!-- Logo -->
                <router-link to="/" class="flex items-center space-x-2 group">
                    <div class="relative">
                        <svg class="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span class="absolute -top-1 -right-1 bg-primary/10 w-3 h-3 rounded-full animate-ping"></span>
                    </div>
                    <h1 class="text-xl font-bold text-primary">
                        Gestion Locative
                    </h1>
                </router-link>

                <!-- Auth Buttons -->
                <div class="flex items-center space-x-6">
                    <template v-if="!authStore.isAuthenticated">
                        <router-link to="/login" class="text-primary hover:text-primary-dark transition-colors font-medium">
                            Connexion
                        </router-link>
                        <router-link to="/register"
                            class="px-6 py-2 text-primary border-2 border-primary rounded-full hover:bg-primary/10 hover:border-primary/80 transition-all duration-300 font-medium text-sm flex items-center space-x-2 hover:shadow-lg hover:shadow-primary/20">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Inscription</span>
                        </router-link>
                    </template>

                    <template v-else>
                        <!-- User Menu Dropdown -->
                        <div class="relative" v-click-outside="closeUserMenu">
                            <button @click="toggleUserMenu" class="flex items-center space-x-2 focus:outline-none">
                                <div class="flex flex-col items-end">
                                    <span class="text-sm font-medium text-gray-800">{{ authStore.user?.firstName || 'Utilisateur' }}</span>
                                    <span class="text-xs text-gray-500">Mon compte</span>
                                </div>
                                <div class="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                    {{ userInitials }}
                                </div>
                                <svg :class="{'rotate-180': userMenuOpen}" class="w-4 h-4 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <!-- Dropdown Menu -->
                            <div v-if="userMenuOpen" 
                                 class="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 transition-all">
                                <router-link to="/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary flex items-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    <span>Tableau de bord</span>
                                </router-link>
                                <router-link to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary flex items-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Mon profil</span>
                                </router-link>
                                <div class="border-t border-gray-100 my-1"></div>
                                <button @click="handleLogout" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// User dropdown menu state
const userMenuOpen = ref(false)
const toggleUserMenu = () => {
    userMenuOpen.value = !userMenuOpen.value
}
const closeUserMenu = () => {
    userMenuOpen.value = false
}

// Scroll detection for shadow effect
const scrolled = ref(false)
const handleScroll = () => {
    scrolled.value = window.scrollY > 10
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})

// User initials for avatar
const userInitials = computed(() => {
    if (!authStore.user) return 'U'
    const firstName = authStore.user.firstName || ''
    const lastName = authStore.user.lastName || ''
    return (firstName.charAt(0) + (lastName.charAt(0) || '')).toUpperCase()
})

const handleLogout = async () => {
    try {
        await authStore.logout()
        userMenuOpen.value = false
        router.push('/')
    } catch (error) {
        console.error('Erreur de déconnexion:', error)
    }
}

// Click outside directive
const vClickOutside = {
    mounted(el, binding) {
        el._clickOutside = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event)
            }
        }
        document.addEventListener('click', el._clickOutside)
    },
    unmounted(el) {
        document.removeEventListener('click', el._clickOutside)
    }
}
</script>