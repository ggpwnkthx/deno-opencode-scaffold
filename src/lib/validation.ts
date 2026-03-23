/**
 * Centralized validation helpers for untrusted CLI input.
 * @module
 */

import { ValidationError } from "../domain/errors.ts";

/**
 * Ensures a flag value is present and non-empty.
 */
export function requireNonEmpty(value: string, field: string): string {
  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    throw new ValidationError(`${field} must not be empty.`, { field });
  }
  return trimmedValue;
}

/**
 * Validates the application name used for the scaffold.
 */
export function validateAppName(appName: string): string {
  const normalizedAppName = requireNonEmpty(appName, "appName").toLowerCase();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedAppName)) {
    throw new ValidationError(
      "appName must use lowercase letters, digits, and hyphens only.",
      { appName: normalizedAppName },
    );
  }

  return normalizedAppName;
}

/**
 * Validates a target directory path string.
 */
export function validateTargetDir(targetDir: string): string {
  const normalizedTargetDir = requireNonEmpty(targetDir, "targetDir");

  if (normalizedTargetDir.includes("\0")) {
    throw new ValidationError("targetDir contains an invalid null byte.", {
      targetDir: normalizedTargetDir,
    });
  }

  return normalizedTargetDir;
}

/**
 * Validates a JSR scope string.
 */
export function validateScope(scope: string): string {
  const normalizedScope = requireNonEmpty(scope, "scope");

  if (!/^@[a-z0-9][a-z0-9-]*$/.test(normalizedScope)) {
    throw new ValidationError(
      "scope must look like @scope-name and use lowercase letters, digits, and hyphens.",
      { scope: normalizedScope },
    );
  }

  return normalizedScope;
}

/**
 * Validates a GitHub user or org name.
 */
export function validateGithubUser(githubUser: string): string {
  const normalizedGithubUser = requireNonEmpty(
    githubUser,
    "githubUser",
  );

  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37})$/.test(normalizedGithubUser)) {
    throw new ValidationError(
      "githubUser must be a plausible GitHub user or organization name.",
      { githubUser: normalizedGithubUser },
    );
  }

  return normalizedGithubUser;
}

/**
 * Validates a GitHub repository name.
 */
export function validateGithubRepo(githubRepo: string): string {
  const normalizedGithubRepo = requireNonEmpty(
    githubRepo,
    "githubRepo",
  );

  if (!/^[A-Za-z0-9._-]+$/.test(normalizedGithubRepo)) {
    throw new ValidationError(
      "githubRepo must only use letters, digits, dots, underscores, and hyphens.",
      { githubRepo: normalizedGithubRepo },
    );
  }

  return normalizedGithubRepo;
}

/**
 * Validates a CODEOWNERS handle.
 */
export function validateCodeOwner(codeOwner: string): string {
  const normalizedCodeOwner = requireNonEmpty(codeOwner, "codeOwner");

  if (!/^@[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?$/.test(normalizedCodeOwner)) {
    throw new ValidationError(
      "codeOwner must look like @user or @org/team.",
      { codeOwner: normalizedCodeOwner },
    );
  }

  return normalizedCodeOwner;
}

/**
 * Validates the security contact email.
 */
export function validateSecurityEmail(securityEmail: string): string {
  const normalizedSecurityEmail = requireNonEmpty(
    securityEmail,
    "securityEmail",
  );

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedSecurityEmail)) {
    throw new ValidationError(
      "securityEmail must be a valid email address.",
      { securityEmail: normalizedSecurityEmail },
    );
  }

  return normalizedSecurityEmail;
}
