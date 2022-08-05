const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber =  require("bignumber.js");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");


describe("Testing of the Funge Vesting Contract", function () {

    async function deployFungeVestingFixture() {
        const [owner, otherAccount] = await ethers.getSigners();

        const _mintable = true;
        const _name = "Funge";
        const _symbol = "FNG";
        const _decimals = 18;
        const _initialSupply = 100_000_000;

    
        // console.log("Deploying contracts with the accounts:", owner.address, otherAccount.address);
        // console.log("Account balance:", (await owner.getBalance()).toString());
        
        const gas = await ethers.provider.getGasPrice();
        // console.log("Gas Price:", ethers.utils.formatEther(gas));

        const FungeFactory = await ethers.getContractFactory("FungeToken");
        const Funge = await FungeFactory.deploy();
        const FungeAddress = Funge.address;
        

        const FungeVestingFactory = await ethers.getContractFactory("FungeVesting");
        const FungeVesting = await FungeVestingFactory.deploy();

        await Funge.initialize(_name, _symbol, _decimals, _initialSupply, _mintable, FungeVesting.address);
        await FungeVesting.initialize(FungeAddress);

        const _beneficiary = ethers.utils.getAddress("0x1155E6509bBd1EB643800681C264F03a0De6AfdE");
        const _start = ethers.BigNumber.from(1659460043);
        const _cliff = 1;
        const _duration = ethers.BigNumber.from(31556926);
        const _slicePeriodSeconds = 1;
        const _revocable = true;
        const _amount = ethers.BigNumber.from("10000000000000000000");

        await FungeVesting.createVestingSchedule(_beneficiary, _start, _cliff, _duration, _slicePeriodSeconds, _revocable, _amount);
        await FungeVesting.createVestingSchedule(_beneficiary, _start, _cliff, _duration, _slicePeriodSeconds, false, _amount);

        const tempSchedule = await FungeVesting.getVestingIdAtIndex(0);
        const temp1Schedule = await FungeVesting.getVestingIdAtIndex(1);

        // console.log("FungeVesting contract address:", FungeVesting.address);
        // console.log("Balance of the FungeVesting:", await Funge.balanceOf(FungeVesting.address));

        return { FungeVesting, owner, otherAccount, FungeAddress, tempSchedule, temp1Schedule, Funge };
    }

    describe("Deployment", function () {
        it("Should set the right Funge ERC20 token", async function () {
            const { FungeVesting, owner, otherAccount, FungeAddress } = await loadFixture(deployFungeVestingFixture);

            expect(await FungeVesting.getToken()).to.equal(FungeAddress);
        });

        it("Should set the right owner", async function () {
            const { FungeVesting, owner } = await loadFixture(deployFungeVestingFixture);
      
            expect(await FungeVesting.owner()).to.equal(owner.address);
        });
    });

    describe("Create Vesting Schdule", function () {
        it("Only owner can add the vesting schedule data", async function () {

            const _beneficiary = ethers.utils.getAddress("0x1155E6509bBd1EB643800681C264F03a0De6AfdE");
            const _start = ethers.BigNumber.from(1659460043);
            const _cliff = 10;
            const _duration = ethers.BigNumber.from(31556926);
            const _slicePeriodSeconds = 10;
            const _revocable = true;
            const _amount = ethers.BigNumber.from("10000000000000000000");
            const { FungeVesting, owner, otherAccount, FungeAddress } = await loadFixture(deployFungeVestingFixture);

            await expect(FungeVesting.connect(otherAccount)
            .createVestingSchedule(_beneficiary, _start, _cliff, _duration, _slicePeriodSeconds, _revocable, _amount)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        // it("FungeVesting cannot create vesting schedule because not sufficient tokens", async function () {

        //     const _beneficiary = ethers.utils.getAddress("0x1155E6509bBd1EB643800681C264F03a0De6AfdE");
        //     const _start = ethers.BigNumber.from(1659460043);
        //     const _cliff = 10;
        //     const _duration = ethers.BigNumber.from(31556926);
        //     const _slicePeriodSeconds = 10;
        //     const _revocable = true;
        //     const _amount = ethers.BigNumber.from("10000000000000000000");
        //     const { FungeVesting, owner, otherAccount, FungeAddress, Funge } = await loadFixture(deployFungeVestingFixture);

        //     await expect(FungeVesting
        //     .createVestingSchedule(_beneficiary, _start, _cliff, _duration, _slicePeriodSeconds, _revocable, _amount))
        //     .to.be.revertedWith("FungeVesting: cannot create vesting schedule because not sufficient tokens");
        // });
    });

    describe("Release Vesting Schdule", function () {
        it("Only owner can release the vesting schedule to each users", async function () {

            const { FungeVesting, owner, otherAccount, FungeAddress } = await loadFixture(deployFungeVestingFixture);

            await expect(FungeVesting.connect(otherAccount)
            .releaseAll()).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Revoke Vesting Schdule", function () {
        it("Only owner can release the vesting schedule to each users", async function () {

            const { FungeVesting, owner, otherAccount, FungeAddress, tempSchedule} = await loadFixture(deployFungeVestingFixture);

            await expect(FungeVesting.connect(otherAccount)
            .revoke(tempSchedule)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Whether or not the Vesting Schedule can revoke", async function () {

            const { FungeVesting, owner, otherAccount, FungeAddress, temp1Schedule} = await loadFixture(deployFungeVestingFixture);

            await expect(FungeVesting
            .revoke(temp1Schedule)).to.be.revertedWith("FungeVesting: vesting is not revocable");
        });
    });

    describe("Withdraw the Funge", function () {
        it("Only owner can withdraw the specified amount of Funge Token", async function () {

            const amount = 10;

            const { FungeVesting, owner, otherAccount, FungeAddress, tempSchedule } = await loadFixture(deployFungeVestingFixture);

            await expect(FungeVesting.connect(otherAccount)
            .withdraw(amount)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("FungeVesting have not enough withdrawable funds", async function () {

            const { FungeVesting, owner, otherAccount, FungeAddress, tempSchedule, Funge } = await loadFixture(deployFungeVestingFixture);

            const amount = Funge.balanceOf(FungeVesting.address);

            await expect(FungeVesting
            .withdraw(amount)).to.be.revertedWith("FungeVesting: not enough withdrawable funds");
        });
    });

    
});