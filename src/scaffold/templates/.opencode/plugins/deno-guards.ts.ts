import type { TemplateContext } from "@scaffold/types";

export const metadata = { outputPath: ".opencode/plugins/deno-guards.ts" };

export default function (_context: TemplateContext): string {
  return `import type { Plugin } from "@opencode-ai/plugin";
import { spawn } from "node:child_process";
import path from "node:path";

type HandleMessage = NonNullable<Plugin["handleMessage"]>;

const DENO_EXTENSIONS = new Set([".ts", ".tsx"]);
const EDIT_TOOLS = new Set(["write", "edit", "patch", "multiedit"]);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function getNestedString(obj: unknown, ...keys: string[]): string | undefined {
  let cur: unknown = obj;
  for (const key of keys) {
    if (!isRecord(cur)) return undefined;
    cur = cur[key];
  }
  return asString(cur);
}

function getFilePath(input: unknown, output: unknown): string | undefined {
  return (
    getNestedString(output, "args", "filePath") ??
    getNestedString(output, "args", "path") ??
    getNestedString(output, "args", "newPath") ??
    getNestedString(input, "args", "filePath") ??
    getNestedString(input, "args", "path") ??
    getNestedString(input, "args", "newPath") ??
    getNestedString(input, "filePath") ??
    getNestedString(input, "path")
  );
}

function isDenoFile(filePath: string | undefined): filePath is string {
  return !!filePath && DENO_EXTENSIONS.has(path.extname(filePath));
}

async function runCommand(
  args: string[],
  cwd: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  return await new Promise((resolve, reject) => {
    const child = spawn(args[0], args.slice(1), {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      resolve({
        code: code ?? 1,
        stdout,
        stderr,
      });
    });
  });
}

export default {
  name: "deno-guards",
  async handleMessage(
    input: Parameters<HandleMessage>[0],
    output: Parameters<HandleMessage>[1],
    api: Parameters<HandleMessage>[2],
  ) {
    if (output.role !== "assistant") return;

    const editTool =
      EDIT_TOOLS.has(getNestedString(output, "name") ?? "") ||
      EDIT_TOOLS.has(getNestedString(input, "name") ?? "");
    if (!editTool) return;

    const filePath = getFilePath(input, output);
    if (!filePath || !isDenoFile(filePath)) return;

    const cwd = getNestedString(input, "cwd") ?? Deno.cwd();
    const { code, stdout, stderr } = await runCommand(
      ["deno", "guard", filePath],
      cwd,
    );

    if (code !== 0) {
      await api.appendMessage({
        role: "user",
        content: \`Deno guard check failed with exit code \${code}.\n\nSTDERR:\n\${stderr}\n\nSTDOUT:\n\${stdout}\`,
      });
    }
  },
} satisfies Plugin;
`;
}
