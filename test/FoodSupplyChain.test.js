const { expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { ethers } = require("hardhat");

describe("FoodSupplyChain", function () {
  async function deployFixture() {
    const [owner, processor] = await ethers.getSigners();
    const FoodSupplyChain = await ethers.getContractFactory("FoodSupplyChain");
    const contract = await FoodSupplyChain.deploy();
    await contract.waitForDeployment();

    return { contract, owner, processor };
  }

  it("registers a product at the FARM stage", async function () {
    const { contract, owner } = await deployFixture();

    await expect(contract.addProduct("Organic Apples", "Kent Farm", "FARMER-001"))
      .to.emit(contract, "ProductAdded")
      .withArgs(1, "Organic Apples", "Kent Farm", "FARMER-001", owner.address, anyValue);

    const product = await contract.getProduct(1);
    expect(product.name).to.equal("Organic Apples");
    expect(product.origin).to.equal("Kent Farm");
    expect(product.currentStage).to.equal(0);
    expect(product.currentActorRole).to.equal("Farmer");
  });

  it("updates a product through the next valid stage", async function () {
    const { contract, processor } = await deployFixture();

    await contract.addProduct("Milk", "Essex Dairy Farm", "FARMER-002");
    await expect(contract.connect(processor).updateStage(1, 1, "London Processing Plant", "UEL Foods Ltd"))
      .to.emit(contract, "StageUpdated");

    const product = await contract.getProduct(1);
    expect(product.currentStage).to.equal(1);
    expect(product.currentLocation).to.equal("London Processing Plant");
    expect(product.currentActor).to.equal("UEL Foods Ltd");
    expect(product.currentActorRole).to.equal("Processor");

    const history = await contract.getProductHistory(1);
    expect(history).to.have.lengthOf(2);
  });

  it("rejects skipped stages to preserve the audit trail", async function () {
    const { contract } = await deployFixture();

    await contract.addProduct("Coffee Beans", "Colombian Farm", "FARMER-003");
    await expect(contract.updateStage(1, 3, "Delivery Hub", "Driver A"))
      .to.be.revertedWith("Stage must advance by one step");
  });

  it("returns every registered product ID", async function () {
    const { contract } = await deployFixture();

    await contract.addProduct("Rice", "Lincolnshire Farm", "FARMER-004");
    await contract.addProduct("Tomatoes", "Norfolk Farm", "FARMER-005");

    const ids = await contract.getAllProductIds();
    expect(ids.map((id) => Number(id))).to.deep.equal([1, 2]);
  });
});
