/**
 * Standardized, type-safe API response payloads with static factory methods.
 */
export class ApiResponse {
  /**
   * Ensures that error handler produces consistent error codes
   * based on the `statusCode` parameter
   */
  static getErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 405:
        return 'METHOD_NOT_ALLOWED';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'UNPROCESSABLE_ENTITY';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }

  static ok<T>(data: T, requestId: string) {
    return ApiResponse.success(200, data, requestId);
  }

  static created<T>(data: T, requestId: string) {
    return ApiResponse.success(201, data, requestId);
  }

  static badRequest(
    requestId: string,
    message = 'Bad Request',
    details?: unknown
  ) {
    return ApiResponse.failure(400, 'BAD_REQUEST', message, requestId, details);
  }

  static unauthorized(
    requestId: string,
    message = 'Unauthorized',
    details?: unknown
  ) {
    return ApiResponse.failure(
      401,
      'UNAUTHORIZED',
      message,
      requestId,
      details
    );
  }

  static forbidden(
    requestId: string,
    message = 'Forbidden',
    details?: unknown
  ) {
    return ApiResponse.failure(403, 'FORBIDDEN', message, requestId, details);
  }

  static notFound(requestId: string, message = 'Not Found', details?: unknown) {
    return ApiResponse.failure(404, 'NOT_FOUND', message, requestId, details);
  }

  static notAllowed(
    requestId: string,
    message = 'Not Allowed',
    details?: unknown
  ) {
    return ApiResponse.failure(
      405,
      'METHOD_NOT_ALLOWED',
      message,
      requestId,
      details
    );
  }

  static conflict(requestId: string, message = 'Conflict', details?: unknown) {
    return ApiResponse.failure(409, 'CONFLICT', message, requestId, details);
  }

  static unprocessable(
    requestId: string,
    message = 'Unprocessable Entity',
    details?: unknown
  ) {
    return ApiResponse.failure(
      422,
      'UNPROCESSABLE_ENTITY',
      message,
      requestId,
      details
    );
  }

  static internal(
    requestId: string,
    message = 'Internal Server Error',
    details?: unknown
  ) {
    return ApiResponse.failure(
      500,
      'INTERNAL_SERVER_ERROR',
      message,
      requestId,
      details
    );
  }

  static success<T, Status extends number>(
    statusCode: Status,
    data: T,
    requestId: string
  ) {
    return {
      statusCode,
      body: {
        data,
        meta: {
          requestId
        }
      }
    };
  }

  static failure<Status extends number>(
    statusCode: Status,
    code: string,
    message: string,
    requestId: string,
    details?: unknown
  ) {
    return {
      statusCode,
      body: {
        error: {
          code,
          message,
          ...(details !== undefined ? { details } : {})
        },
        meta: {
          requestId
        }
      }
    };
  }
}

/**
 * Throw from any handler to produce a structured HTTP error response via the
 * global error handler.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    details?: unknown,
    code = ApiResponse.getErrorCode(statusCode)
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;

    if (details !== undefined) {
      this.details = details;
    }
  }
}
