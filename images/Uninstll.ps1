# Uninstall DesktopInfo deployment

$InstallDir = "$env:ProgramData\DesktopInfo"
$TaskName   = "LaunchDesktopInfo"
$StartupDir = "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\Startup"
$Shortcut   = Join-Path $StartupDir "DesktopInfo.lnk"

Write-Host "Starting DesktopInfo uninstall..." -ForegroundColor Yellow

# 1. Kill running instances
Stop-Process -Name "DesktopInfo" -Force -ErrorAction SilentlyContinue

# 2. Remove Scheduled Task (if it exists)
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# 3. Remove Startup shortcut (if it exists)
if (Test-Path $Shortcut) {
    Remove-Item -Path $Shortcut -Force -ErrorAction SilentlyContinue
}

# 4. Remove DesktopInfo folder and files
if (Test-Path $InstallDir) {
    Remove-Item -Path $InstallDir -Recurse -Force -ErrorAction SilentlyContinue
}

# 5. Cleanup old Registry Run keys (in case they exist)
Remove-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "DesktopInfo" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "DesktopInfo" -ErrorAction SilentlyContinue

Write-Host "Uninstall complete. DesktopInfo has been removed." -ForegroundColor Green
