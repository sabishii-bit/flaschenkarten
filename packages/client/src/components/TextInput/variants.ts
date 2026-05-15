export interface InputProps {
  modelValue: string
  placeholder?: string
  label?: string
}

export const inputBase =
  'w-full bg-cyber-surface border border-cyber-border rounded-lg px-4 py-2.5 ' +
  'font-mono-cyber text-sm text-cyber-white placeholder:text-cyber-muted ' +
  'outline-none transition-all duration-200 ' +
  'focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple focus:glow-purple'
