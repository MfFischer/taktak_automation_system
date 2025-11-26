# Download Phi-3 Model for Taktak Local AI
# This script downloads the Phi-3-mini-4k-instruct-q4.gguf model from HuggingFace
# Using CURL for reliable large file downloads with progress

$ErrorActionPreference = "Stop"

# Model configuration - using the CORRECT smaller q4 model URL
$modelUrl = "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf"
$modelPath = Join-Path $PSScriptRoot "phi-3-mini-4k-instruct-q4.gguf"
$expectedSizeBytes = 2176220672  # ~2.03 GB (actual q4 size)
$expectedSizeGB = 2.03

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Phi-3 Model Download for Taktak" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Model: Phi-3-mini-4k-instruct-q4.gguf" -ForegroundColor Yellow
Write-Host "Size: ~$expectedSizeGB GB" -ForegroundColor Yellow
Write-Host "Source: HuggingFace (Microsoft)" -ForegroundColor Yellow
Write-Host ""

# Check if model already exists and is complete
if (Test-Path $modelPath) {
    $fileSize = (Get-Item $modelPath).Length
    $fileSizeGB = [math]::Round($fileSize / 1GB, 2)

    # Check if file is complete (within 1% tolerance)
    if ($fileSize -ge ($expectedSizeBytes * 0.99)) {
        Write-Host "Model already downloaded and verified!" -ForegroundColor Green
        Write-Host "  Location: $modelPath" -ForegroundColor Gray
        Write-Host "  Size: $fileSizeGB GB" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Zero-setup AI is ready! Restart your Taktak server." -ForegroundColor Green
        exit 0
    } else {
        Write-Host "Incomplete download detected ($fileSizeGB GB / $expectedSizeGB GB)" -ForegroundColor Yellow
        Write-Host "Removing and re-downloading..." -ForegroundColor Yellow
        Remove-Item $modelPath -Force
    }
}

Write-Host "Starting download using CURL (reliable for large files)..." -ForegroundColor Cyan
Write-Host "This may take 10-30 minutes depending on your internet speed." -ForegroundColor Yellow
Write-Host ""

# Check if curl is available
$curlPath = Get-Command curl.exe -ErrorAction SilentlyContinue
if (-not $curlPath) {
    Write-Host "ERROR: curl.exe not found. Please install curl or use manual download." -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual download:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf" -ForegroundColor Gray
    Write-Host "2. Download: Phi-3-mini-4k-instruct-q4.gguf" -ForegroundColor Gray
    Write-Host "3. Save to: $modelPath" -ForegroundColor Gray
    exit 1
}

Try {
    # Use curl for reliable download with progress bar and resume support
    $curlArgs = @(
        "-L",                    # Follow redirects
        "-#",                    # Progress bar
        "-C", "-",               # Resume if interrupted
        "-o", $modelPath,        # Output file
        $modelUrl                # URL
    )

    & curl.exe @curlArgs

    if ($LASTEXITCODE -ne 0) {
        throw "curl download failed with exit code $LASTEXITCODE"
    }

    # Verify download
    if (-not (Test-Path $modelPath)) {
        throw "Download completed but file not found"
    }

    $fileSize = (Get-Item $modelPath).Length
    $fileSizeGB = [math]::Round($fileSize / 1GB, 2)

    if ($fileSize -lt ($expectedSizeBytes * 0.99)) {
        throw "Download incomplete: $fileSizeGB GB (expected ~$expectedSizeGB GB)"
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Download Complete & Verified!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Model saved to: $modelPath" -ForegroundColor Gray
    Write-Host "File size: $fileSizeGB GB" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Zero-setup AI is now ready!" -ForegroundColor Green
    Write-Host "Restart your Taktak server to use local AI." -ForegroundColor Yellow
    Write-Host ""
}
Catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Download Failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual download instructions:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf" -ForegroundColor Gray
    Write-Host "2. Click on 'Files and versions' tab" -ForegroundColor Gray
    Write-Host "3. Download: Phi-3-mini-4k-instruct-q4.gguf (~2 GB)" -ForegroundColor Gray
    Write-Host "4. Save to: $modelPath" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

