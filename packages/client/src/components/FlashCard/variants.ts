export interface FlashCardProps {
  /** Disable the flip interaction */
  disabled?: boolean
  /** Card height variant */
  size?: 'default' | 'sm'
}

export const sizeClass: Record<NonNullable<FlashCardProps['size']>, string> = {
  default: 'min-h-80',
  sm:      'min-h-44',
}

export function playFlipSound(): void {
  const ctx = new AudioContext()
  const sampleRate = ctx.sampleRate

  // Layer 1: short paper-rustle (white noise, bandpass-filtered)
  const rustleFrames = Math.floor(sampleRate * 0.14)
  const rustleBuffer = ctx.createBuffer(1, rustleFrames, sampleRate)
  const rustleData = rustleBuffer.getChannelData(0)
  for (let i = 0; i < rustleFrames; i++) {
    const t = i / rustleFrames
    const envelope = Math.pow(1 - t, 3) * Math.exp(-t * 18)
    rustleData[i] = (Math.random() * 2 - 1) * envelope
  }

  const rustle = ctx.createBufferSource()
  rustle.buffer = rustleBuffer

  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 3800
  bandpass.Q.value = 0.6

  const rustleGain = ctx.createGain()
  rustleGain.gain.value = 0.28

  rustle.connect(bandpass)
  bandpass.connect(rustleGain)
  rustleGain.connect(ctx.destination)

  // Layer 2: soft thud at the end (low-frequency sine blip)
  const thudOsc = ctx.createOscillator()
  thudOsc.type = 'sine'
  thudOsc.frequency.setValueAtTime(120, ctx.currentTime + 0.1)
  thudOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.22)

  const thudGain = ctx.createGain()
  thudGain.gain.setValueAtTime(0, ctx.currentTime + 0.1)
  thudGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.12)
  thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)

  thudOsc.connect(thudGain)
  thudGain.connect(ctx.destination)

  rustle.start(ctx.currentTime)
  thudOsc.start(ctx.currentTime + 0.1)
  thudOsc.stop(ctx.currentTime + 0.23)
}
