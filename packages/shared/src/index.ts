// Shared types and utilities between client and server

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
