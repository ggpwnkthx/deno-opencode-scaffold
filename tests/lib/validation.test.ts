import { assertEquals, assertThrows } from "jsr:@std/assert@1.0.19";
import {
  validateAppName,
  validateCodeOwner,
  validateGithubRepo,
  validateGithubUser,
  validateScope,
  validateSecurityEmail,
  validateTargetDir,
} from "../../src/lib/validation.ts";
import { ValidationError } from "../../src/domain/errors.ts";

Deno.test("validateAppName accepts valid lowercase hyphenated names", () => {
  assertEquals(validateAppName("my-app"), "my-app");
  assertEquals(validateAppName("app123"), "app123");
  assertEquals(validateAppName("a"), "a");
});

Deno.test("validateAppName normalizes underscores to hyphens", () => {
  assertEquals(validateAppName("my_app"), "my-app");
  assertEquals(validateAppName("app_name_v2"), "app-name-v2");
});

Deno.test("validateAppName rejects invalid names", () => {
  assertThrows(
    () => validateAppName("app!name"),
    ValidationError,
    "appName must use lowercase letters",
  );
  assertThrows(
    () => validateAppName("app name"),
    ValidationError,
    "appName must use lowercase letters",
  );
  assertThrows(
    () => validateAppName(""),
    ValidationError,
    "appName must not be empty",
  );
  assertThrows(
    () => validateAppName("   "),
    ValidationError,
    "appName must not be empty",
  );
  assertThrows(
    () => validateAppName(""),
    ValidationError,
    "appName must not be empty",
  );
});

Deno.test("validateTargetDir accepts valid paths", () => {
  assertEquals(validateTargetDir("./my-app"), "./my-app");
  assertEquals(validateTargetDir("/absolute/path"), "/absolute/path");
  assertEquals(validateTargetDir("relative/path"), "relative/path");
});

Deno.test("validateTargetDir rejects null bytes", () => {
  assertThrows(
    () => validateTargetDir("/path\0/to/file"),
    ValidationError,
    "null byte",
  );
});

Deno.test("validateTargetDir rejects empty strings", () => {
  assertThrows(
    () => validateTargetDir(""),
    ValidationError,
    "targetDir must not be empty",
  );
  assertThrows(
    () => validateTargetDir("   "),
    ValidationError,
    "targetDir must not be empty",
  );
});

Deno.test("validateScope accepts valid scopes", () => {
  assertEquals(validateScope("@acme"), "@acme");
  assertEquals(validateScope("@my-org"), "@my-org");
  assertEquals(validateScope("@a1-b2"), "@a1-b2");
});

Deno.test("validateScope rejects invalid scopes", () => {
  assertThrows(
    () => validateScope("acme"),
    ValidationError,
    "scope must look like @scope-name",
  );
  assertThrows(
    () => validateScope("@"),
    ValidationError,
    "scope must look like @scope-name",
  );
  assertThrows(
    () => validateScope("@Acme"),
    ValidationError,
    "scope must look like @scope-name",
  );
  assertThrows(
    () => validateScope(""),
    ValidationError,
    "scope must not be empty",
  );
});

Deno.test("validateGithubUser accepts valid usernames", () => {
  assertEquals(validateGithubUser("acme"), "acme");
  assertEquals(validateGithubUser("my-org"), "my-org");
  assertEquals(validateGithubUser("user123"), "user123");
  assertEquals(validateGithubUser("A"), "A");
});

Deno.test("validateGithubUser rejects invalid usernames", () => {
  assertThrows(
    () => validateGithubUser(""),
    ValidationError,
    "githubUser must not be empty",
  );
  assertThrows(
    () => validateGithubUser("-user"),
    ValidationError,
    "plausible GitHub user",
  );
  assertThrows(
    () => validateGithubUser("user-"),
    ValidationError,
    "plausible GitHub user",
  );
});

Deno.test("validateGithubRepo accepts valid repo names", () => {
  assertEquals(validateGithubRepo("my-repo"), "my-repo");
  assertEquals(validateGithubRepo("repo.name"), "repo.name");
  assertEquals(validateGithubRepo("repo_name"), "repo_name");
  assertEquals(validateGithubRepo("repo-name_v2.0"), "repo-name_v2.0");
});

Deno.test("validateGithubRepo rejects invalid repo names", () => {
  assertThrows(
    () => validateGithubRepo(""),
    ValidationError,
    "githubRepo must not be empty",
  );
  assertThrows(
    () => validateGithubRepo("repo name"),
    ValidationError,
    "letters, digits, dots, underscores, and hyphens",
  );
});

Deno.test("validateCodeOwner accepts valid handles", () => {
  assertEquals(validateCodeOwner("@acme"), "@acme");
  assertEquals(validateCodeOwner("@org/team"), "@org/team");
  assertEquals(validateCodeOwner("@user_name"), "@user_name");
});

Deno.test("validateCodeOwner rejects invalid handles", () => {
  assertThrows(
    () => validateCodeOwner(""),
    ValidationError,
    "codeOwner must not be empty",
  );
  assertThrows(
    () => validateCodeOwner("acme"),
    ValidationError,
    "must look like @user",
  );
  assertThrows(
    () => validateCodeOwner("@"),
    ValidationError,
    "must look like @user",
  );
});

Deno.test("validateSecurityEmail accepts valid emails", () => {
  assertEquals(validateSecurityEmail("test@example.com"), "test@example.com");
  assertEquals(validateSecurityEmail("a@b.c"), "a@b.c");
});

Deno.test("validateSecurityEmail rejects invalid emails", () => {
  assertThrows(
    () => validateSecurityEmail(""),
    ValidationError,
    "securityEmail must not be empty",
  );
  assertThrows(
    () => validateSecurityEmail("notanemail"),
    ValidationError,
    "valid email address",
  );
  assertThrows(
    () => validateSecurityEmail("@example.com"),
    ValidationError,
    "valid email address",
  );
  assertThrows(
    () => validateSecurityEmail("test@"),
    ValidationError,
    "valid email address",
  );
});
