/**
 * Small path helpers that avoid extra dependencies while remaining
 * portable across common Deno targets.
 * @module
 */

/**
 * Normalizes a relative path to forward slashes.
 */
export function normalizeRelativePath(path: string): string {
  return path.replaceAll("\\", "/").replace(/^\.\/+/, "").replace(/^\/+/, "");
}

/**
 * Joins a base path with a relative path.
 */
export function joinFsPath(basePath: string, relativePath: string): string {
  const normalizedRelativePath = normalizeRelativePath(relativePath);
  if (normalizedRelativePath.length === 0) {
    return basePath;
  }

  if (basePath.endsWith("/") || basePath.endsWith("\\")) {
    return `${basePath}${normalizedRelativePath}`;
  }

  return `${basePath}/${normalizedRelativePath}`;
}

/**
 * Returns the parent directory portion of a path.
 */
export function dirname(path: string): string {
  const slashIndex = path.lastIndexOf("/");
  const backslashIndex = path.lastIndexOf("\\");
  const lastSeparatorIndex = Math.max(slashIndex, backslashIndex);

  if (lastSeparatorIndex <= 0) {
    return ".";
  }

  return path.slice(0, lastSeparatorIndex);
}
