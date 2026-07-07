# PowerShell script to organize files by type
$sourceDir = Resolve-Path "."

# Define targets
$imageDir = Join-Path $sourceDir "Images"
$docDir   = Join-Path $sourceDir "Documents"
$videoDir = Join-Path $sourceDir "Videos"

# Ensure directories exist
New-Item -ItemType Directory -Force -Path $imageDir, $docDir, $videoDir | Out-Null

# Move Images (.jpg, .jpeg, .gif)
Get-ChildItem -Path $sourceDir -File | Where-Object { $_.Extension -match '^\.(jpg|jpeg|gif)$' } | ForEach-Object {
    Write-Host "Moving Image: $($_.Name) -> Images/"
    Move-Item -Path $_.FullName -Destination $imageDir -Force
}

# Move Documents (.txt)
Get-ChildItem -Path $sourceDir -File | Where-Object { $_.Extension -eq '.txt' } | ForEach-Object {
    Write-Host "Moving Document: $($_.Name) -> Documents/"
    Move-Item -Path $_.FullName -Destination $docDir -Force
}

# Move Videos (.mp4)
Get-ChildItem -Path $sourceDir -File | Where-Object { $_.Extension -eq '.mp4' } | ForEach-Object {
    Write-Host "Moving Video: $($_.Name) -> Videos/"
    Move-Item -Path $_.FullName -Destination $videoDir -Force
}

Write-Host "Organization complete!"
