<script setup lang="ts">
import { ref } from 'vue'
import { useAdminAuth } from '../composables/useAdminAuth.ts'
import { useApi } from '../composables/useApi.ts'
import TextInput from '../components/TextInput/TextInput.vue'
import Button from '../components/Button/Button.vue'

const { isAuthenticated, setToken } = useAdminAuth()
const { post } = useApi()

const password = ref('')
const loading  = ref(false)
const error    = ref<string | null>(null)
const success  = ref(false)

async function login() {
  if (!password.value || loading.value) return
  loading.value = true
  error.value   = null
  success.value = false
  try {
    const { token } = await post<{ token: string }>('/api/admin/login', {
      password: password.value,
    })
    setToken(token)
    success.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    loading.value  = false
    password.value = ''
  }
}
</script>

<template>
  <div class="animate-slide-up max-w-sm mx-auto mt-24 flex flex-col gap-6">
    <div>
      <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">// admin</p>
      <h2 class="font-orbitron text-2xl font-bold text-cyber-white">
        {{ isAuthenticated ? 'Access Granted' : success ? 'Access Granted' : 'Access Required' }}
      </h2>
    </div>

    <template v-if="isAuthenticated || success">
      <p class="font-mono-cyber text-sm text-green-400">// use the menu to navigate.</p>
    </template>

    <form v-else class="flex flex-col gap-4" @submit.prevent="login">
      <TextInput
        v-model="password"
        label="Password"
        placeholder="Enter admin password"
        type="password"
      />
      <p v-if="error" class="font-mono-cyber text-xs text-red-400">{{ error }}</p>
      <Button variant="primary" type="submit" :disabled="!password || loading">
        {{ loading ? 'Verifying…' : 'Enter' }}
      </Button>
    </form>
  </div>
</template>
