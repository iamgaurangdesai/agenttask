#!/bin/bash
# Deploy AgentTask to Solana Devnet

echo "🚀 Deploying AgentTask to Solana Devnet..."

# Check for Solana CLI
if ! command -v solana &> /dev/null; then
    echo "Installing Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
fi

# Set devnet
solana config set --url devnet

# Check balance
BALANCE=$(solana balance)
echo "Current balance: $BALANCE"

if [[ $(echo "$BALANCE < 2" | bc) -eq 1 ]]; then
    echo "Requesting airdrop..."
    solana airdrop 2
fi

# Build
echo "Building program..."
cargo build-bpf --manifest-path=programs/agenttask/Cargo.toml

# Deploy
echo "Deploying..."
solana program deploy target/deploy/agenttask.so

echo "✅ Deployment complete!"
