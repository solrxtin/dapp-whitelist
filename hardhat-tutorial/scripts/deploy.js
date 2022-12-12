const { ethers, run, network } = require("hardhat");
const fs = require("fs");

async function main() {
  /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so whitelistContract here is a factory for instances of our Whitelist contract.
  */
  const whitelistContract = await ethers.getContractFactory("Whitelist");

  // here we deploy the contract
  const deployedWhitelistContract = await whitelistContract.deploy(10);
  // 10 is the Maximum number of whitelisted addresses allowed

  // Wait for it to finish deploying
  await deployedWhitelistContract.deployed();

  // print the address of the deployed contract
  console.log("Whitelist Contract Address:", deployedWhitelistContract.address);

  //Pull the address and ABI out while you deploy, since that will be key in interacting with the smart contract later
  const data = {
      address: deployedWhitelistContract.address,
      abi: JSON.parse(deployedWhitelistContract.interface.format("json")),
    };

  fs.writeFileSync("./src/details.json", JSON.stringify(data));

  // Checking to see the network we are on before verifying on etherscan
  if (network.config.chainId===5 && process.env.ETHERSCAN_API_KEY) {
    // Wait for six block confirmations before verifying on etherscan
    await deployedWhitelistContract.wait(6);
    await verify(deployedWhitelistContract.address, [])
  }
}

// We can run the verify task from the terminal using the below command
// npx hardhat verify --network <network name> contractAddress "args"
// Or programmatically using the verify function below
async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguements: args
    })
  } catch (e) {
    if (e.mesage.toLowercase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e)
    }
  }
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
