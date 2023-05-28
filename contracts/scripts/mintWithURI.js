require("dotenv").config();
const hre = require("hardhat");

const NUM_TOKENS = 5; // modify as needed

async function main() {
  const SilicateNFT = await hre.ethers.getContractFactory("SilicateNFT");

  const nft = await SilicateNFT.attach(
    process.env.CONTRACT_ADDRESS // deployed contract address
  );
  console.log("SilicateNFT attached to:", nft.address);

  console.log("Minting...");

  const res = await nft.mint(
    "https://bafybeie6rfxujzadhx5t3ofso6sckg33jknl5vhobmgby7uetpmbzaojvm.ipfs.w3s.link/preview.png"
  );

  console.log("Minted!", res);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
