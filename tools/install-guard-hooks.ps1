# Installs the local git pre-commit hook that protects the "#projects" section
# of index.html (see tools/projects-guard.mjs and docs/PROJECTS-SECTION-GUARD.md).
#
# Usage:  powershell -NoProfile -ExecutionPolicy Bypass -File tools/install-guard-hooks.ps1
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$hooks = Join-Path $root '.git/hooks'
if (-not (Test-Path $hooks)) {
  Write-Output ('No .git/hooks directory found at ' + $hooks + ' - is this a git checkout?')
  exit 1
}

$hookPath = Join-Path $hooks 'pre-commit'
$lines = @(
  '#!/bin/sh',
  '# Installed by tools/install-guard-hooks.ps1 - protects the #projects section.',
  '# Remove this file (or use "git commit --no-verify") to bypass it.',
  'command -v node >/dev/null 2>&1 || exit 0',
  '',
  '# 1. Undo accidental rewrites of the frozen section (mojibake, re-encoding, ...)',
  'node tools/projects-guard.mjs --heal || exit 1',
  '',
  '# 2. Strict verification - a section that cannot be healed blocks the commit',
  'node tools/projects-guard.mjs || {',
  '  echo "[projects-guard] commit blocked: #projects in index.html is protected." >&2',
  '  exit 1',
  '}',
  '',
  '# 3. If the repair changed index.html, refresh the index so the commit cannot',
  '#    record the corrupted copy that was staged before this hook ran.',
  'if ! git diff --quiet -- index.html; then',
  '  echo "[projects-guard] re-staging the restored index.html" >&2',
  '  git add -- index.html || exit 1',
  'fi'
)
[System.IO.File]::WriteAllText($hookPath, (($lines -join "`n") + "`n"), (New-Object System.Text.UTF8Encoding($false)))

Write-Output ('Installed pre-commit guard hook at ' + $hookPath)
Write-Output 'It restores the frozen #projects section before every commit.'
Write-Output 'Intentional changes: npm run projects:accept   (Bypass once: git commit --no-verify)'