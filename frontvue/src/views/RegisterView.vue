<template>
  <div class="container py-4">
    <header class="py-3 mb-4 border-bottom shadow-sm bg-white rounded-3">
      <div class="d-flex align-items-center justify-content-between">
        <router-link to="/" class="text-decoration-none d-flex align-items-center">
          <i class="bi bi-building me-2 text-primary icon-header"></i>
          <h1 class="h4 mb-0 fw-bold text-primary">Gestion Locative</h1>
        </router-link>
        <div>
          <router-link to="/login" class="btn btn-outline-primary action-btn">
            <i class="bi bi-box-arrow-in-right me-1"></i> Connexion
          </router-link>
        </div>
      </div>
    </header>

    <main>
      <div class="row justify-content-center my-4">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-sm border-0 rounded-3">
            <div class="card-header bg-white border-0 pt-4 text-center">
              <div class="rounded-circle bg-primary bg-opacity-10 mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                <i class="bi bi-person-plus-fill text-primary fs-1"></i>
              </div>
              <h2 class="fw-bold">Créer un compte</h2>
              <p class="text-muted">Rejoignez-nous pour gérer vos locations facilement</p>
            </div>
            
            <div class="card-body p-4 p-md-5 pt-md-3">
              <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
              <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
              
              <form @submit.prevent="handleSubmit" class="needs-validation" :class="{ 'was-validated': formValidated }">
                <div class="mb-3">
                  <label for="username" class="form-label">Nom d'utilisateur</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-person"></i></span>
                    <input 
                      type="text" 
                      class="form-control border-start-0" 
                      id="username" 
                      v-model="username"
                      placeholder="Votre nom d'utilisateur" 
                      required
                    >
                  </div>
                  <div class="invalid-feedback">Veuillez entrer un nom d'utilisateur.</div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope"></i></span>
                    <input 
                      type="email" 
                      class="form-control border-start-0" 
                      id="email" 
                      v-model="email"
                      placeholder="nom@exemple.com" 
                      required
                    >
                  </div>
                  <div class="invalid-feedback">Veuillez entrer un email valide.</div>
                </div>

                <div class="mb-3">
                  <label for="account-type" class="form-label">Type de compte</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-briefcase"></i></span>
                    <select 
                      class="form-select border-start-0" 
                      id="account-type" 
                      v-model="role"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      <option value="owner">Propriétaire</option>
                      <option value="tenant">Locataire</option>
                    </select>
                  </div>
                  <div class="invalid-feedback">Veuillez choisir un type de compte.</div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Mot de passe</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock"></i></span>
                    <input 
                      :type="showPassword ? 'text' : 'password'" 
                      class="form-control border-start-0" 
                      id="password" 
                      v-model="password"
                      required
                    >
                    <button 
                      class="btn btn-outline-secondary border-start-0" 
                      type="button" 
                      @click="togglePassword"
                    >
                      <i :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback">Veuillez entrer un mot de passe.</div>
                  <div class="form-text mt-2">
                    <small class="text-muted">Le mot de passe doit contenir au moins 8 caractères.</small>
                  </div>
                </div>

                <div class="mb-4">
                  <label for="confirm-password" class="form-label">Confirmer le mot de passe</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-shield-lock"></i></span>
                    <input 
                      :type="showPassword ? 'text' : 'password'" 
                      class="form-control border-start-0" 
                      id="confirm-password" 
                      v-model="confirmPassword"
                      required
                    >
                  </div>
                  <div class="invalid-feedback">Les mots de passe ne correspondent pas.</div>
                </div>

                <div class="mb-3 form-check">
                  <input 
                    type="checkbox" 
                    class="form-check-input" 
                    id="terms" 
                    v-model="termsAccepted"
                    required
                  >
                  <label class="form-check-label" for="terms">
                    J'accepte les <a href="#" class="text-primary">conditions d'utilisation</a> et la <a href="#" class="text-primary">politique de confidentialité</a>
                  </label>
                  <div class="invalid-feedback">Vous devez accepter les conditions pour continuer.</div>
                </div>

                <div class="d-grid gap-2 mt-4">
                  <button 
                    type="submit" 
                    class="btn btn-primary py-2 fw-semibold action-btn"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    <i v-else class="bi bi-check-circle me-2"></i>
                    Créer mon compte
                  </button>
                </div>
              </form>
              
              <div class="mt-4 text-center">
                <p class="mb-0 text-muted">Déjà un compte ? <router-link to="/login" class="text-primary fw-semibold">Se connecter</router-link></p>
              </div>
            </div>
          </div>
          
          <div class="card mt-4 border-0 bg-light">
            <div class="card-body p-4">
              <div class="d-flex">
                <div class="flex-shrink-0">
                  <i class="bi bi-shield-check text-success fs-3"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h5 class="fw-bold">Sécurité garantie</h5>
                  <p class="text-muted mb-0">Nous utilisons un chiffrement de pointe pour protéger vos données et assurer la confidentialité de vos informations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="mt-5 py-3 text-center border-top text-muted rounded-3 bg-white shadow-sm">
      <p class="mb-0">© 2025 Gestion Locative - Tous droits réservés</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const role = ref('')
const password = ref('')
const confirmPassword = ref('')
const termsAccepted = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const formValidated = ref(false)

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  formValidated.value = true
  
  if (!passwordsMatch.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    
    await authStore.register(username.value, email.value, role.value, password.value)
    successMessage.value = 'Compte créé avec succès! Redirection vers la page de connexion...'
    
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors de la création du compte. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.icon-header {
  font-size: 1.5rem;
}
</style> 