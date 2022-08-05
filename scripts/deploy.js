
const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    const _name = "Funge";
    const _symbol = "Funge";
    const _beneficiary = "0x6472A63Da4581Dd9090faF7B92C09282b94a06EA";
    const _hoodlesTreasury = "0x6472A63Da4581Dd9090faF7B92C09282b94a06EA";
    const  _initialTokenURI = "https://ipfs.io/ipfs/";
    const  _hiddenTokenURI = "https://ipfs.io/ipfs/";

    // const _symbol = "CheemsxNFT";
    // const _name = "CheemsX NFT";

    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const treasuryWallet = "0xda66b6206bbaea5213A5065530858a3fD6ee1ec4";
    const Token = await ethers.getContractFactory("Funge");
    const token = await Token.deploy(treasuryWallet);
  
    console.log("StakeCheemsX address:", token.address);
    
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });