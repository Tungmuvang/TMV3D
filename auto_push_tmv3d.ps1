# 1-Click Auto Sync & Push Script for TMV3D Store (https://github.com/Tungmuvang/TMV3D)
$Host.UI.RawUI.WindowTitle = "1-CLICK AUTO SYNC TMV3D STORE TO GITHUB"

$git = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $git) {
    $git = (Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop" -Filter "git.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
}

if (-not $git) {
    Write-Host "[!] KHONG TIM THAY GIT TREN MAY TINH!" -ForegroundColor Red
    Write-Host "Vui long dung phan mem GitHub Desktop de Push qua giao dien." -ForegroundColor Yellow
    Read-Host "Nhan Enter de thoat..."
    exit
}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  1-CLICK DANG VA CAP NHAT WEB TMV IN3D LEN GITHUB" -ForegroundColor Cyan
Write-Host "  Repo: https://github.com/Tungmuvang/TMV3D" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .git exists in 3d-store
if (-not (Test-Path ".git")) {
    Write-Host "[*] Dang khoi tao Git Repo trong thu muc 3d-store..." -ForegroundColor Yellow
    & $git init
    & $git branch -M main
    & $git remote add origin https://github.com/Tungmuvang/TMV3D.git
} else {
    # Ensure remote origin points to TMV3D
    $currentRemote = & $git remote get-url origin 2>$null
    if ($currentRemote -ne "https://github.com/Tungmuvang/TMV3D.git") {
        & $git remote set-url origin https://github.com/Tungmuvang/TMV3D.git 2>$null
        if ($LASTEXITCODE -ne 0) {
            & $git remote add origin https://github.com/Tungmuvang/TMV3D.git 2>$null
        }
    }
}

Write-Host "[*] Dang tu dong cap nhat toan bo web TMV IN3D len GitHub..." -ForegroundColor Yellow

& $git add .
$commitMsg = "Auto update TMV3D store - " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
& $git commit -m $commitMsg
& $git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=======================================================" -ForegroundColor Green
    Write-Host "[OK] THANH CONG! Web 3D Store da cap nhat len GitHub TMV3D!" -ForegroundColor Green
    Write-Host "=======================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=======================================================" -ForegroundColor Red
    Write-Host "[!] Push loi! Neu Github yeu cau login, hay dang nhap hoac dung Github Desktop." -ForegroundColor Red
    Write-Host "=======================================================" -ForegroundColor Red
}

Write-Host ""
Read-Host "Nhan Enter de thoat..."
