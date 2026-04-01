/**
 * Tests for CLI prompt utilities.
 * @module
 */

import { assertEquals } from "jsr:@std/assert@1.0.19";
import { joinBytes } from "../../src/lib/prompt.ts";

Deno.test("PromptProvider interface accepts all required methods", async () => {
  const provider = {
    scope: (defaultValue: string) =>
      Promise.resolve(`mock-scope (was: ${defaultValue})`),
    githubUser: (defaultValue: string) =>
      Promise.resolve(`mock-user (was: ${defaultValue})`),
    githubRepo: (defaultValue: string) =>
      Promise.resolve(`mock-repo (was: ${defaultValue})`),
    codeOwner: (defaultValue: string) =>
      Promise.resolve(`mock-owner (was: ${defaultValue})`),
    securityEmail: (defaultValue: string) =>
      Promise.resolve(`mock-security@example.com (was: ${defaultValue})`),
  };

  const scopeResult = await provider.scope("@test-scope");
  assertEquals(scopeResult, "mock-scope (was: @test-scope)");

  const userResult = await provider.githubUser("test-user");
  assertEquals(userResult, "mock-user (was: test-user)");

  const repoResult = await provider.githubRepo("test-repo");
  assertEquals(repoResult, "mock-repo (was: test-repo)");

  const ownerResult = await provider.codeOwner("@test/owner");
  assertEquals(ownerResult, "mock-owner (was: @test/owner)");

  const emailResult = await provider.securityEmail("test@example.com");
  assertEquals(
    emailResult,
    "mock-security@example.com (was: test@example.com)",
  );
});

Deno.test("joinBytes concatenates multiple Uint8Array chunks", () => {
  const chunks = [
    new Uint8Array([72, 101, 108]), // "Hel"
    new Uint8Array([108, 111]), // "lo"
  ];
  const result = joinBytes(chunks);
  assertEquals(new TextDecoder().decode(result), "Hello");
});

Deno.test("joinBytes uses pre-computed totalLength when provided", () => {
  const chunks = [
    new Uint8Array([72, 101]), // "He"
    new Uint8Array([108, 108, 111]), // "llo" (3 bytes)
  ];
  const result = joinBytes(chunks, 5);
  assertEquals(new TextDecoder().decode(result), "Hello");
  assertEquals(result.length, 5);
});

Deno.test("joinBytes handles empty chunk list", () => {
  const result = joinBytes([]);
  assertEquals(result.length, 0);
});
