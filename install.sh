#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print with color
print_green() {
    echo -e "${GREEN}$1${NC}"
}

print_yellow() {
    echo -e "${YELLOW}$1${NC}"
}

print_red() {
    echo -e "${RED}$1${NC}"
}

# Detect OS
OS="$(uname -s)"

# Map OS to GitHub release asset names
case "$OS" in
    "Darwin")
        BINARY_NAME="clippub-macos"
        ;;
    "Linux")
        BINARY_NAME="clippub-linux"
        ;;
    *)
        print_red "Unsupported OS: $OS"
        exit 1
        ;;
esac

# Get the latest version
LATEST_VERSION=$(curl -s https://api.github.com/repos/deepaste-ai/clip-pub/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$LATEST_VERSION" ]; then
    print_red "Failed to get latest version"
    exit 1
fi

print_green "Installing Clip Pub $LATEST_VERSION for $OS"

# Create installation directory
INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"

# Download URL
DOWNLOAD_URL="https://github.com/deepaste-ai/clip-pub/releases/download/${LATEST_VERSION}/${BINARY_NAME}"

# Download the binary
print_yellow "Downloading Clip Pub..."
curl -L "$DOWNLOAD_URL" -o "$INSTALL_DIR/clippub"

# Make it executable
chmod +x "$INSTALL_DIR/clippub"

# Add to PATH if not already in PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    print_yellow "Adding $INSTALL_DIR to PATH..."
    if [[ "$SHELL" == *"zsh"* ]]; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
        source ~/.zshrc
    elif [[ "$SHELL" == *"bash"* ]]; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
        source ~/.bashrc
    elif [[ "$SHELL" == *"fish"* ]]; then
        echo 'set -U fish_user_paths $HOME/.local/bin $fish_user_paths' >> ~/.config/fish/config.fish
        source ~/.config/fish/config.fish
    fi
fi

# Check if configuration exists
CONFIG_DIR="$HOME/.config/clippub"
CONFIG_FILE="$CONFIG_DIR/config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    print_yellow "Running initial configuration..."
    "$INSTALL_DIR/clippub" configure < /dev/tty
else
    print_green "Existing configuration found. Skipping configuration step."
fi

print_green "Installation completed! You can now use 'clippub' command."
print_yellow "Try it out with: clippub --help" 