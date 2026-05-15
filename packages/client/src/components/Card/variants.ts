export interface CardProps {
  glowOnHover?: boolean
}

export const cardBase =
  'relative rounded-lg border border-cyber-border bg-cyber-surface p-6 transition-all duration-300 group'

export const cardGlow =
  'hover:border-cyber-purple/60 hover:glow-purple cursor-pointer'
