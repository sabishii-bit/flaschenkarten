export interface NavLink {
  label: string
  to: string
}

export const navLinks: NavLink[] = [
  { label: 'Decks',  to: '/decks'     },
  { label: 'Create', to: '/decks/new' },
]
