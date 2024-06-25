const anchor = require('@project-serum/anchor');
const {assert} = require('chai');
const {SystemProgram} = anchor.web3;

describe("postfeedapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.local();
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Postfeedapp;
  const feedPostApp = new anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    
    const num = new anchor.BN(2)

    await program.rpc.createPost('hello' , 'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/9f6f2233ca00d2c0f4d2cfa557388feb' , num , false , {
      accounts:{
        feedPostApp:feedPostApp.publicKey,
        user:provider.wallet.publicKey,
        systemProgram:SystemProgram.programId
      },
      signers:[feedPostApp]
    })

    const account = await program.account.feedPostApp.fetch(feedPostApp.publicKey)
    

    // const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", account);
    
    
 
  });
});
