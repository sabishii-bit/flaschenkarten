export interface CardEditorCard {
  front: string
  back: string
  acceptedAnswers: string[]
}

export interface CardEditorProps {
  card: CardEditorCard
  index: number
  isActive: boolean
  requiresAnswer: boolean
}

export const cardEditorBase =
  'relative flex gap-3 p-4 rounded-xl border bg-cyber-surface ' +
  'cursor-pointer transition-all duration-200 border-cyber-border hover:border-cyber-purple/40'

export const cardEditorActive =
  'border-cyber-purple ring-1 ring-cyber-purple glow-purple'
