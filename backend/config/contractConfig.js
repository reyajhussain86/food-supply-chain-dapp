const contractAddress = "0xa49710Da21A9eF88AF0e4db8355b7567FDbee207";

const contractAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "origin",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "farmerId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "farmerAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ProductAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "enum FoodSupplyChain.Stage",
        "name": "newStage",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "actorName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "actorRole",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "actorAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "StageUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "origin",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "farmerId",
        "type": "string"
      }
    ],
    "name": "addProduct",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum FoodSupplyChain.Stage",
        "name": "stage",
        "type": "uint8"
      }
    ],
    "name": "getActorRole",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllProductIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      }
    ],
    "name": "getProduct",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "origin",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "farmerId",
            "type": "string"
          },
          {
            "internalType": "enum FoodSupplyChain.Stage",
            "name": "currentStage",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "currentLocation",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "currentActor",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "currentActorRole",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "registeredBy",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "updatedAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct FoodSupplyChain.Product",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProductCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      }
    ],
    "name": "getProductHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "enum FoodSupplyChain.Stage",
            "name": "stage",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "actorName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "actorRole",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "actorAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct FoodSupplyChain.HistoryEntry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      },
      {
        "internalType": "enum FoodSupplyChain.Stage",
        "name": "newStage",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "actorName",
        "type": "string"
      }
    ],
    "name": "updateStage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

module.exports = {
  contractAddress,
  contractAbi,
};
