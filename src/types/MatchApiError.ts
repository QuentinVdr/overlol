/**
 * Custom error class for match API errors with HTTP status codes
 */
export class MatchApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'MatchApiError';
  }
}
