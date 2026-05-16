<script setup lang="ts">
import HeroSection from '../components/HeroSection/HeroSection.vue'
import FeatureGrid from '../components/FeatureGrid/FeatureGrid.vue'
</script>

<template>
  <div>
    <HeroSection
      eyebrow="// community-driven flashcards"
      title-top="FLASCHEN"
      title-bottom="KARTEN"
      subtitle="Generate decks with AI, study with answer checking, and discover what the community is learning."
      :buttons="[
        { label: 'Browse Decks',  variant: 'primary', to: '/decks'     },
        { label: 'Create a Deck', variant: 'ghost',   to: '/decks/new' },
      ]"
    />
    <FeatureGrid />
  </div>
</template>
