const { ethers } = require("ethers");
require("dotenv").config();

const { contractAbi, contractAddress } = require("./contractConfig");

const rpcUrl = process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545";
const privateKey = process.env.PRIVATE_KEY || "";
const validPrivateKey = /^(0x)?[0-9a-fA-F]{64}$/.test(privateKey);

const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = validPrivateKey ? new ethers.Wallet(privateKey, provider) : null;
const readOnlyContract = new ethers.Contract(contractAddress, contractAbi, provider);
const writableContract = signer ? new ethers.Contract(contractAddress, contractAbi, signer) : null;

function getContractForWrite() {
  if (!writableContract) {
    throw new Error("PRIVATE_KEY is missing. Add it to .env for backend write transactions.");
  }

  if (contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("CONTRACT_ADDRESS is missing. Deploy the contract and update .env.");
  }

  return writableContract;
}

module.exports = {
  provider,
  signer,
  readOnlyContract,
  getContractForWrite,
};
