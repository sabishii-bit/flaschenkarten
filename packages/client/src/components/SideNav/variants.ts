export interface NavItem {
  label: string
  eyebrow: string
  to: string
}

export const navItems: NavItem[] = [
  { eyebrow: '// personal',  label: 'My Decks',     to: '/my-decks'  },
  { eyebrow: '// explore',   label: 'Browse Decks', to: '/decks'     },
  { eyebrow: '// build',     label: 'Create Deck',  to: '/decks/new' },
]
