export interface HeroButton {
  label: string
  variant: 'primary' | 'ghost'
}

export interface HeroSectionProps {
  eyebrow: string
  titleTop: string
  titleBottom: string
  subtitle: string
  buttons: HeroButton[]
}
