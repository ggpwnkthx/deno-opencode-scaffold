/**
 * Interactive prompt utilities for CLI user input.
 * @module
 */

import { ValidationError } from "../domain/errors.ts";

export function isInteractive(): boolean {
  return Deno.stdin.isTerminal();
}

const MAX_LINE_LENGTH = 4096;

interface ReadLineResult {
  readonly value: string;
  readonly truncated: boolean;
}

export function joinBytes(chunks: Uint8Array[], totalLength?: number): Uint8Array {
  const total = totalLength ?? chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

async function readLine(): Promise<ReadLineResult> {
  const chunks: Uint8Array[] = [];
  const buf = new Uint8Array(256);
  let accumulatedLength = 0;

  while (true) {
    const n = await Deno.stdin.read(buf);
    if (n === null) {
      break;
    }
    const chunk = buf.subarray(0, n);
    const newlineIndex = chunk.indexOf(10);
    if (newlineIndex !== -1) {
      chunks.push(chunk.subarray(0, newlineIndex));
      const currentChunkPrefixLen = newlineIndex;
      return {
        value: new TextDecoder().decode(
          joinBytes(chunks, accumulatedLength + currentChunkPrefixLen),
        ).trim(),
        truncated: false,
      };
    }
    chunks.push(chunk);
    accumulatedLength += chunk.length;
    if (accumulatedLength >= MAX_LINE_LENGTH) {
      return {
        value: new TextDecoder().decode(joinBytes(chunks, accumulatedLength))
          .trim(),
        truncated: true,
      };
    }
  }

  if (chunks.length === 0) {
    return { value: "", truncated: false };
  }
  return {
    value: new TextDecoder().decode(joinBytes(chunks, accumulatedLength))
      .trim(),
    truncated: false,
  };
}

export async function prompt(
  question: string,
  defaultValue?: string,
): Promise<string> {
  const defaultHint = defaultValue ? ` [${defaultValue}]` : "";
  const fullQuestion = `${question}${defaultHint}: `;

  await Deno.stdout.write(new TextEncoder().encode(fullQuestion));

  const result = await readLine();
  if (result.truncated) {
    await Deno.stdout.write(
      new TextEncoder().encode(
        `[Input truncated at ${MAX_LINE_LENGTH} characters.]\n`,
      ),
    );
  }
  const input = result.value;
  if (input.length === 0 && defaultValue !== undefined) {
    return defaultValue;
  }
  return input;
}

export async function promptWithValidation(
  question: string,
  validate: (value: string) => string,
  defaultValue?: string,
): Promise<string> {
  while (true) {
    const defaultHint = defaultValue ? ` [${defaultValue}]` : "";
    const fullQuestion = `${question}${defaultHint}: `;

    await Deno.stdout.write(new TextEncoder().encode(fullQuestion));

    const result = await readLine();
    if (result.truncated) {
      await Deno.stdout.write(
        new TextEncoder().encode(
          `[Input truncated at ${MAX_LINE_LENGTH} characters.]\n`,
        ),
      );
    }
    const value = result.value.length === 0 && defaultValue !== undefined
      ? defaultValue
      : result.value;

    try {
      return validate(value);
    } catch (error) {
      if (error instanceof ValidationError) {
        await Deno.stdout.write(
          new TextEncoder().encode(`Error: ${error.message}\n`),
        );
      } else {
        throw error;
      }
    }
  }
}
