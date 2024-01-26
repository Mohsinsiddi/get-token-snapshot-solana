//sendSol.js

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const QUICKNODE_RPC = process.env.DEVNET_RPC_URL;
export const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC);

const pvtKey = process.env.DEVNET_PRIVATE_KEY;
export const keypair_secret = Keypair.fromSecretKey(bs58.decode(pvtKey));

// Generate a random address to send to

(async () => {
  const transaction = new Transaction();
  for (var i = 0; i < 21; i++) {
    // limit is 21
    console.log(`${i}th Number`);
    const to = Keypair.generate();
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: keypair_secret.publicKey,
        toPubkey: to.publicKey,
        lamports: LAMPORTS_PER_SOL / 1000,
      })
    );
  }

  try {
    // Sign transaction, broadcast, and confirm
    const signature = await sendAndConfirmTransaction(
      SOLANA_CONNECTION,
      transaction,
      [keypair_secret]
    );
    console.log("SIGNATURE", signature);
  } catch (error) {
    console.log("Error", error);
  }
})();
