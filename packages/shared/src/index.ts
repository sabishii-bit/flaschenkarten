export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export * from './schemas/flashcard.js'
export * from './schemas/deck.js'
