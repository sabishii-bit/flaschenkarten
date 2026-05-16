<script setup lang="ts">
import HeroSection from '../components/HeroSection/HeroSection.vue'
import FeatureGrid from '../components/FeatureGrid/FeatureGrid.vue'
</script>

<template>
  <div>
    <HeroSection
      eyebrow="// your second brain"
      title-top="FLASCHEN"
      title-bottom="KARTEN"
      subtitle="Build decks. Study smarter. Share knowledge."
      :buttons="[
        { label: 'Browse Decks',  variant: 'primary', to: '/decks'     },
        { label: 'Create a Deck', variant: 'ghost',   to: '/decks/new' },
      ]"
    />
    <FeatureGrid />
  </div>
</template>
