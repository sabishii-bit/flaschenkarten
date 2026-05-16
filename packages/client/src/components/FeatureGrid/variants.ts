export interface Feature {
  icon: string
  title: string
  description: string
}

export const features: Feature[] = [
  {
    icon: '◈',
    title: 'AI Generation',
    description: 'Describe any topic and Claude generates a complete deck — title, cards, hashtags, and answer mode — in seconds.',
  },
  {
    icon: '▸',
    title: 'Study Mode',
    description: 'Flip through cards or enable answer mode to type responses. Tracks your score and time, with accent-tolerant answer matching.',
  },
  {
    icon: '⬡',
    title: 'Browse & Discover',
    description: 'Explore community decks ranked by likes and favorites. Search by title or hashtag, and save the ones you love.',
  },
]
