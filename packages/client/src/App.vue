<script setup lang="ts">
import AppHeader from './components/AppHeader/AppHeader.vue'
import AppFooter from './components/AppFooter/AppFooter.vue'
import SideNav from './components/SideNav/SideNav.vue'
</script>

<template>
  <div class="min-h-screen w-full overflow-x-hidden bg-cyber-bg scanlines">
    <AppHeader />
    <SideNav />
    <main class="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-20">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
