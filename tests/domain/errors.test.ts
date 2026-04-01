import { assertEquals } from "jsr:@std/assert@1.0.19";
import {
  AppError,
  DirectoryConflictError,
  ValidationError,
  WriteError,
} from "../../src/domain/errors.ts";

Deno.test("AppError stores code, message, and details", () => {
  const error = new AppError("INVALID_ARGUMENT", "Test message", {
    field: "testField",
  });

  assertEquals(error.code, "INVALID_ARGUMENT");
  assertEquals(error.message, "Test message");
  assertEquals(error.details.field, "testField");
  assertEquals(error.name, "AppError");
});

Deno.test("AppError defaults details to empty object", () => {
  const error = new AppError("PATH_CONFLICT", "Path conflict");
  assertEquals(error.details, {});
});

Deno.test("AppError is an instance of Error", () => {
  const error = new AppError("WRITE_FAILED", "Write failed");
  assertEquals(error instanceof Error, true);
  assertEquals(error instanceof AppError, true);
});

Deno.test("ValidationError has INVALID_ARGUMENT code", () => {
  const error = new ValidationError("Invalid input", { field: "email" });
  assertEquals(error.code, "INVALID_ARGUMENT");
  assertEquals(error.message, "Invalid input");
  assertEquals(error.details.field, "email");
  assertEquals(error.name, "ValidationError");
});

Deno.test("ValidationError is instance of AppError", () => {
  const error = new ValidationError("Invalid");
  assertEquals(error instanceof AppError, true);
});

Deno.test("DirectoryConflictError has DIRECTORY_NOT_EMPTY code", () => {
  const error = new DirectoryConflictError("Directory not empty", {
    path: "/some/path",
  });
  assertEquals(error.code, "DIRECTORY_NOT_EMPTY");
  assertEquals(error.name, "DirectoryConflictError");
});

Deno.test("DirectoryConflictError is instance of AppError", () => {
  const error = new DirectoryConflictError("Not empty");
  assertEquals(error instanceof AppError, true);
});

Deno.test("WriteError has WRITE_FAILED code", () => {
  const error = new WriteError("Failed to write file", { path: "/tmp/file" });
  assertEquals(error.code, "WRITE_FAILED");
  assertEquals(error.name, "WriteError");
});

Deno.test("WriteError is instance of AppError", () => {
  const error = new WriteError("Write failed");
  assertEquals(error instanceof AppError, true);
});

Deno.test("Error details property cannot be reassigned", () => {
  const error = new AppError("INVALID_ARGUMENT", "Test", { field: "value" });
  assertEquals(
    Reflect.getOwnPropertyDescriptor(error, "details")?.writable,
    false,
  );
});
