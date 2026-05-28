export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string; // ← tambahan

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    errorCode = "INTERNAL_ERROR", // ← tambahan
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

// Contoh penggunaan di NotFoundError:
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, true, "NOT_FOUND");
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400, true, "BAD_REQUEST");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, true, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, true, "FORBIDDEN");
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = "Token has expired") {
    super(message, 401, true, "TOKEN_EXPIRED");
  }
}
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, message = "Validation failed") {
    super(message, 422, true, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class FileTooLargeError extends AppError {
  constructor(maxSizeMB = 5) {
    super(
      `File size exceeds ${maxSizeMB}MB limit`,
      413,
      true,
      "FILE_TOO_LARGE",
    );
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409, true, "CONFLICT");
  }
}

export class GoneError extends AppError {
  constructor(message = "Resource no longer available") {
    super(message, 410, true, "GONE");
  }
}
export class RateLimitError extends AppError {
  public readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds = 60) {
    super(
      `Too many requests. Retry after ${retryAfterSeconds}s`,
      429,
      true,
      "RATE_LIMIT_EXCEEDED",
    );
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(
      message,
      503,
      false, // isOperational=false → wajib di-log + alert
      "DATABASE_ERROR",
    );
  }
}

export class ExternalServiceError extends AppError {
  public readonly serviceName: string;

  constructor(serviceName: string, message?: string) {
    super(
      message ?? `${serviceName} service unavailable`,
      502,
      false,
      "EXTERNAL_SERVICE_ERROR",
    );
    this.serviceName = serviceName;
  }
}
