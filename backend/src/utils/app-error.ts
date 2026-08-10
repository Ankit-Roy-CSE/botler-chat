import { HTTPSTATUS, HttpStatusCodeType } from "../config/http.config";

/**
 * Readonly map of standardized application-level error code identifiers.
 * Used to classify error types consistently across client-server communications.
 */
export const ErrorCodes = {
    ERR_INTERNAL: "ERR_INTERNAL",
    ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
    ERR_UNAUTHORIZED: "ERR_UNAUTHORIZED",
    ERR_FORBIDDEN: "ERR_FORBIDDEN",
    ERR_NOT_FOUND: "ERR_NOT_FOUND",
} as const;

/**
 * Union type derived from the values of `ErrorCodes`.
 */
export type ErrorCodeType = keyof typeof ErrorCodes;

/**
 * Custom base error class for operational/application-level exceptions.
 * Extends the native JavaScript `Error` class to include HTTP status codes and custom error identifiers.
 */
export class AppError extends Error {
    /**
     * Constructs a new AppError instance.
     *
     * @param message - Human-readable error description.
     * @param statusCode - Associated HTTP status code (defaults to 500 Internal Server Error).
     * @param errorCode - Application-specific error identifier (defaults to ERR_INTERNAL).
     */
    constructor(
        message: string,
        public statusCode: HttpStatusCodeType = HTTPSTATUS.INTERNAL_SERVER_ERROR,
        public errorCode: ErrorCodeType = ErrorCodes.ERR_INTERNAL
    ) {
        super(message);
        // Preserves cleaner stack traces by excluding the constructor call from the trace
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Exception thrown when an unexpected 500 Internal Server Error occurs.
 */
export class InternalServerException extends AppError {
    constructor(message: string = "Internal Server Error") {
        super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR, ErrorCodes.ERR_INTERNAL);
    }
}

/**
 * Exception thrown when a requested resource cannot be found (404 Not Found).
 */
export class NotFoundException extends AppError {
    constructor(message = "Resource Not Found") {
        super(message, HTTPSTATUS.NOT_FOUND, ErrorCodes.ERR_NOT_FOUND);
    }
}

/**
 * Exception thrown when incoming request payloads/parameters are invalid (400 Bad Request).
 */
export class BadRequestException extends AppError {
    constructor(message = "Bad Request") {
        super(message, HTTPSTATUS.BAD_REQUEST, ErrorCodes.ERR_BAD_REQUEST);
    }
}

/**
 * Exception thrown when authentication credentials are missing or invalid (401 Unauthorized).
 */
export class UnauthorizedException extends AppError {
    constructor(message = "Unauthorized Access") {
        super(message, HTTPSTATUS.UNAUTHORIZED, ErrorCodes.ERR_UNAUTHORIZED);
    }
}