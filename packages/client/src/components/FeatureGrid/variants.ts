export interface Feature {
  icon: string
  title: string
  description: string
}

export const features: Feature[] = [
  {
    icon: '⬡',
    title: 'Build Decks',
    description: 'Create flashcard decks on any subject. Rich text, images, and custom fields supported.',
  },
  {
    icon: '◈',
    title: 'Spaced Repetition',
    description: 'Study with an algorithm that surfaces cards right before you forget them.',
  },
  {
    icon: '▸',
    title: 'Share & Discover',
    description: 'Publish your decks for others to study. Import decks built by the community.',
  },
]
