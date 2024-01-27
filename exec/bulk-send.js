"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOLANA_CONNECTION = void 0;
const web3_js_1 = require("@solana/web3.js");
const dropList_1 = require("./dropList");
const dotenv = __importStar(require("dotenv")); // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
const bs58_1 = __importDefault(require("bs58"));
const QUICKNODE_RPC = process.env.DEVNET_RPC_URL;
exports.SOLANA_CONNECTION = new web3_js_1.Connection(QUICKNODE_RPC);
const pvtKey = process.env.DEVNET_PRIVATE_KEY;
const FROM_KEY_PAIR = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(pvtKey));
const NUM_DROPS_PER_TX = 22;
const TX_INTERVAL = 1000;
console.log("Airdrop Size", dropList_1.dropList.length);
function generateTransactions(batchSize, dropList, fromWallet) {
    let result = [];
    let txInstructions = dropList.map((drop) => {
        return web3_js_1.SystemProgram.transfer({
            fromPubkey: fromWallet,
            toPubkey: new web3_js_1.PublicKey(drop.walletAddress),
            lamports: drop.numLamports,
        });
    });
    const numTransactions = Math.ceil(txInstructions.length / batchSize);
    for (let i = 0; i < numTransactions; i++) {
        let bulkTransaction = new web3_js_1.Transaction();
        let lowerIndex = i * batchSize;
        let upperIndex = (i + 1) * batchSize;
        for (let j = lowerIndex; j < upperIndex; j++) {
            if (txInstructions[j])
                bulkTransaction.add(txInstructions[j]);
        }
        result.push(bulkTransaction);
    }
    return result;
}
function executeTransactions(solanaConnection, transactionList, payer) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = [];
        let staggeredTransactions = transactionList.map((transaction, i, allTx) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log(`Requesting Transaction ${i + 1}/${allTx.length}`);
                    solanaConnection
                        .getLatestBlockhash()
                        .then((recentHash) => (transaction.recentBlockhash = recentHash.blockhash))
                        .then(() => (0, web3_js_1.sendAndConfirmTransaction)(solanaConnection, transaction, [payer]))
                        .then(resolve);
                }, i * TX_INTERVAL);
            });
        });
        result = yield Promise.allSettled(staggeredTransactions);
        return result;
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Initiating SOL drop from ${FROM_KEY_PAIR.publicKey.toString()}`);
    const transactionList = generateTransactions(NUM_DROPS_PER_TX, dropList_1.dropList, FROM_KEY_PAIR.publicKey);
    const txResults = yield executeTransactions(exports.SOLANA_CONNECTION, transactionList, FROM_KEY_PAIR);
    console.log(txResults);
}))();
