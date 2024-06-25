use anchor_lang::prelude::*;

declare_id!("8CndcK7U9koWCUbiY9q8UkFVDkCQiGXbC99pR2jwXgUF");

#[program]
pub mod postfeedapp {
    use anchor_lang::solana_program::entrypoint::ProgramResult;

    use super::*;

    
    pub fn create_post(ctx : Context<CreatePost> , text:String , media:String , position:i64 , admin:bool ) -> ProgramResult {
        let post = &mut ctx.accounts.feed_post_app;
        post.admin = admin;
        post.text = text;
        post.media = media;
        post.position = position;
        Ok(())
    }
    
}

#[derive(Accounts)]
pub struct CreatePost<'info,>{

    #[account(init , payer=user , space = 9000)]
    pub feed_post_app : Account<'info , FeedPostApp>,
    #[account(mut)]
    pub  user : Signer<'info,>,
    pub system_program : Program<'info , System>
}

#[account]
pub struct FeedPostApp{
    pub text:String,
    pub media:String,
    pub position : i64,
    pub admin : bool
}


