use anchor_lang::prelude::*;

declare_id!("BWTdH6BNqAxvhagA3EyNGBtJCnEnWgP8YH3qbXyrWzuj");

#[program]
pub mod agenttask {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.task_count = 0;
        msg!("AgentTask initialized!");
        Ok(())
    }

    pub fn register_agent(ctx: Context<RegisterAgent>, name: String) -> Result<()> {
        let agent = &mut ctx.accounts.agent;
        agent.owner = ctx.accounts.owner.key();
        agent.name = name;
        agent.is_registered = true;
        msg!("Agent registered: {}", name);
        Ok(())
    }

    pub fn post_task(ctx: Context<PostTask>, title: String, budget: u64) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let marketplace = &mut ctx.accounts.marketplace;
        task.id = marketplace.task_count;
        task.poster = ctx.accounts.poster.key();
        task.title = title;
        task.budget = budget;
        task.status = TaskStatus::Open;
        marketplace.task_count += 1;
        msg!("Task posted: {}", title);
        Ok(())
    }

    pub fn accept_task(ctx: Context<AcceptTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        task.worker = Some(ctx.accounts.worker.key());
        task.status = TaskStatus::InProgress;
        msg!("Task accepted");
        Ok(())
    }

    pub fn complete_task(ctx: Context<CompleteTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        task.status = TaskStatus::Completed;
        msg!("Task completed");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 64)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterAgent<'info> {
    #[account(init, payer = owner, space = 8 + 200, seeds = [b"agent", owner.key().as_ref()], bump)]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PostTask<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(init, payer = poster, space = 8 + 300, seeds = [b"task", &marketplace.task_count.to_le_bytes()[..]], bump)]
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
    pub poster: Signer<'info>,
}

#[account]
pub struct Marketplace {
    pub authority: Pubkey,
    pub task_count: u64,
}

#[account]
pub struct Agent {
    pub owner: Pubkey,
    pub name: String,
    pub is_registered: bool,
}

#[account]
pub struct Task {
    pub id: u64,
    pub poster: Pubkey,
    pub title: String,
    pub budget: u64,
    pub status: TaskStatus,
    pub worker: Option<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TaskStatus {
    Open,
    InProgress,
    Completed,
}
