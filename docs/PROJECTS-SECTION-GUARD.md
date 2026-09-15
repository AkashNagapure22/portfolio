# Protected Projects Section

The `#projects` section ("Key Projects" cards) of `index.html` is **frozen**. It
must not change unless a change is explicitly requested. A guard verifies it
against a committed baseline on every commit and every deploy, and can restore
the baseline automatically if anything rewrites it.

## Why this exists

On 2026-09-15 the section was rewritten by an unattended PowerShell/Python
round-trip that decoded and re-encoded the file in CP437. Every `→` (UTF-8
`E2 86 92`) inside the cards became the 6-byte mojibake `Î“Ã¥Ã†`
(`CE 93 C3 A5 C3 86`), so the six "input → output" telemetry lines rendered as
garbage. The section was restored from `41ff402` and this guard was added so the
same class of accident cannot reach a commit or a deployment again.

## Files

| File | Role |
| --- | --- |
| `index.html` | Holds the protected section. Only this one block is frozen. |
| `tools/projects-baseline.html` | Committed copy of the frozen section (newline-normalised, no BOM). |
| `tools/projects-guard.mjs` | The guard: verify / heal / accept. No dependencies. |
| `tools/install-guard-hooks.ps1` | Installs the local `pre-commit` hook. |
| `.github/workflows/deploy.yaml` | Runs `node tools/projects-guard.mjs` before the build, so drift fails the deploy. |

## Commands

| Command | Effect |
| --- | --- |
| `npm run projects:check` | Verify only. Exit 0 when the section matches the baseline. |
| `npm run projects:accept` | **Intentional** change: freeze the current section as the new baseline. |
| `node tools/projects-guard.mjs --heal` | Verify, and if the section drifted, restore the baseline in `index.html`. Refuses an already-broken section. |
| `node tools/projects-guard.mjs --file X --baseline Y` | Inspect another copy (used for testing). |
| `node tools/projects-guard.mjs --allow-projects-change` | Skip the check once (also `ALLOW_PROJECTS_CHANGE=1`). |
| `git commit --no-verify` | Bypass the local hook once. |

## What the guard checks

1. The file is valid UTF-8 and contains exactly one `<section id="projects">` …
   `</section>` block with no nested `<section>`.
2. Corrupted-character families are absent: CP437 arrows/dashes (`Γ…`) and
   box-drawing (`╬…`), Windows-1252 round-trips (`Ã¢â‚¬…`), double-encoded
   accents (`Ã…`) and raw C1 control bytes.
3. The structure is intact: balanced `<div>`/`</div>`, exactly 6
   `flip-card-container`, `flip-card-front` and `flip-card-back` elements.
4. The section is byte-for-byte identical to `tools/projects-baseline.html`
   (line endings are normalised, so CRLF/LF churn is not treated as drift).

A failure prints the first differing offset with the baseline and current
characters side by side, so the cause is obvious.

## Changing the section on purpose

1. Edit the `#projects` block in `index.html`.
2. Run `npm run projects:accept` (it refuses to freeze a structurally broken or
   mojibake-laden section).
3. Commit `index.html` and `tools/projects-baseline.html` together.

Never regenerate the section by round-tripping the whole file through a console,
`Get-Content`/`Set-Content`, or a Python `open()` read-write chain. Use
`[System.IO.File]::ReadAllText(...)` with an explicit
`UTF8Encoding($false, $true)` if PowerShell is unavoidable, and keep the UTF-8
BOM that `index.html` uses.

## Local enforcement

`powershell -NoProfile -ExecutionPolicy Bypass -File tools/install-guard-hooks.ps1`
installs `.git/hooks/pre-commit`, which runs `--heal` followed by a strict
verify: an accidental rewrite is reverted before the commit is created, and a
section that cannot be healed blocks the commit. The hook is local to this
clone; GitHub Actions enforces the same check for everyone.