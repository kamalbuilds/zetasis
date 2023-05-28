require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const SilicateNFT = await hre.ethers.getContractFactory("SilicateNFT");

  const nft = await SilicateNFT.attach(
    process.env.CONTRACT_ADDRESS // deployed contract address
  );
  console.log("SilicateNFT attached to:", nft.address);

  console.log(`Withdrawing ETH from NFT contract...`);

  const res = await nft.withdraw();

  console.log("ETH withdrawn!", res);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
