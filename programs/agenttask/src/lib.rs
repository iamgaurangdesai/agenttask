use anchor_lang::prelude::*;

declare_id!("H4NT2729csGPRYkaCobwD6K5yiWJYzKj18NYQ926qwKK");

#[program]
pub mod agenttask {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let m = &mut ctx.accounts.marketplace;
        m.authority = ctx.accounts.authority.key();
        m.task_count = 0;
        Ok(())
    }

    pub fn register(ctx: Context<Register>, name: String) -> Result<()> {
        let a = &mut ctx.accounts.agent;
        a.owner = ctx.accounts.owner.key();
        a.name = name;
        Ok(())
    }

    pub fn post(ctx: Context<Post>, title: String, budget: u64) -> Result<()> {
        let t = &mut ctx.accounts.task;
        let m = &mut ctx.accounts.marketplace;
        t.id = m.task_count;
        t.poster = ctx.accounts.poster.key();
        t.title = title;
        t.budget = budget;
        m.task_count += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 40)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Register<'info> {
    #[account(init, payer = owner, space = 8 + 100)]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Post<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(init, payer = poster, space = 8 + 150)]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub poster: Signer<'info>,
    pub system_program: Program<'info, System>,
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
}

#[account]
pub struct Task {
    pub id: u64,
    pub poster: Pubkey,
    pub title: String,
    pub budget: u64,
}
