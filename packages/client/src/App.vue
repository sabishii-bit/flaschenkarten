<template>
  <div class="min-h-screen bg-cyber-bg scanlines">
    <AppHeader />
    <main class="mx-auto max-w-6xl px-6 py-20">
      <HeroSection
        eyebrow="// v0.1.0 initialising"
        title-top="FLASCHEN"
        title-bottom="KARTEN"
        subtitle="The card game. Digitised. Dangerous."
        :buttons="[
          { label: 'Start Game',   variant: 'primary' },
          { label: 'Browse Cards', variant: 'ghost'   },
        ]"
      />
      <FeatureGrid />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader   from './components/AppHeader/AppHeader.vue'
import AppFooter   from './components/AppFooter/AppFooter.vue'
import HeroSection from './components/HeroSection/HeroSection.vue'
import FeatureGrid from './components/FeatureGrid/FeatureGrid.vue'
</script>
