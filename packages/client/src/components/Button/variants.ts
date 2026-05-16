export type ButtonVariant = 'primary' | 'ghost' | 'danger'

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: [
    'bg-cyber-purple text-white border border-cyber-purple',
    'hover:bg-cyber-purple-lt hover:glow-purple',
    'focus-visible:glow-purple-lg',
    'active:scale-95',
  ].join(' '),

  ghost: [
    'bg-transparent text-cyber-purple-lt border border-cyber-border',
    'hover:border-cyber-purple/60 hover:bg-cyber-purple/10 hover:glow-purple',
    'focus-visible:glow-purple-lg',
    'active:scale-95',
  ].join(' '),

  danger: [
    'bg-transparent text-red-400 border border-red-400/30',
    'hover:border-red-400/70 hover:bg-red-400/10',
    'focus-visible:ring-1 focus-visible:ring-red-400',
    'active:scale-95',
  ].join(' '),
}
