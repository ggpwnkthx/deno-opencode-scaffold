/**
 * Typed error classes for the scaffolder CLI.
 * @module
 */

/**
 * Application error codes emitted by this CLI.
 */
export type AppErrorCode =
  | "INVALID_ARGUMENT"
  | "DIRECTORY_NOT_EMPTY"
  | "PATH_CONFLICT"
  | "WRITE_FAILED";

/**
 * Base typed error for predictable CLI failures.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly details: Record<string, string>;

  constructor(
    code: AppErrorCode,
    message: string,
    details: Record<string, string> = {},
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Error raised when user input fails validation.
 */
export class ValidationError extends AppError {
  constructor(message: string, details: Record<string, string> = {}) {
    super("INVALID_ARGUMENT", message, details);
    this.name = "ValidationError";
  }
}

/**
 * Error raised when the destination directory cannot be used safely.
 */
export class DirectoryConflictError extends AppError {
  constructor(message: string, details: Record<string, string> = {}) {
    super("DIRECTORY_NOT_EMPTY", message, details);
    this.name = "DirectoryConflictError";
  }
}

/**
 * Error raised when a write operation fails.
 */
export class WriteError extends AppError {
  constructor(message: string, details: Record<string, string> = {}) {
    super("WRITE_FAILED", message, details);
    this.name = "WriteError";
  }
}
