<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <!-- Hero Section -->
  <section class="overflow-hidden text-black py-30">
    <div class="container mx-auto px-4  z-10">
      <div class="flex items-center justify-between">
        <div class="max-w-2xl">
          <h1 class="text-5xl font-bold mb-6 leading-tight">
            Simplifiez la gestion de vos biens immobiliers
          </h1>
          <p class="text-xl mb-8 text-black/90">
            Une solution complète pour gérer vos propriétés, locataires et paiements en toute simplicité. Gagnez du
            temps et réduisez votre stress.
          </p>

          <div class="flex gap-4">

            <template v-if="!authStore.isAuthenticated">
              <router-link to="/register"
                class="px-8 py-4 bg-white font-medium rounded-xl duration-300 shadow-lg shadow-black/10 hover:bg-gray-100 hover:shadow-xl items-center">
                Commencer gratuitement
              </router-link>
              <router-link to="/login"
                class="px-8 py-4 bg-white font-medium rounded-xl duration-300 shadow-lg shadow-black/10 hover:bg-gray-100 hover:shadow-xl items-center">
                Se connecter
              </router-link>
            </template>

            <template v-else>
              <router-link to="/dashboard"
                class="px-8 py-4 bg-white font-medium rounded-xl duration-300 shadow-lg shadow-black/10 hover:bg-gray-100 hover:shadow-xl items-center">
                Mon tableau de bord
              </router-link>
            </template>

          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Statistiques -->
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div class="text-center">
          <div class="text-4xl font-bold text-primary mb-2">+5000</div>
          <div class="text-gray-600">Utilisateurs actifs</div>
        </div>
        <div class="text-center">
          <div class="text-4xl font-bold text-primary mb-2">98%</div>
          <div class="text-gray-600">Taux de satisfaction</div>
        </div>
        <div class="text-center">
          <div class="text-4xl font-bold text-primary mb-2">25 000</div>
          <div class="text-gray-600">Biens gérés</div>
        </div>
        <div class="text-center">
          <div class="text-4xl font-bold text-primary mb-2">24/7</div>
          <div class="text-gray-600">Support client</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Fonctionnalités -->
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <h2 class="text-3xl font-bold mb-4">Toutes les fonctionnalités dont vous avez besoin</h2>
        <p class="text-gray-600 text-lg">Notre plateforme regroupe tous les outils nécessaires pour une gestion locative
          efficace</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-100 translate-y-0 transition-all duration-700 ease-out">
        <!-- Carte 1 -->
        <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3">Gestion des biens</h3>
          <p class="text-gray-600 mb-4">Suivez toutes vos propriétés en un seul endroit. Détails techniques, documents,
            historique des interventions.</p>
          <ul class="space-y-2">
            <li class="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              Fiches détaillées
            </li>
            <li class="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              Centralisation des documents
            </li>
            <li class="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              Suivi des interventions
            </li>
          </ul>
        </div>

        <!-- Carte 2 -->
        <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3">Gestion des locataires</h3>
          <p class="text-gray-600 mb-4">Gardez toutes les informations sur vos locataires à portée de main et suivez les
            communications.</p>
          <ul class="space-y-2">
            <li class="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              Dossiers complets
            </li>
            <li class="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              Historique des communications
            </li>
            <li class="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              Alertes automatiques
            </li>
          </ul>
        </div>

        <!-- Carte 3 -->
        <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3">Gestion financière</h3>
          <p class="text-gray-600 mb-4">Suivez tous vos revenus et dépenses avec des tableaux de bord clairs et des
            rapports détaillés.</p>
          <ul class="space-y-2">
            <li class="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              Suivi des loyers
            </li>
            <li class="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              Gestion des charges
            </li>
            <li class="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              Rapports de rentabilité
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-16 bg-primary/5">
    <div class="container mx-auto px-4">
      <div class="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
        <div class="flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="max-w-xl">
            <h2 class="text-2xl md:text-3xl font-bold mb-4">Prêt à simplifier la gestion de vos biens ?</h2>
            <p class="text-gray-600 mb-6">Commencez dès aujourd'hui et découvrez pourquoi plus de 5 000 propriétaires nous font confiance.</p>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Essai gratuit de 30 jours
              </li>
              <li class="flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Annulation à tout moment
              </li>
              <li class="flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Configuration guidée offerte
              </li>
            </ul>
          </div>
          <div class="space-y-5">
            <template v-if="!authStore.isAuthenticated">
              <router-link to="/register"
                class="md:w-auto block text-center px-8 py-4 text-black font-medium rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                </svg>
                Créer un compte gratuit
              </router-link>
              <router-link to="/login"
                class="md:w-auto block text-center px-8 py-4 text-black font-medium rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                </svg>
                Se connecter
              </router-link>
            </template>
            <template v-else>
              <router-link to="/dashboard"
                class="md:w-auto block text-center px-8 py-4 text-black font-medium rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
                </svg>
                Mon tableau de bord
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
