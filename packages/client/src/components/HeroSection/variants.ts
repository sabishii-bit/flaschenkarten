export interface HeroButton {
  label: string
  variant: 'primary' | 'ghost'
  to: string
}

export interface HeroSectionProps {
  eyebrow: string
  titleTop: string
  titleBottom: string
  subtitle: string
  buttons: HeroButton[]
}
