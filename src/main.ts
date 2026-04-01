/**
 * CLI entry point for the scaffolder.
 * @module
 */

import { AppError, ValidationError } from "./domain/errors.ts";
import {
  createInteractivePromptProvider,
  HELP_TEXT,
  isHelpCommand,
  parseInitArgs,
} from "./lib/args.ts";
import { isInteractive } from "./lib/prompt.ts";
import { initializeApp } from "./scaffold/generate.ts";

function formatSummary(result: Awaited<ReturnType<typeof initializeApp>>): string {
  const modeLabel = result.dryRun ? "Dry run complete" : "Scaffold complete";
  const preview = result.files.slice(0, 8).map((filePath) => `  - ${filePath}`);
  const remainingCount = Math.max(result.files.length - preview.length, 0);

  return [
    `${modeLabel}: ${result.targetDir}`,
    `Files: ${result.files.length}`,
    ...preview,
    remainingCount > 0 ? `  - ... and ${remainingCount} more` : undefined,
  ].filter((line): line is string => typeof line === "string").join("\n");
}

async function run(argv: readonly string[]): Promise<number> {
  if (isHelpCommand(argv)) {
    console.log(HELP_TEXT);
    return 0;
  }

  const [command, ...rest] = argv;

  if (command !== "init") {
    throw new ValidationError(`Unknown command: ${command}\n\n${HELP_TEXT}`);
  }

  const promptProvider = isInteractive()
    ? createInteractivePromptProvider()
    : undefined;
  const options = await parseInitArgs(rest, promptProvider);
  const result = await initializeApp(options);

  console.log(formatSummary(result));
  if (!result.dryRun) {
    console.log("\nNext steps:");
    console.log(`  cd ${result.targetDir}`);
    console.log("  deno task fmt");
    console.log("  deno task test");
  }

  return 0;
}

if (import.meta.main) {
  try {
    const exitCode = await run(Deno.args);
    Deno.exit(exitCode);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      console.error(error.message);
      if (error.details && Object.keys(error.details).length > 0) {
        console.error(JSON.stringify(error.details, null, 2));
      }
      Deno.exit(1);
    }

    if (error instanceof Error) {
      console.error(error.message);
      Deno.exit(1);
    }

    console.error("Unknown error");
    Deno.exit(1);
  }
}
