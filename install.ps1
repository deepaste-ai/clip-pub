# Colors for output
$Host.UI.RawUI.ForegroundColor = "Green"
function Write-Green($text) { Write-Host $text -ForegroundColor Green }
function Write-Yellow($text) { Write-Host $text -ForegroundColor Yellow }
function Write-Red($text) { Write-Host $text -ForegroundColor Red }

# Detect architecture
$ARCH = if ([Environment]::Is64BitOperatingSystem) { "x86_64" } else { "x86" }

# Get the latest version
try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/deepaste-ai/clip-pub/releases/latest"
    $LATEST_VERSION = $response.tag_name
} catch {
    Write-Red "Failed to get latest version"
    exit 1
}

Write-Green "Installing Clip Pub $LATEST_VERSION for windows-$ARCH"

# Create installation directory
$INSTALL_DIR = "$env:USERPROFILE\AppData\Local\Programs\clippub"
New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null

# Download URL
$DOWNLOAD_URL = "https://github.com/deepaste-ai/clip-pub/releases/download/${LATEST_VERSION}/clippub-windows.exe"

# Download the binary
Write-Yellow "Downloading Clip Pub..."
$output = "$INSTALL_DIR\clippub.exe"
Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile $output

# Add to PATH if not already in PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$INSTALL_DIR*") {
    Write-Yellow "Adding to PATH..."
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$INSTALL_DIR", "User")
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Check if configuration exists
$CONFIG_DIR = "$env:USERPROFILE\.config\clippub"
$CONFIG_FILE = "$CONFIG_DIR\config.json"

if (-not (Test-Path $CONFIG_FILE)) {
    Write-Yellow "Running initial configuration..."
    & "$INSTALL_DIR\clippub.exe" configure
} else {
    Write-Green "Existing configuration found. Skipping configuration step."
}

Write-Green "Installation completed! You can now use 'clippub' command."
Write-Yellow "Try it out with: clippub --help" 