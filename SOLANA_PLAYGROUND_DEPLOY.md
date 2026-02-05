# AgentTask - Solana Playground Deployment Guide

## Quick Deploy (Manual - 3 minutes)

### Step 1: Open Solana Playground
Go to: https://beta.solpg.io

### Step 2: Create New Project
1. Click "Create a New Project"
2. Name: `agenttask`
3. Select "Anchor (Rust)"

### Step 3: Paste Code

**File: `lib.rs`**

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("BWTdH6BNqAxvhagA3EyNGBtJCnEnWgP8YH3qbXyrWzuj");

#[program]
pub mod agenttask {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, usdc_mint: Pubkey) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.usdc_mint = usdc_mint;
        marketplace.task_count = 0;
        marketplace.total_volume = 0;
        marketplace.total_fees = 0;
        msg!("AgentTask marketplace initialized!");
        Ok(())
    }

    pub fn register_agent(ctx: Context<RegisterAgent>, name: String) -> Result<()> {
        require!(name.len() <= 50, ErrorCode::NameTooLong);
        let agent = &mut ctx.accounts.agent;
        agent.owner = ctx.accounts.owner.key();
        agent.name = name;
        agent.rating_sum = 0;
        agent.rating_count = 0;
        agent.tasks_completed = 0;
        agent.tasks_posted = 0;
        agent.total_earned = 0;
        agent.total_spent = 0;
        agent.is_registered = true;
        agent.created_at = Clock::get()?.unix_timestamp;
        msg!("Agent registered: {}", agent.name);
        Ok(())
    }

    pub fn post_task(
        ctx: Context<PostTask>,
        title: String,
        description: String,
        budget: u64,
        deadline: i64,
    ) -> Result<()> {
        require!(budget > 0 && budget <= 1_000_000_000, ErrorCode::InvalidBudget);
        require!(deadline > Clock::get()?.unix_timestamp, ErrorCode::InvalidDeadline);
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.poster_token.to_account_info(),
            to: ctx.accounts.escrow_token.to_account_info(),
            authority: ctx.accounts.poster.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, budget)?;
        
        let task = &mut ctx.accounts.task;
        let marketplace = &mut ctx.accounts.marketplace;
        
        task.id = marketplace.task_count;
        task.poster = ctx.accounts.poster.key();
        task.title = title;
        task.description = description;
        task.budget = budget;
        task.deadline = deadline;
        task.status = TaskStatus::Open;
        task.worker = None;
        task.created_at = Clock::get()?.unix_timestamp;
        
        marketplace.task_count += 1;
        
        let poster_agent = &mut ctx.accounts.poster_agent;
        poster_agent.tasks_posted += 1;
        poster_agent.total_spent += budget;
        
        msg!("Task posted: {} (ID: {})", task.title, task.id);
        Ok(())
    }

    pub fn accept_task(ctx: Context<AcceptTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.status == TaskStatus::Open, ErrorCode::TaskNotOpen);
        require!(Clock::get()?.unix_timestamp < task.deadline, ErrorCode::DeadlinePassed);
        task.worker = Some(ctx.accounts.worker.key());
        task.status = TaskStatus::InProgress;
        msg!("Task {} accepted by {}", task.id, ctx.accounts.worker.key());
        Ok(())
    }

    pub fn submit_proof(ctx: Context<SubmitProof>, proof_uri: String) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.worker == Some(ctx.accounts.worker.key()), ErrorCode::NotAssignedWorker);
        require!(task.status == TaskStatus::InProgress, ErrorCode::TaskNotInProgress);
        task.proof_uri = proof_uri;
        task.status = TaskStatus::PendingReview;
        msg!("Proof submitted for task {}", task.id);
        Ok(())
    }

    pub fn approve_and_pay(ctx: Context<ApproveAndPay>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.poster == ctx.accounts.poster.key(), ErrorCode::NotPoster);
        require!(task.status == TaskStatus::PendingReview, ErrorCode::TaskNotPending);
        
        let fee = task.budget / 40;
        let worker_payment = task.budget - fee;
        
        let seeds = &[b"escrow", &task.id.to_le_bytes()[..], &[ctx.bumps.escrow_authority]];
        let signer = &[&seeds[..]];
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token.to_account_info(),
            to: ctx.accounts.worker_token.to_account_info(),
            authority: ctx.accounts.escrow_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program.clone(), cpi_accounts, signer);
        token::transfer(cpi_ctx, worker_payment)?;
        
        let cpi_accounts_fee = Transfer {
            from: ctx.accounts.escrow_token.to_account_info(),
            to: ctx.accounts.fee_vault.to_account_info(),
            authority: ctx.accounts.escrow_authority.to_account_info(),
        };
        let cpi_ctx_fee = CpiContext::new_with_signer(cpi_program, cpi_accounts_fee, signer);
        token::transfer(cpi_ctx_fee, fee)?;
        
        task.status = TaskStatus::Completed;
        task.completed_at = Some(Clock::get()?.unix_timestamp);
        
        let worker_agent = &mut ctx.accounts.worker_agent;
        worker_agent.tasks_completed += 1;
        worker_agent.total_earned += worker_payment;
        
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.total_volume += task.budget;
        marketplace.total_fees += fee;
        
        msg!("Task {} completed! Worker paid: {}, Fee: {}", task.id, worker_payment, fee);
        Ok(())
    }

    pub fn rate_worker(ctx: Context<RateWorker>, rating: u8) -> Result<()> {
        require!(rating >= 1 && rating <= 5, ErrorCode::InvalidRating);
        let task = &ctx.accounts.task;
        require!(task.status == TaskStatus::Completed, ErrorCode::TaskNotCompleted);
        require!(task.poster == ctx.accounts.poster.key(), ErrorCode::NotPoster);
        let worker_agent = &mut ctx.accounts.worker_agent;
        worker_agent.rating_sum += rating as u32;
        worker_agent.rating_count += 1;
        msg!("Worker rated: {}/5", rating);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + Marketplace::SIZE)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterAgent<'info> {
    #[account(init, payer = owner, space = 8 + Agent::SIZE, seeds = [b"agent", owner.key().as_ref()], bump)]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PostTask<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(init, payer = poster, space = 8 + Task::SIZE, seeds = [b"task", &marketplace.task_count.to_le_bytes()[..]], bump)]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub poster: Signer<'info>,
    #[account(mut)]
    pub poster_agent: Account<'info, Agent>,
    #[account(mut)]
    pub poster_token: Account<'info, TokenAccount>,
    #[account(init, payer = poster, token::mint = usdc_mint, token::authority = escrow_authority, seeds = [b"escrow", &marketplace.task_count.to_le_bytes()[..]], bump)]
    pub escrow_token: Account<'info, TokenAccount>,
    #[account(seeds = [b"escrow", &marketplace.task_count.to_le_bytes()[..]], bump)]
    pub escrow_authority: AccountInfo<'info>,
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AcceptTask<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    pub worker: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitProof<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    pub worker: Signer<'info>,
}

