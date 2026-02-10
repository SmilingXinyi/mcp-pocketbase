#!/bin/bash

set -e

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "bun is not installed."
    read -p "Do you want to install bun? (y/n): " choice
    
    if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
        echo "Installing bun..."
        curl -fsSL https://bun.sh/install | bash
        
        # Source the bun path for the current session
        export BUN_INSTALL="$HOME/.bun"
        export PATH="$BUN_INSTALL/bin:$PATH"
        
        echo "bun installed successfully"
    else
        echo "Installation cancelled. Exiting."
        exit 0
    fi
else
    echo "bun is already installed: $(bun --version)"
fi

# Run the bundle command
echo "Running bundle command..."
bun run bundle
