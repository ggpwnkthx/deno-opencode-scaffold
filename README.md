# @ggpwnkthx/opencode-scaffold

A Deno v2.7+ CLI that initializes a new repository with template files:

- `.devcontainer/`
- `.github/`
- `.opencode/plugins/`
- `.vscode/`
- `.gitattributes`
- `.gitignore`
- all root `*.md` files
- `opencode.json`
- a freshly generated `deno.jsonc`

It also creates a small `src/`, `tests/`, `benchmarks/`, and `examples/` tree in the generated app so the emitted Deno tasks are immediately usable.

## Usage

Initialize in a new directory:

```bash
deno run --allow-read --allow-write jsr:@ggpwnkthx/opencode-scaffold init my-app
```

Initialize in the current directory (uses the directory name as the app name):

```bash
deno run --allow-read --allow-write jsr:@ggpwnkthx/opencode-scaffold init
```

Initialize in the current directory explicitly:

```bash
deno run --allow-read --allow-write jsr:@ggpwnkthx/opencode-scaffold init .
```

With options:

```bash
deno run --allow-read --allow-write jsr:@ggpwnkthx/opencode-scaffold init my-app \
  --scope @acme \
  --github-user acme \
  --github-repo my-app \
  --codeowner @acme/platform \
  --security-email security@acme.test
```

Note: Underscores in app names are normalized to hyphens (e.g., `my_app` becomes `my-app`).

### Flags

- `--dir <path>`: write into a custom destination directory
- `--scope <@scope>`: JSR scope used in generated docs
- `--github-user <user>`: GitHub owner/org used in badges and clone URL
- `--github-repo <repo>`: repository name used in docs
- `--codeowner <@handle>`: value written to `.github/CODEOWNERS`
- `--security-email <email>`: value written to `SECURITY.md`
- `--force`: allow writing into a non-empty target directory
- `--dry-run`: print what would be written without touching disk
- `--help`: show CLI help

## Required permissions

- `--allow-read`: checks whether the target directory already exists and whether it is empty
- `--allow-write`: creates directories and writes scaffolded files

## Build an executable

```bash
deno task build
./dist/scaffold init my-app
```

## Test

```bash
deno task test
```