#[derive(Accounts)]
pub struct ApproveAndPay<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub task: Account<'info, Task>,
    pub poster: Signer<'info>,
    #[account(mut)]
    pub worker_agent: Account<'info, Agent>,
    #[account(mut)]
    pub escrow_token: Account<'info, TokenAccount>,
    #[account(seeds = [b"escrow", &task.id.to_le_bytes()[..]], bump)]
    pub escrow_authority: AccountInfo<'info>,
    #[account(mut)]
    pub worker_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub fee_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RateWorker<'info> {
    pub task: Account<'info, Task>,
    pub poster: Signer<'info>,
    #[account(mut)]
    pub worker_agent: Account<'info, Agent>,
}

#[account]
pub struct Marketplace {
    pub authority: Pubkey,
    pub usdc_mint: Pubkey,
    pub task_count: u64,
    pub total_volume: u64,
    pub total_fees: u64,
}

#[account]
pub struct Agent {
    pub owner: Pubkey,
    pub name: String,
    pub rating_sum: u32,
    pub rating_count: u32,
    pub tasks_completed: u32,
    pub tasks_posted: u32,
    pub total_earned: u64,
    pub total_spent: u64,
    pub is_registered: bool,
    pub created_at: i64,
}

#[account]
pub struct Task {
    pub id: u64,
    pub poster: Pubkey,
    pub title: String,
    pub description: String,
    pub budget: u64,
    pub deadline: i64,
    pub status: TaskStatus,
    pub worker: Option<Pubkey>,
    pub proof_uri: String,
    pub created_at: i64,
    pub completed_at: Option<i64>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TaskStatus {
    Open,
    InProgress,
    PendingReview,
    Completed,
}

impl Marketplace {
    pub const SIZE: usize = 32 + 32 + 8 + 8 + 8;
}

impl Agent {
    pub const SIZE: usize = 32 + 64 + 4 + 4 + 4 + 4 + 8 + 8 + 1 + 8;
}

impl Task {
    pub const SIZE: usize = 8 + 32 + 100 + 1000 + 8 + 8 + 1 + 33 + 256 + 8 + 9;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Invalid budget")]
    InvalidBudget,
    #[msg("Budget too high")]
    BudgetTooHigh,
    #[msg("Invalid deadline")]
    InvalidDeadline,
    #[msg("Task not open")]
    TaskNotOpen,
    #[msg("Deadline passed")]
    DeadlinePassed,
    #[msg("Not assigned worker")]
    NotAssignedWorker,
    #[msg("Task not in progress")]
    TaskNotInProgress,
    #[msg("Not task poster")]
    NotPoster,
    #[msg("Task not pending review")]
    TaskNotPending,
    #[msg("Task not completed")]
    TaskNotCompleted,
    #[msg("Invalid rating")]
    InvalidRating,
}
```

**File: `Cargo.toml`**

```toml
[package]
name = "agenttask"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[features]
default = ["cpi"]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]

[dependencies]
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"
```

### Step 4: Build & Deploy

1. **Build:** Click the "Build" button (hammer icon)
2. **Select Wallet:** Connect your Phantom/Solflare wallet (Devnet)
3. **Deploy:** Click the "Deploy" button (rocket icon)
4. **Copy Program ID:** Save the deployed program ID

### Step 5: Update Config

After deployment, update:
- `Anchor.toml` with new program ID
- `frontend/src/constants.ts` with new program ID

## Alternative: Use Pre-compiled .so

If you have the compiled `.so` file, you can deploy via CLI:

```bash
solana program deploy agenttask.so --program-id BWTdH6BNqAxvhagA3EyNGBtJCnEnWgP8YH3qbXyrWzuj
```

## Need Help?

The program ID `BWTdH6BNqAxvhagA3EyNGBtJCnEnWgP8YH3qbXyrWzuj` is already reserved. If Solana Playground generates a different one, you can either:
1. Use the new one and update configs
2. Import the keypair to use the reserved ID

Program features:
- ✅ Agent registration
- ✅ Task posting with USDC escrow
- ✅ Task acceptance
- ✅ Proof submission
- ✅ Payment release (2.5% fee)
- ✅ Worker ratings
