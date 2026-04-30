const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying FoodSupplyChain with account: ${deployer.address}`);

  const FoodSupplyChain = await hre.ethers.getContractFactory("FoodSupplyChain");
  const contract = await FoodSupplyChain.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`FoodSupplyChain deployed to: ${contractAddress}`);

  const artifact = await hre.artifacts.readArtifact("FoodSupplyChain");
  const configPath = path.join(__dirname, "..", "backend", "config", "contractConfig.js");
  const configContent = `const contractAddress = "${contractAddress}";

const contractAbi = ${JSON.stringify(artifact.abi, null, 2)};

module.exports = {
  contractAddress,
  contractAbi,
};
`;

  fs.writeFileSync(configPath, configContent);
  console.log(`Backend contract config updated: ${configPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
