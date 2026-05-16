export interface NavItem {
  label: string
  to: string
}

export interface NavSection {
  eyebrow: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    eyebrow: '// personal',
    items: [
      { label: 'My Decks',  to: '/my-decks'  },
      { label: 'Favorites', to: '/favorites' },
    ],
  },
  {
    eyebrow: '// explore',
    items: [
      { label: 'Browse Decks', to: '/decks' },
    ],
  },
  {
    eyebrow: '// build',
    items: [
      { label: 'Create Deck',   to: '/decks/new'      },
      { label: 'Generate Deck', to: '/decks/generate' },
    ],
  },
]
