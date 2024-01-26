import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import fs from "fs";

import path from "path";

import pkg from "lodash";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
const { get } = pkg;

const connection = new Connection("");
//const connection = new Connection(clusterApiUrl("mainnet"), "confirmed"); // very styring

//Token 2022 -  User Token Accounts + withhend tokens accounts ()

async function getTokenOwners(address, tokenDecimals) {
  const filters = [
    {
      memcmp: {
        offset: 0,
        bytes: address,
      },
    },
    {
      memcmp: {
        offset: 165,
        bytes: "3", // the number 2 as base58, which means AccountType::Account
      },
    },
  ];
  const programAccountsConfig = {
    filters,
    encoding: "jsonParsed",
  };
  //
  const listOfTokens = await connection.getParsedProgramAccounts(
    TOKEN_2022_PROGRAM_ID,
    programAccountsConfig
  );
  //
  console.log("listOfTokens", listOfTokens);
  let totalSuppply = 0;
  return listOfTokens
    .map((token) => {
      const address = get(token, "account.data.parsed.info.owner");
      const amountString = get(
        token,
        "account.data.parsed.info.tokenAmount.amount"
      );
      const amount = parseInt(amountString, 10) / Math.pow(10, tokenDecimals);
      return {
        address,
        amount,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

async function main() {
  let startTime = new Date();
  console.log("Getting token holders");

  const tokenAddress = "HKYX2jvwkdjbkbSdirAiQHqTCPQa3jD2DVRkAFHgFXXT";
  const tokenDecimals = 6;

  try {
    const owners = await getTokenOwners(tokenAddress, tokenDecimals);
    console.log("owner length", owners.length);

    const outputFile = "mainnet-tokens-owner1.json";
    fs.writeFileSync(path.resolve(outputFile), JSON.stringify(owners, null, 2));
    let endTime = new Date();
    let timeElapsed = endTime - startTime;
    console.log("TimeElapsed in Seconds", timeElapsed / 1000);
  } catch (error) {
    console.log("Error: ", error.message || error);
  }
}

main();
