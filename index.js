import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection } from "@solana/web3.js";

(async () => {
  const MY_TOKEN_MINT_ADDRESS = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr";
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const accounts = await connection.getProgramAccounts(
    TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      dataSlice: {
        offset: 0, // number of bytes
        length: 0, // number of bytes
      },
      filters: [
        {
          dataSize: 165, // number of bytes
        },
        {
          memcmp: {
            offset: 0, // number of bytes
            bytes: MY_TOKEN_MINT_ADDRESS, // base58 encoded string
          },
        },
      ],
    }
  );
  console.log(
    `Found ${accounts.length} token account(s) for mint ${MY_TOKEN_MINT_ADDRESS}`
  );

  const tokenAccountInfo = await connection.getParsedAccountInfo(
    accounts[0].pubkey
  );

  let totalSupply = 0;
  const data = {};
  let startTime = new Date();
  let count = 100;
  for (var i = 0; i < accounts.length; i++) {
    if (count === 0) {
      break;
    }

    const tokenAccountInfo = await connection.getParsedAccountInfo(
      accounts[i].pubkey
    );

    const holderData = (tokenAccountInfo.value?.data).parsed.info;
    if (
      holderData.owner.toString() ===
      "2dHGi9wQDqTMLZkgaeyetDzs91MGFDogFHWuTicr2j5a"
    ) {
      console.log("Found Tokens ", Number(holderData.tokenAmount.amount));
    }
    if (Number(holderData.tokenAmount.amount) > 0) {
      count--;
      totalSupply += Number(holderData.tokenAmount.amount);
      if (holderData.owner in data) {
        data[holderData.owner] = {
          amount:
            Number(data[holderData.owner].amount) +
            Number(holderData.tokenAmount.amount),
        };
      } else {
        data[holderData.owner] = {
          amount: Number(holderData.tokenAmount.amount),
        };
      }
    }
  }

  console.log("Holder's Data", data);
  let endTime = new Date();
  let timeElapsed = endTime - startTime;
  console.log("totalSupply".toUpperCase(), totalSupply);
  console.log("TimeElapsed in Seconds", timeElapsed / 1000);
})();
