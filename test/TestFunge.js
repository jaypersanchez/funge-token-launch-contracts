const { assert, expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber =  require("bignumber.js");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");


describe("Testing of the Funge ERC20 Contract", function () {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    async function deployFungeFixture() {
        const [owner, otherAccount, addr1, addr2, spender] = await ethers.getSigners();

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

        await Funge.initialize(_name, _symbol, _decimals, _initialSupply, _mintable, owner.address);
        // console.log("Funge contract address:", Funge.address);

        return { Funge, owner, otherAccount, _mintable, addr1, addr2, spender };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { Funge, owner } = await loadFixture(deployFungeFixture);
            expect(await Funge.getOwner()).to.equal(owner.address);
        });
        it("Should set the mintable", async function () {
            const { Funge, owner, _mintable } = await loadFixture(deployFungeFixture);
            expect(await Funge.mintable()).to.equal(_mintable);
        });
        it("Should assign the total supply of tokens to the owner", async function () {
            const { Funge, owner } = await loadFixture(deployFungeFixture);
            const ownerBalance = await Funge.balanceOf(owner.address);
            expect(await Funge.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
          const { Funge, owner, addr1, addr2 } = await loadFixture(
            deployFungeFixture
          );
          // Transfer 50 tokens from owner to addr1
          await expect(
            Funge.transfer(addr1.address, 50)
          ).to.changeTokenBalances(Funge, [owner, addr1], [-50, 50]);
    
          // Transfer 50 tokens from addr1 to addr2
          // We use .connect(signer) to send a transaction from another account
          await expect(
            Funge.connect(addr1).transfer(addr2.address, 50)
          ).to.changeTokenBalances(Funge, [addr1, addr2], [-50, 50]);
        });
    
        it("should emit Transfer events", async function () {
          const { Funge, owner, addr1, addr2 } = await loadFixture(
            deployFungeFixture
          );
    
          // Transfer 50 tokens from owner to addr1
          await expect(Funge.transfer(addr1.address, 50))
            .to.emit(Funge, "Transfer")
            .withArgs(owner.address, addr1.address, 50);
    
          // Transfer 50 tokens from addr1 to addr2
          // We use .connect(signer) to send a transaction from another account
          await expect(Funge.connect(addr1).transfer(addr2.address, 50))
            .to.emit(Funge, "Transfer")
            .withArgs(addr1.address, addr2.address, 50);
        });
    
        it("Should fail if sender doesn't have enough tokens", async function () {
          const { Funge, owner, addr1 } = await loadFixture(
            deployFungeFixture
          );
          const initialOwnerBalance = await Funge.balanceOf(owner.address);
    
          // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
          // `require` will evaluate false and revert the transaction.
          await expect(
            Funge.connect(addr1).transfer(owner.address, 1)
          ).to.be.reverted;
    
          // Owner balance shouldn't have changed.
          expect(await Funge.balanceOf(owner.address)).to.equal(
            initialOwnerBalance
          );
        });
        it("Should update balances after transfers", async function () {
            const { Funge, owner, addr1, addr2 } = await loadFixture(
                deployFungeFixture
            );
			const initialOwnerBalance = await Funge.balanceOf(owner.address);

			// Transfer 100 tokens from owner to addr1.
			await Funge.transfer(addr1.address, 100);

			// Transfer another 50 tokens from owner to addr2.
			await Funge.transfer(addr2.address, 50);

			// Check balances.
			const finalOwnerBalance = await Funge.balanceOf(owner.address);
			expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

			const addr1Balance = await Funge.balanceOf(addr1.address);
			expect(addr1Balance).to.equal(100);

			const addr2Balance = await Funge.balanceOf(addr2.address);
			expect(addr2Balance).to.equal(50);
		});
    });

    describe("Mint", function () {
        it("Only owner can mint the Funge token", async function () {
            const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
            await expect(Funge.connect(otherAccount)
            .mint(50)).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Mint the token and check balance of owner", async function () {
            const { Funge, owner } = await loadFixture(deployFungeFixture);
            const initialOwnerBalance = await Funge.balanceOf(owner.address);
            // Mint
            await Funge.mint(50);
            // Owner balance should have changed.
            expect(await Funge.balanceOf(owner.address)).to.equal(
                initialOwnerBalance.add(50)
            );
        });
    });

    describe("Burn", function () {
        it("Burn the token and check balance of owner", async function () {
            const { Funge, owner } = await loadFixture(deployFungeFixture);
            const initialOwnerBalance = await Funge.balanceOf(owner.address);
            // Mint
            await Funge.burn(50);
            // Owner balance should have changed.
            expect(await Funge.balanceOf(owner.address)).to.equal(
                initialOwnerBalance.sub(50)
            );
        });
    });

    

    describe("Approve", function () {

        describe('when the spender is not the zero address', function () {
            const amount = 100;
			describe('when the sender has enough balance', function () {
                it('emits an approval event', async function () {
                    const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                    const spender = otherAccount;
                    
                    await expect(Funge.approve(spender.address, amount))
                    .to.emit(Funge, "Approval")
                    .withArgs(owner.address, spender.address, amount);
				});
                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {

                        const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                        const spender = otherAccount;

                        await Funge.approve(spender.address, amount, { from: owner.address });

                        const allowance = await Funge.allowance(owner.address, spender.address);

                        expect(allowance).to.equal(
                            amount
                        );
                    });
                });
                describe('when the spender had an approved amount', async function () {
                    const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                    const spender = otherAccount;
                    beforeEach(async function () {
                        await Funge.approve(spender.address, 1, { from: owner.address });
                    });

                    it('approves the requested amount and replaces the previous one', async function () {
                        await Funge.approve(spender.address, amount, { from: owner.address });

                        const allowance = await Funge.allowance(owner.address, spender.address);
                        expect(allowance).to.equal(
                            amount
                        );
                    });
                });
            });

            describe('when the sender does not have enough balance', async function () {
                const amount = 101;
    
                it('emits an approval event', async function () {
                    const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                    const spender = otherAccount;
    
                    const { logs } = await Funge.approve(spender.address, amount, { from: owner.address });
    
                    await expect(Funge.approve(spender.address, amount))
                    .to.emit(Funge, "Approval")
                    .withArgs(owner.address, spender.address, amount);
    
                });
    
                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                        const spender = otherAccount;
                        await Funge.approve(spender.address, amount, { from: owner.address });
    
                        const allowance = await Funge.allowance(owner.address, spender.address);
                        expect(allowance).to.equal(
                            amount
                        );
                    });
                });
    
                describe('when the spender had an approved amount', async function () {
                    const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                    const spender = otherAccount;
                    beforeEach(async function () {
                        await Funge.approve(spender.address, 1, { from: owner.address });
                    });
    
                    it('approves the requested amount and replaces the previous one', async function () {
                        await Funge.approve(spender.address, amount, { from: owner.address });
    
                        const allowance = await Funge.allowance(owner.address, spender.address);
                        expect(allowance).to.equal(
                            amount
                        );
                    });
                });
            });
        });

        describe('when the spender is the zero address', function () {
			const amount = 100;
			const spender = ZERO_ADDRESS;
			it('approves the requested amount', async function () {
                const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                await expect(Funge.approve(spender, amount, { from: owner.address })).to.be.revertedWith("ERC20: approve to the zero address");
			});
		});

    });

    describe("Transfer From", function () {


        const amount = 100;
        describe('when the recipient is not the zero address', async function () {

            describe('when the spender has enough approved balance', async function () {
            
                it("transfers the requested amount", async function () {
                    const { Funge, owner, otherAccount, addr1 } = await loadFixture(deployFungeFixture);
                    const initialOwnerBalance = await Funge.balanceOf(owner.address);
                    await Funge.approve(otherAccount.address, amount, { from: owner.address });
                    await Funge.connect(otherAccount).transferFrom(owner.address, addr1.address, amount,  { from: otherAccount.address });

                    // Owner balance should have changed.
                    expect(await Funge.balanceOf(owner.address)).to.equal(
                        initialOwnerBalance.sub(amount)
                    );

                    const recipientBalance = await Funge.balanceOf(addr1.address);
                    expect(recipientBalance).to.equal(
                        amount
                    );
                });

                it('decreases the spender allowance', async function () {
                    const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                    await Funge.approve(otherAccount.address, amount, { from: owner.address });
                    await Funge.connect(otherAccount).transferFrom(owner.address, spender.address, amount, { from: otherAccount.address });

                    const allowance = await Funge.allowance(owner.address, otherAccount.address);
                    expect(allowance).to.equal(
                        0
                    );
                });

                it('emits a transfer event', async function () {
                    const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                    const initialOwnerBalance = await Funge.balanceOf(owner.address);

                    await Funge.approve(otherAccount.address, amount, { from: owner.address });

                    await expect(Funge.connect(otherAccount).transferFrom(owner.address, spender.address, amount, { from: otherAccount.address }))
                    .to.emit(Funge, "Transfer")
                    .withArgs(owner.address, spender.address, amount);
                });

            });
            describe('when the owner does not have enough balance', function () {
                const amount = 99;
                it('reverts', async function () {
                    const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                    await Funge.approve(otherAccount.address, amount, { from: owner.address });
                    const initialOwnerBalance = await Funge.balanceOf(owner.address);
                    await expect(Funge.connect(otherAccount).transferFrom(owner.address, spender.address, 100, { from: otherAccount.address })).to.be.reverted;
                });
            });
        });
        describe('when the spender does not have enough approved balance', function () {

                describe('when the owner has enough balance', function () {
                    const amount = 100;

                    it('reverts', async function () {
                        const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                        await Funge.approve(otherAccount.address, 99, { from: owner.address });
                        await expect(Funge.connect(otherAccount).transferFrom(owner.address, spender.address, amount, { from: otherAccount.address })).to.be.reverted;
                    });
                });

                describe('when the owner does not have enough balance', function () {
                    const amount = 101;

                    it('reverts', async function () {
                        const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                        await Funge.approve(otherAccount.address, 99, { from: owner.address });
                        await expect(Funge.connect(otherAccount).transferFrom(owner.address, spender.address, amount, { from: otherAccount.address })).to.be.reverted;
                    });
                });
            });
            describe('when the recipient is the zero address', function () {
                const amount = 100;
                const to = ZERO_ADDRESS;
    
                it('reverts', async function () {
                    const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                    await Funge.approve(otherAccount.address, amount, { from: owner.address });
                    // await expect(Funge.approve(to, amount, { from: owner.address })).to.be.revertedWith("ERC20: approve to the zero address");

                    await expect(Funge.connect(otherAccount).transferFrom(owner.address, to, amount, { from: otherAccount.address })).to.be.reverted;
                });
            });
        });

        describe('Decrease approval', function () {
            describe('when the spender is not the zero address', function () {
    
                describe('when the sender has enough balance', function () {
                    const amount = 100;
    
                    it('emits an approval event', async function () {
                        const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);

                        await Funge.approve(spender.address, amount, { from: owner.address });

                        const { logs } = await Funge.decreaseAllowance(spender.address, amount, { from: owner.address });
                        await expect(Funge.approve(spender.address, amount))
                        .to.emit(Funge, "Approval")
                        .withArgs(owner.address, spender.address, amount);
    
                    });
    
                    describe('when there was no approved amount before', function () {
                        it('keeps the allowance to zero', async function () {
                            const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                            await Funge.approve(spender.address, amount, { from: owner.address });
                            await Funge.decreaseAllowance(spender.address, amount, { from: owner.address });
    
                            const allowance = await Funge.allowance(owner.address, spender.address);
                            assert.equal(allowance, 0);
                        });
                    });
    
                    describe('when the spender had an approved amount', function () {
                        
                        it('decreases the spender allowance subtracting the requested amount', async function () {
                            const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                            await Funge.approve(spender.address, amount + 1, { from: owner.address });
                            
                            await Funge.decreaseAllowance(spender.address, amount, { from: owner.address });
    
                            const allowance = await Funge.allowance(owner.address, spender.address);
                            assert.equal(allowance, 1);
                        });
                    });
                });
    
                describe('when the sender does not have enough balance', function () {
                    const amount = 101;
    
                    it('emits an approval event', async function () {
                        const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                        await Funge.approve(spender.address, amount, { from: owner.address });
                        const { logs } = await Funge.decreaseAllowance(spender.address, amount, { from: owner.address });
    
                        await expect(Funge.approve(spender.address, amount))
                        .to.emit(Funge, "Approval")
                        .withArgs(owner.address, spender.address, amount);
                    });
    
                    describe('when there was no approved amount before', function () {
                        it('keeps the allowance to zero', async function () {
                            const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                            await Funge.approve(spender.address, amount, { from: owner.address });
                            await Funge.decreaseAllowance(spender.address, amount, { from: owner.address });
    
                            const allowance = await Funge.allowance(owner.address, spender.address);
                            expect(allowance).to.equal(
                                0
                            );
                        });
                    });
    
                    describe('when the spender had an approved amount', function () {
    
                        it('decreases the spender allowance subtracting the requested amount', async function () {
                            const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                            await Funge.approve(spender.address, amount + 1, { from: owner.address });
                            await Funge.decreaseAllowance(spender.address, amount, { from: owner.address });
    
                            const allowance = await Funge.allowance(owner.address, spender.address);
                            expect(allowance).to.equal(
                                1
                            );
                        });
                    });
                });
            });
    
            describe('when the spender is the zero address', function () {
                const amount = 100;
                const spender = ZERO_ADDRESS;
    
                it('decreases the requested amount', async function () {
                    const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                    await expect(Funge.approve(spender, amount, { from: owner.address })).to.be.revertedWith("ERC20: approve to the zero address");
                    // await Funge.approve(spender.address, amount, { from: owner.address });

                    // await Funge.decreaseAllowance(spender.address, amount, { from: owner.address });
    
                    // const allowance = await Funge.allowance(owner.address, spender);
                    // expect(allowance).to.equal(
                    //     0
                    // );
                });
    
                it('emits an approval event', async function () {
                    const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);

                    await expect(Funge.approve(spender, amount, { from: owner.address })).to.be.revertedWith("ERC20: approve to the zero address");
                    // await Funge.approve(spender.address, amount, { from: owner.address });
                    // const { logs } = await Funge.decreaseAllowance(spender.address, amount, { from: owner.address });
    
                    // await expect(Funge.approve(spender.address, amount))
                    // .to.emit(Funge, "Approval")
                    // .withArgs(owner.address, spender.address, amount);
                });
            });
        });

        describe('Increase approval', function () {
            const amount = 100;
    
            describe('when the spender is not the zero address', function () {
    
                describe('when the sender has enough balance', function () {
                    it('emits an approval event', async function () {

                        const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);

                        const { logs } = await Funge.increaseAllowance(spender.address, amount, { from: owner.address });
    
                        await expect(Funge.approve(spender.address, amount))
                        .to.emit(Funge, "Approval")
                        .withArgs(owner.address, spender.address, amount);
                    });
    
                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                            await Funge.increaseAllowance(spender.address, amount, { from: owner.address });
    
                            const allowance = await Funge.allowance(owner.address, spender.address);
                            expect(allowance).to.equal(
                                amount
                            );
                        });
                    });
    
                    describe('when the spender had an approved amount', function () {
                       
    
                        it('increases the spender allowance adding the requested amount', async function () {
                            const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                            await Funge.approve(spender.address, 1, { from: owner.address });
                            await Funge.increaseAllowance(spender.address, amount, { from: owner.address });
    
                            const allowance = await Funge.allowance(owner.address, spender.address);
                            expect(allowance).to.equal(
                                amount + 1
                            );
                            
                        });
                    });
                });
    
                describe('when the sender does not have enough balance', function () {
                    const amount = 101;
    
                    it('emits an approval event', async function () {
                        const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                        const { logs } = await Funge.increaseAllowance(spender.address, amount, { from: owner.address });
    
                        await expect(Funge.approve(spender.address, amount))
                        .to.emit(Funge, "Approval")
                        .withArgs(owner.address, spender.address, amount);
                    });
    
                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                            await Funge.increaseAllowance(spender.address, amount, { from: owner.address });
    
                            const allowance = await Funge.allowance(owner.address, spender.address);
                            expect(allowance).to.equal(
                                amount
                            );
                        });
                    });
    
                    describe('when the spender had an approved amount', function () {
                        it('increases the spender allowance adding the requested amount', async function () {
                            const { Funge, owner, otherAccount, spender } = await loadFixture(deployFungeFixture);
                            await Funge.approve(spender.address, 1, { from: owner.address });
                            await Funge.increaseAllowance(spender.address, amount, { from: owner.address });
    
                            const allowance = await Funge.allowance(owner.address, spender.address);
                            expect(allowance).to.equal(
                                amount + 1
                            );
                        });
                    });
                });
            });
    
            describe('when the spender is the zero address', function () {
                const spender = ZERO_ADDRESS;
    
                it('approves the requested amount', async function () {
                    const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                    await expect(Funge.approve(spender, amount, { from: owner.address })).to.be.revertedWith("ERC20: approve to the zero address");
                });
    
                it('emits an approval event', async function () {
                    const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                    await expect(Funge.approve(spender, amount, { from: owner.address })).to.be.revertedWith("ERC20: approve to the zero address");
                });
            });
        });

        describe('TransferOwnership', function () {

            it("Only owner can change old owner to new owner", async function () {
                const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                await expect(Funge.connect(otherAccount)
                .transferOwnership(otherAccount.address)).to.be.revertedWith("Ownable: caller is not the owner");
            });

            it('Change owner and check new owner', async function () {
                const { Funge, owner, otherAccount } = await loadFixture(deployFungeFixture);
                await Funge.transferOwnership(otherAccount.address);

                expect(await Funge.getOwner()).to.be.equal(otherAccount.address);
            });
        });

    });