import { ref } from 'vue'

const isOpen = ref(false)

export function useSideNav() {
  function open()   { isOpen.value = true  }
  function close()  { isOpen.value = false }
  function toggle() { isOpen.value = !isOpen.value }
  return { isOpen, open, close, toggle }
}
