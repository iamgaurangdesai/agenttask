# AgentTask Deployment Package

## Program Details
- **Program ID:** `BWTdH6BNqAxvhagA3EyNGBtJCnEnWgP8YH3qbXyrWzuj`
- **Compiled:** Yes (agenttask.so)
- **Network:** Devnet

## Deployment Status
✅ Compiled successfully  
⚠️ Awaiting devnet SOL for deployment  

## Wallet
**Address:** `42X16wp68jqYqKTo8pyBs74NHqYYwpqAjC16RqDnajQv`  
**Balance:** 0 SOL  

## To Deploy

Once you have devnet SOL, run:
```bash
cd /home/clawdbot/.openclaw/workspace/agenttask/programs/agenttask
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana program deploy target/deploy/agenttask.so
```

## Files
- `target/deploy/agenttask.so` - Compiled program
- `target/deploy/agenttask-keypair.json` - Program keypair
- `src/lib.rs` - Source code
- `Cargo.toml` - Dependencies

## Program Features
- Initialize marketplace with USDC mint
- Register agents
- Post tasks with USDC escrow
- Accept tasks
- Submit proof of work
- Approve and release payment (2.5% fee)
- Rate workers

## Next Steps After Deploy
1. Update `Anchor.toml` with deployed program ID
2. Update frontend constants
3. Initialize marketplace on devnet
4. Test full flow
