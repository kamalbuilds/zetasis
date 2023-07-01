import { utils } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const receiverAddress = "0x0F86e3a9F4dFf827fF69baB1AD31a86427F2204A"; // change this to your recipient's address
const amountToSend = utils.parseEther("1"); // Change this to the amount you want to send

const main = async (args: any, hre: HardhatRuntimeEnvironment) => {
  const [signer] = await hre.ethers.getSigners();
  console.log(`🔑 Using account: ${signer.address}\n`);

  const tx = await signer.sendTransaction({
    gasLimit: 21000,
    to: receiverAddress,
    value: amountToSend,
  });

  console.log(`⏳ Waiting for transaction ${tx.hash} to be mined...`);

  await tx.wait();

  console.log(`✅ Transaction ${tx.hash} successfully mined.
🌍 Explorer: https://explorer.zetachain.com/tx/${tx.hash}
`);
};

task("sendTokens", "Send native tokens to another address").setAction(main);
