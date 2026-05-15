export interface TextAreaProps {
  modelValue: string
  placeholder?: string
  label?: string
  rows?: number
}

export const textAreaBase =
  'w-full bg-cyber-surface border border-cyber-border rounded-lg px-4 py-2.5 ' +
  'font-mono-cyber text-sm text-cyber-white placeholder:text-cyber-muted ' +
  'outline-none transition-all duration-200 resize-none ' +
  'focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple focus:glow-purple'
