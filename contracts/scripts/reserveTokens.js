require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const NUM_TOKENS = 5; // modifty as needed

  const SilicateNFT = await hre.ethers.getContractFactory("SilicateNFT");

  const nft = await SilicateNFT.attach(
    process.env.CONTRACT_ADDRESS // deployed contract address
  );
  console.log("SilicateNFT attached to:", nft.address);

  console.log("reserveTokens...");

  const res = await nft.reserveTokens(NUM_TOKENS);

  console.log("reserveTokens done!", res);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
