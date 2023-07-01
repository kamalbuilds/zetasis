require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const ZetasisNFT = await hre.ethers.getContractFactory("ZetasisNFT");

  const nft = await ZetasisNFT.attach(
    process.env.CONTRACT_ADDRESS // deployed contract address
  );
  console.log("ZetasisNFT attached to:", nft.address);

  console.log(`setting contract saleState to inactive...`);

  const res = await nft.setSaleInactive();

  console.log("set PresaleActive", res);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
