/**
 * Filesystem helpers for safe scaffold generation.
 * @module
 */

import { DirectoryConflictError, WriteError } from "../domain/errors.ts";
import { dirname } from "./path.ts";

/**
 * Returns true when a path exists.
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error: unknown) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    throw error;
  }
}

/**
 * Ensures a parent directory exists.
 */
export async function ensureParentDirectory(filePath: string): Promise<void> {
  const parentDirectory = dirname(filePath);
  await Deno.mkdir(parentDirectory, { recursive: true });
}

/**
 * Returns true when a directory has no visible entries.
 */
export async function isDirectoryEmpty(path: string): Promise<boolean> {
  try {
    for await (const _entry of Deno.readDir(path)) {
      return false;
    }
    return true;
  } catch (error: unknown) {
    if (error instanceof Deno.errors.NotFound) {
      return true;
    }
    throw error;
  }
}

/**
 * Validates that the destination is safe to use.
 */
export async function ensureWritableTarget(
  targetDir: string,
  force: boolean,
): Promise<void> {
  if (targetDir === ".") {
    const empty = await isDirectoryEmpty(".");
    if (!empty && !force) {
      throw new DirectoryConflictError(
        "The current directory is not empty. Re-run with --force to allow writing into it.",
        { targetDir },
      );
    }
    return;
  }

  const exists = await pathExists(targetDir);
  if (!exists) {
    await Deno.mkdir(targetDir, { recursive: true });
    return;
  }

  const stat = await Deno.stat(targetDir);
  if (!stat.isDirectory) {
    throw new DirectoryConflictError(
      "The target path exists and is not a directory.",
      { targetDir },
    );
  }

  const empty = await isDirectoryEmpty(targetDir);
  if (!empty && !force) {
    throw new DirectoryConflictError(
      "The target directory is not empty. Re-run with --force to allow writing into it.",
      { targetDir },
    );
  }
}

/**
 * Writes a UTF-8 text file, creating parent directories first.
 */
export async function writeTextFile(
  filePath: string,
  content: string,
): Promise<void> {
  try {
    await ensureParentDirectory(filePath);
    await Deno.writeTextFile(filePath, content);
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "Unknown write error";
    throw new WriteError(`Failed to write ${filePath}: ${reason}`, {
      filePath,
    });
  }
}
