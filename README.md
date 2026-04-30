# Food Supply Chain Tracker DApp

A complete hybrid decentralized application for tracking food products through the full farm-to-fork supply chain:

Farmer -> Processor -> Warehouse -> Delivery -> Supermarket -> Sold

The project uses Solidity, Ethereum Sepolia, Hardhat, Node.js, Express.js, Ethers.js, MetaMask, HTML, CSS and JavaScript.

## 1. Project Structure

```text
food-supply-chain-dapp/
├── contracts/FoodSupplyChain.sol
├── scripts/deploy.js
├── test/FoodSupplyChain.test.js
├── backend/
│   ├── server.js
│   ├── routes/product.js
│   └── config/
│       ├── web3Config.js
│       └── contractConfig.js
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── hardhat.config.js
├── package.json
├── .env
├── .gitignore
├── .eslintrc.json
└── TECHNICAL_REPORT.md
```

## 2. Prerequisites

Install these tools before running the DApp:

- Node.js 20 LTS or newer
- npm
- Git
- MetaMask browser extension
- A Sepolia RPC URL from Infura or Alchemy
- Sepolia test ETH from a Sepolia faucet

## 3. Install Dependencies

```bash
cd food-supply-chain-dapp
npm install
```

## 4. Configure Environment Variables

Open `.env` and set:

```env
PORT=3000
NODE_ENV=development
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_OR_ALCHEMY_PROJECT_ID
PRIVATE_KEY=YOUR_TEST_WALLET_PRIVATE_KEY_WITHOUT_0x
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

Important: use a test wallet only. Never commit or share a wallet containing real funds.

## 5. Compile the Smart Contract

```bash
npm run compile
```

This compiles `contracts/FoodSupplyChain.sol` using Solidity `0.8.20`.

## 6. Run Smart Contract Tests

```bash
npm test
```

The tests verify product registration, valid stage progression, skipped-stage rejection and product ID listing.

## 7. Deploy to Sepolia

Make sure your `.env` file contains a valid `SEPOLIA_RPC_URL` and `PRIVATE_KEY`, then run:

```bash
npm run deploy:sepolia
```

The deployment script prints the deployed contract address and updates `backend/config/contractConfig.js` automatically. Copy the deployed address into `.env` as `CONTRACT_ADDRESS`.

## 8. Start the Back-End and Front-End

```bash
npm start
```

Open:

```text
http://localhost:3000
```

The Express server hosts the REST API and the static front-end.

## 9. MetaMask Setup

1. Open MetaMask.
2. Select Sepolia test network.
3. Use the same account that has Sepolia test ETH.
4. Open `http://localhost:3000`.
5. Click `Connect MetaMask`.

Add/update actions are signed in MetaMask. Dashboard and tracking data are read from the Express API.

## 10. REST API Endpoints

```text
POST /api/product/add
PUT /api/product/update/:id
GET /api/product/:id
GET /api/product/:id/history
GET /api/products
GET /api/product/status
GET /api/config
```

Example add request:

```json
{
  "name": "Organic Apples",
  "origin": "Kent Farm, UK",
  "farmerId": "FARMER-001"
}
```

Example update request:

```json
{
  "newStage": 1,
  "location": "London Processing Plant",
  "actorName": "UEL Foods Ltd"
}
```

## 11. Supply Chain Stages

| Value | Stage | Actor Role |
| --- | --- | --- |
| 0 | Farm | Farmer |
| 1 | Processing | Processor |
| 2 | Warehouse | Warehouse Manager |
| 3 | Delivery | Delivery Driver |
| 4 | Supermarket | Supermarket Manager |
| 5 | Sold | Customer |

The smart contract requires products to move forward by exactly one stage each time. This prevents a product from jumping directly from farm to delivery and protects audit trail quality.

## 12. Code Quality

Run ESLint:

```bash
npm run lint
```

The repository is ready to push to GitHub:

```bash
git init
git add .
git commit -m "All files uploaded"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## 13. Common Issues

`Backend not connected`: check `SEPOLIA_RPC_URL` and internet connectivity.

`Deploy the smart contract first`: deploy to Sepolia and set `CONTRACT_ADDRESS`.

`insufficient funds`: request Sepolia test ETH for the deploying/signing wallet.

`Stage must advance by one step`: choose the next stage only. For example, a Farm product must move to Processing before Warehouse.

