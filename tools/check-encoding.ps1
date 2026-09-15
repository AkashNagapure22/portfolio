# Fails if any HTML page contains double-encoded (mojibake) character sequences.
# These appear when a UTF-8 file is saved through a Windows-1252 round-trip.
param([string]$Root = (Join-Path $PSScriptRoot '..'))
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false, $true)
$patterns = @(
  '\u00E2\u20AC',        # a\u0302 + euro  -> classic Ã¢â‚¬Å“/Ã¢â‚¬â€œ/Ã¢â‚¬ family
  '\u00E2\u2013',        # a\u0302 + en-dash (e.g. a\u0302\u2013\u00B9 triangle bullets)
  '\u00E2\u2020',        # a\u0302 + dagger (broken arrows)
  '\u00C3[\u0080-\u00BF]',  # A-tilde + continuation byte (double-encoded accents)
  '\u00C2[\u0080-\u00A0]',  # A-circumflex + high byte
  '[\u0080-\u009F]',     # raw C1 control characters
  '\u00F0\u0178'         # broken emoji prefix
)
$files = Get-ChildItem -Path $Root -Recurse -Include *.html |
  Where-Object { $_.FullName -notmatch '\\dist\\|\\node_modules\\' }
$fail = 0
foreach ($f in $files) {
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  $start = 0
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { $start = 3 }
  try { $text = $utf8.GetString($bytes[$start..($bytes.Length - 1)]) }
  catch { Write-Output ('FAIL ' + $f.FullName + ' (not valid UTF-8)'); $fail++; continue }
  foreach ($p in $patterns) {
    $hits = [regex]::Matches($text, $p)
    if ($hits.Count -gt 0) {
      $i = $hits[0].Index
      $ctx = $text.Substring([Math]::Max(0, $i - 30), [Math]::Min(80, $text.Length - [Math]::Max(0, $i - 30))) -replace '\s+', ' '
      Write-Output ('FAIL ' + $f.FullName + ' pattern ' + $p + ' x' + $hits.Count + ' ctx: ' + $ctx)
      $fail++
    }
  }
}
if ($fail -gt 0) { Write-Output ('ENCODING CHECK FAILED: ' + $fail + ' problem(s)'); exit 1 }
Write-Output ('Encoding check passed for ' + $files.Count + ' files.')