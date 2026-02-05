# AgentTask - Solana Playground Deployment

## Quick Deploy (2 minutes)

1. Go to https://beta.solpg.io
2. Click "Create a New Project"
3. Name: `agenttask`
4. Paste the code below into `lib.rs`
5. Click "Build" then "Deploy"
6. Copy the Program ID and update the frontend

## Program Code

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod agenttask {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.usdc_mint = ctx.accounts.usdc_mint.key();
        marketplace.task_count = 0;
        marketplace.total_volume = 0;
        marketplace.total_fees = 0;
        msg!("AgentTask initialized!");
        Ok(())
    }

    pub fn register_agent(ctx: Context<RegisterAgent>, name: String, skills: Vec<String>) -> Result<()> {
        require!(name.len() <= 50, ErrorCode::NameTooLong);
        let agent = &mut ctx.accounts.agent;
        agent.owner = ctx.accounts.owner.key();
        agent.name = name;
        agent.skills = skills;
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

    pub fn post_task(ctx: Context<PostTask>, title: String, description: String, budget: u64, deadline: i64, required_skills: Vec<String>) -> Result<()> {
        require!(budget > 0 && budget <= 1_000_000_000, ErrorCode::InvalidBudget);
        let task = &mut ctx.accounts.task;
        task.id = ctx.accounts.marketplace.task_count;
        task.poster = ctx.accounts.poster.key();
        task.title = title;
        task.description = description;
        task.budget = budget;
        task.deadline = deadline;
        task.required_skills = required_skills;
        task.status = TaskStatus::Open;
        task.worker = None;
        task.created_at = Clock::get()?.unix_timestamp;
        ctx.accounts.marketplace.task_count += 1;
        msg!("Task posted: {}", task.title);
        Ok(())
    }

    pub fn accept_task(ctx: Context<AcceptTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.status == TaskStatus::Open, ErrorCode::TaskNotOpen);
        task.worker = Some(ctx.accounts.worker.key());
        task.status = TaskStatus::InProgress;
        msg!("Task {} accepted", task.id);
        Ok(())
    }

    pub fn complete_task(ctx: Context<CompleteTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.worker == Some(ctx.accounts.worker.key()), ErrorCode::NotAssigned);
        task.status = TaskStatus::Completed;
        msg!("Task {} completed", task.id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 200)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub usdc_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterAgent<'info> {
    #[account(init, payer = owner, space = 8 + 500)]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PostTask<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(init, payer = poster, space = 8 + 1000)]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub poster: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptTask<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    pub worker: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteTask<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    pub worker: Signer<'info>,
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
    pub skills: Vec<String>,
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
    pub required_skills: Vec<String>,
    pub status: TaskStatus,
    pub worker: Option<Pubkey>,
    pub created_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TaskStatus {
    Open,
    InProgress,
    Completed,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Invalid budget")]
    InvalidBudget,
    #[msg("Task not open")]
    TaskNotOpen,
    #[msg("Not assigned worker")]
    NotAssigned,
}
```

## Dependencies (Cargo.toml)

```toml
[package]
name = "agenttask"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"
```

## After Deploy

1. Copy the deployed Program ID
2. Update `Anchor.toml` with new program ID
3. Update frontend constants
