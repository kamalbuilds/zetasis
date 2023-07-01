require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const ZetasisNFT = await hre.ethers.getContractFactory("ZetasisNFT");

  const nft = await ZetasisNFT.attach(
    process.env.CONTRACT_ADDRESS // deployed contract address
  );
  console.log("ZetasisNFT attached to:", nft.address);

  console.log("Minting...");

  try {
    const res = await nft["mint()"]();
    console.log("Minted!", res);
  } catch (err) {
    console.log("error: ", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
