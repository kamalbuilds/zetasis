require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const BASE_URI = process.env.BASE_URI;
  if (!BASE_URI) {
    console.log("BASE_URI is required. Please add it to your environment.");
    return;
  }

  const ZetasisNFT = await hre.ethers.getContractFactory("ZetasisNFT");
  const nft = await ZetasisNFT.attach(
    process.env.CONTRACT_ADDRESS // The deployed contract address
  );
  console.log("ZetasisNFT attached to:", nft.address);

  console.log("setting base uri...", BASE_URI);

  const res = await nft.setBaseURI(BASE_URI);

  console.log("set base uri", res);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
