const { ethers, upgrades } = require("hardhat");

async function main() {

   const _owner = "0x1155E6509bBd1EB643800681C264F03a0De6AfdE";
   const _mintable = true;
   const _name = "Funge";
   const _symbol = "FNG";
   const _decimals = 18;
   const _initialSupply = 100_000_000;

   const [deployer] = await ethers.getSigners();

   console.log("Deploying contracts with the account:", deployer.address);
  
   console.log("Account balance:", (await deployer.getBalance()).toString());

   const gas = await ethers.provider.getGasPrice()
   console.log("Gas Price:", ethers.utils.formatEther(gas));

   const V1contract = await ethers.getContractFactory("FungeToken");
   console.log("Deploying Funge Token Contract...");

   const v1contract = await upgrades.deployProxy(V1contract, [_name, _symbol, _decimals, _initialSupply, _mintable, _owner], {
      gasPrice: gas,
      initializer: "initialize"
   });

   await v1contract.deployed();

   // const v1contract = await V1contract.deploy();
   // console.log("Funge Token Contract deployed to:", v1contract.address);
}

main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
 });