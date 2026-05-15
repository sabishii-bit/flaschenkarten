export type ButtonVariant = 'primary' | 'ghost'

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
}
