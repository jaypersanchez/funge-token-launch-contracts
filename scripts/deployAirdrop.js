const { ethers, upgrades } = require("hardhat");
const BigNumber =  require("bignumber.js");

async function main() {

   const [deployer] = await ethers.getSigners();

   console.log("Deploying contracts with the account:", deployer.address);
  
   console.log("Account balance:", (await deployer.getBalance()).toString());

   const gas = await ethers.provider.getGasPrice()
   console.log("Gas Price: ", new BigNumber(gas).toString());

   const V1contract = await ethers.getContractFactory("V1");
   console.log("Deploying V1contract...");
   const v1contract = await upgrades.deployProxy(V1contract, [10], {
      initializer: "initialValue",
   });
   await v1contract.deployed();
   console.log("V1 Contract deployed to:", v1contract.address);
}

main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
 });