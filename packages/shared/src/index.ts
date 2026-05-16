export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export * from './schemas/flashcard.js'
export * from './schemas/deck.js'

export type VoteType = 'like' | 'dislike'

export interface VoteSummary {
  likes:    number
  dislikes: number
  myVote:   VoteType | null
}
