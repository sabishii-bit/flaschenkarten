<script setup lang="ts">
import AppHeader from './components/AppHeader/AppHeader.vue'
import AppFooter from './components/AppFooter/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-cyber-bg scanlines">
    <AppHeader />
    <main class="mx-auto max-w-6xl px-6 py-20">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
