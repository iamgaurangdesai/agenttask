# AgentTask Deployment Guide

## Prerequisites

Install Solana CLI:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

## Deploy to Devnet

```bash
cd /home/clawdbot/.openclaw/workspace/agenttask

# Set devnet
solana config set --url devnet

# Get devnet SOL (if needed)
solana airdrop 2

# Build
cargo build-bpf

# Deploy
solana program deploy target/deploy/agenttask.so
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Testing

1. Create test wallets
2. Fund with devnet USDC
3. Post test task
4. Accept and complete
5. Verify escrow/payment flow
