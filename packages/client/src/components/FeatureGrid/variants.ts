export interface Feature {
  icon: string
  title: string
  description: string
}

export const features: Feature[] = [
  {
    icon: '⬡',
    title: 'Card Forge',
    description: 'Design and mint custom cards with full rule definitions and metadata.',
  },
  {
    icon: '◈',
    title: 'Deck Builder',
    description: 'Construct decks from your collection. Analyse synergies before you play.',
  },
  {
    icon: '▸',
    title: 'Live Play',
    description: 'Real-time multiplayer sessions with state synced to the server.',
  },
]
