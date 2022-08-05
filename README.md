# Funge Smart Contracts

- Funge ERC20 token contract
- Funge Seed Sale vesting contract
- Funge Private Sale vesting contract
- Funge Airdrop Contract
- Funge Reward Contract
- Funge ERC721 NFT


### Development

#### Setup

Install dependencies with [Yarn](https://yarnpkg.com/en/):

```bash
yarn install
```


#### Testing

Run local node to provide a simulated EVM:

```bash
npx hardhat node
```

In a separate terminal, run the testsuite:

```bash
npx hardhat test
```
#### Deployment

Edit [hardhat.config.js](hardhat.config.js) and then run:

```bash
npx hardhat run --network [network] [script]
```

#### Verify Smart Contract

```bash
npx hardhat verify --network [network] [address] [unlock time]
```
