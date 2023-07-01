require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const newRoyaltyAddress = "0x56ECc7D00bd338837E4d45047EaAec4843Ea810F"; // modify as needed

  const ZetasisNFT = await hre.ethers.getContractFactory("ZetasisNFT");

  const nft = await ZetasisNFT.attach(
    process.env.CONTRACT_ADDRESS // deployed contract address
  );
  console.log("ZetasisNFT attached to:", nft.address);

  console.log(`Setting new royalty receiver address...`);

  const res = await nft.setRoyaltyReceiverAddress(newRoyaltyAddress);

  console.log("Royalty receiver address set!", res);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
