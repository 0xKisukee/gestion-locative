<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

</script>

<template>
  <Navbar />
  <div class="min-h-screen bg-gray-50">
    <RouterView />
  </div>
  <Footer />
</template>
