import './App.css';
import { useEffect, useState } from 'react'
import * as anchor from "@project-serum/anchor";
import { Buffer } from 'buffer';
import idl from '../postfeedapp.json' //get the smartcontract data structure model from target folder in anchor rust
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils } from '@project-serum/anchor';
import { FeedPostDesign } from './FeedPostDesign';

const { SystemProgram, Keypair } = web3;

window.Buffer = Buffer
const programID = new PublicKey(idl.metadata.address)
const network = clusterApiUrl("devnet")
const opts = {
  preflightCommitment: "processed",
}
const feedPostApp = Keypair.generate();
const connection = new Connection(network, opts.preflightCommitment);


const App = () => {
  const [Loading, setLoading] = useState(false)
  const [datas, setData] = useState([])
  const [walletaddress, setWalletAddress] = useState("");

  const { solana } = window;
  const getProvider = () => {
    //Creating a provider, the provider is authenication connection to solana
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const checkIfWalletIsConnected = async () => {
    try {
      setLoading(true)
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          const response = await solana.connect({
            onlyIfTrusted: true, //second time if anyone connected it won't show anypop on screen
          });
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found!, Get a Phantom Wallet");
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const onLoad = () => {
    checkIfWalletIsConnected();
    getPosts();
  };

  const connectWalletRenderPopup = async () => { //first time users are connecting to wallet this function will activate
    try {
      setLoading(true)
      if (solana) {
        const response = await solana.connect();
        console.log("Wallet addressa --> ", response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  };

  const connect = () => {
    return (
      <button onClick={connectWalletRenderPopup} className="buttonStyle"> {Loading ? <p>loading...</p> : <p>Connect Your Wallet To Post </p>}    </button>
    );
  };

  const createPostFunction = async (text, hastag, position) => { //createPostFunction connects to the smartcontract via rpc and lib.json  to create post
    const provider = getProvider() //checks & verify the dapp it can able to connect solana network
    const program = new Program(idl, programID, provider) //program will communicate to solana network via rpc using lib.json as model
    const num = new anchor.BN(position); //to pass number into the smartcontract need to convert into binary
    console.log("Num ==> ", num);
    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      const tx = await program.rpc.createPost(text, hastag, num, false, {
        accounts: {
          feedPostApp: feedPostApp.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [feedPostApp]
      })
      const account_data = await program.account.feedPostApp.fetch(feedPostApp.publicKey)
      console.log('user_data', 'tx', tx, 'feedpostapp', feedPostApp.publicKey.toString(), 'user', provider.wallet.publicKey.toString(), 'systemProgram', SystemProgram.programId.toString())
      console.log("Account data ==> ", account_data);
      onLoad();
    } catch (err) {
      console.log(err)
    }
  }

  // const getPosts = async() =>{
  //   const provider = getProvider();
  //   const program = new Program(idl,programID,provider)
  //   console.log("Programm =>>> " , program);
  //   try{
  //     setLoading(true)
  //     Promise.all(
  //       ((await connection.getProgramAccounts(programID)).map(async(tx,index)=>( //no need to write smartcontract to get the data, just pulling all transaction respective programID and showing to user
  //         {
  //         ...(await program.account.feedPostApp.fetch(tx.pubkey)),
  //           pubkey:tx.pubkey.toString(),
  //       }
  //       ))) 
  //   ).then(result=>{
  //     console.log("Result ==> " , result);
  //     result.sort(function(a,b){return b.position.words[0] - a.position.words[0] })
  //     setData([...result])
  //   })
  //   }catch(err){
  //     console.log(err)
  //   }finally{
  //     setLoading(false)
  //   }
  // }

  const getPosts = async () => {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);

    console.log("Program:", program);

    try {
      setLoading(true);
      const accounts = await connection.getProgramAccounts(programID);
      console.log("Account ===>>> ", accounts);
      const posts = await Promise.all(accounts.map(async (account) => {
        return {
          ...await program.account.feedPostApp.fetch(account.pubkey),
          pubkey: account.pubkey.toString(),
        };
      }));

      console.log("Posts:", posts);
      posts.sort((a, b) => b.position.words[0] - a.position.words[0]);
      setData([...posts]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // const provider = getProvider();
    // const program = new Program(idl, programID, provider);

    // console.log("Program:", program);

    // try {
    //   //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
    //   const tx = await program.rpc.DeleteTweet({
    //     accounts: {
    //       feedPostApp: feedPostApp.publicKey,
    //       user: provider.wallet.publicKey,
    //       systemProgram: SystemProgram.programId,
    //     },
    //     signers: [feedPostApp]
    //   })
    //   const account_data = await program.account.feedPostApp.fetch(feedPostApp.publicKey)
    //   console.log('user_data', 'tx', tx, 'feedpostapp', feedPostApp.publicKey.toString(), 'user', provider.wallet.publicKey.toString(), 'systemProgram', SystemProgram.programId.toString())
    //   console.log("Account data ==> ", account_data);
    //   onLoad();
    // } catch (err) {
    //   console.log(err)
    // }

  }


  return (
    <div className='App'>
      {/* <button onClick={handleDelete}>Delete</button> */}
      <FeedPostDesign posts={datas} createPostFunction={createPostFunction} walletaddress={walletaddress} connect={connect} Loading={Loading} />
    </div>
  );
};

export default App;