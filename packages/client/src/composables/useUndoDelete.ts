import { shallowRef, computed } from 'vue'

export function useUndoDelete<T>() {
  const stack = shallowRef<{ item: T; index: number }[]>([])

  const hasDeleted = computed(() => stack.value.length > 0)
  const deleteCount = computed(() => stack.value.length)

  function record(item: T, index: number) {
    stack.value = [...stack.value, { item, index }]
  }

  function undo(): { item: T; index: number } | null {
    if (stack.value.length === 0) return null
    const entry = stack.value[stack.value.length - 1]
    stack.value = stack.value.slice(0, -1)
    return entry
  }

  function clear() {
    stack.value = []
  }

  return { hasDeleted, deleteCount, record, undo, clear }
}
