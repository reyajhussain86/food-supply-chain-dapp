const express = require("express");

const router = express.Router();
const { provider, readOnlyContract, getContractForWrite } = require("../config/web3Config");

const STAGE_NAMES = ["Farm", "Processing", "Warehouse", "Delivery", "Supermarket", "Sold"];

function toNumber(value) {
  return Number(value.toString());
}

function toIsoDate(value) {
  return new Date(toNumber(value) * 1000).toISOString();
}

function formatProduct(product) {
  const currentStage = toNumber(product.currentStage);

  return {
    id: toNumber(product.id),
    name: product.name,
    origin: product.origin,
    farmerId: product.farmerId,
    currentStage,
    currentStageName: STAGE_NAMES[currentStage],
    currentLocation: product.currentLocation,
    currentActor: product.currentActor,
    currentActorRole: product.currentActorRole,
    registeredBy: product.registeredBy,
    createdAt: toNumber(product.createdAt),
    createdAtFormatted: toIsoDate(product.createdAt),
    updatedAt: toNumber(product.updatedAt),
    updatedAtFormatted: toIsoDate(product.updatedAt),
    exists: product.exists,
  };
}

function formatHistoryEntry(entry, index) {
  const stage = toNumber(entry.stage);

  return {
    auditIndex: index,
    stage,
    stageName: STAGE_NAMES[stage],
    location: entry.location,
    actorName: entry.actorName,
    actorRole: entry.actorRole,
    actorAddress: entry.actorAddress,
    timestamp: toNumber(entry.timestamp),
    timestampFormatted: toIsoDate(entry.timestamp),
  };
}

function findEventArg(receipt, eventName, argName) {
  const eventLog = receipt.logs.find((log) => log.fragment && log.fragment.name === eventName);
  return eventLog ? eventLog.args[argName] : null;
}

async function buildProductWithHistory(productId) {
  const product = await readOnlyContract.getProduct(productId);
  const history = await readOnlyContract.getProductHistory(productId);

  return {
    ...formatProduct(product),
    history: history.map(formatHistoryEntry),
  };
}

router.get("/status", async (req, res, next) => {
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    res.json({
      ok: true,
      network: network.name,
      chainId: Number(network.chainId),
      blockNumber,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/add", async (req, res, next) => {
  try {
    const { name, origin, farmerId } = req.body;

    if (!name || !origin || !farmerId) {
      return res.status(400).json({ error: "name, origin and farmerId are required." });
    }

    const contract = getContractForWrite();
    const tx = await contract.addProduct(name, origin, farmerId);
    const receipt = await tx.wait();
    const productId = findEventArg(receipt, "ProductAdded", "productId");

    return res.status(201).json({
      message: "Product added successfully.",
      transactionHash: receipt.hash,
      product: await buildProductWithHistory(productId),
    });
  } catch (error) {
    return next(error);
  }
});

router.put("/update/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStage, location, actorName } = req.body;

    if (newStage === undefined || !location || !actorName) {
      return res.status(400).json({ error: "newStage, location and actorName are required." });
    }

    const contract = getContractForWrite();
    const tx = await contract.updateStage(id, Number(newStage), location, actorName);
    const receipt = await tx.wait();

    return res.json({
      message: "Product stage updated successfully.",
      transactionHash: receipt.hash,
      product: await buildProductWithHistory(id),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/history", async (req, res, next) => {
  try {
    const history = await readOnlyContract.getProductHistory(req.params.id);
    res.json(history.map(formatHistoryEntry));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    res.json(await buildProductWithHistory(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const ids = await readOnlyContract.getAllProductIds();
    const products = await Promise.all(ids.map((id) => buildProductWithHistory(id)));
    res.json(products);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
