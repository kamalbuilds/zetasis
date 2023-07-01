require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const ZetasisNFT = await hre.ethers.getContractFactory("ZetasisNFT");

  const nft = await ZetasisNFT.attach(
    process.env.CONTRACT_ADDRESS // deployed contract address
  );
  console.log("ZetasisNFT attached to:", nft.address);

  console.log(`setting contract saleState to publicSale...`);

  const res = await nft.setPublicSaleActive();

  console.log("set PublicSaleActive", res);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
