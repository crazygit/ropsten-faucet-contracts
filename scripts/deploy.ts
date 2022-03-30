// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre, { ethers } from "hardhat"

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const FaucetFactory = await ethers.getContractFactory("Faucet")
  const faucet = await FaucetFactory.deploy()

  await faucet.deployed()

  const network = await faucet.provider.getNetwork()
  console.log("Network name:", network.name)
  console.log("Network chain id: ", network.chainId)
  console.log("Contract address:", faucet.address)
  // Returns the contract code of address as of the blockTag block height. If there is no contract currently deployed, the result is 0x.
  // console.log("Contract code:", await faucet.provider.getCode(faucet.address));
  console.log("Contract owner address:", await faucet.signer.getAddress())

  if (hre.network.name === "localhost") {
    console.log("Localhost Network, Add 10 ETH to the contract account")
    await hre.network.provider.send("hardhat_setBalance", [
      faucet.address,
      ethers.utils.parseEther("10").toHexString()
    ])
  }

  console.log(
    "Contract balance:",
    ethers.utils.formatEther(await faucet.getBalance())
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
