/**
 * Standardized, type-safe API response payloads with static factory methods.
 */
export class ApiResponse {
  static ok<T>(data: T, message?: string) {
    return ApiResponse.success(200, data, message);
  }

  static created<T>(data: T, message?: string) {
    return ApiResponse.success(201, data, message);
  }

  static badRequest(error = 'Bad Request', details?: unknown) {
    return ApiResponse.failure(400, error, details);
  }

  static unauthorized(error = 'Unauthorized', details?: unknown) {
    return ApiResponse.failure(401, error, details);
  }

  static forbidden(error = 'Forbidden', details?: unknown) {
    return ApiResponse.failure(403, error, details);
  }

  static notFound(error = 'Not Found', details?: unknown) {
    return ApiResponse.failure(404, error, details);
  }

  static conflict(error = 'Conflict', details?: unknown) {
    return ApiResponse.failure(409, error, details);
  }

  static unprocessable(error = 'Unprocessable Entity', details?: unknown) {
    return ApiResponse.failure(422, error, details);
  }

  static internal(error = 'Internal Server Error', details?: unknown) {
    return ApiResponse.failure(500, error, details);
  }

  static success<T>(statusCode: number, data: T, message?: string) {
    return {
      success: true as const,
      statusCode,
      data,
      ...(message !== undefined ? { message } : {})
    };
  }

  static failure(statusCode: number, error: string, details?: unknown) {
    return {
      success: false as const,
      statusCode,
      error,
      ...(details !== undefined ? { details } : {})
    };
  }
}

/**
 * Throw from any handler to produce a structured HTTP error response via the
 * global error handler.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    if (details !== undefined) {
      this.details = details;
    }
  }
}
