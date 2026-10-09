<script setup lang="ts">
import { RouterView } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
</script>

<template>
  <div class="app-shell">
    <main class="app-content"><RouterView /></main>
    <BottomNav />
  </div>
</template>
