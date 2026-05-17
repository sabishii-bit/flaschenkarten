<script setup lang="ts">
import { useAdminAuth } from '../../composables/useAdminAuth.ts'
import Button from '../Button/Button.vue'

const { clearToken } = useAdminAuth()

const tools = [
  { label: 'Server Logs', description: 'View activity and event logs', to: '/admin/logs' },
]
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex items-center justify-between">
      <div>
        <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">// admin</p>
        <h2 class="font-orbitron text-3xl font-bold text-cyber-white">Control Panel</h2>
      </div>
      <Button variant="danger" @click="clearToken">Log Out</Button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="tool in tools"
        :key="tool.to"
        :to="tool.to"
        class="flex flex-col gap-2 p-4 border border-cyber-border rounded-sm hover:border-cyber-purple/60 hover:bg-cyber-surface/50 transition-all duration-200"
      >
        <span class="font-orbitron text-sm font-bold text-cyber-white">{{ tool.label }}</span>
        <span class="font-mono-cyber text-xs text-cyber-muted">{{ tool.description }}</span>
      </RouterLink>
    </div>
  </div>
</template>
