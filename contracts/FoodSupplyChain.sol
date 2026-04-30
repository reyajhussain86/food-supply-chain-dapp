// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Food Supply Chain Tracker
/// @author University coursework implementation
/// @notice Tracks food products from farm registration through final sale.
contract FoodSupplyChain {
    /// @notice Ordered supply-chain stages used throughout the DApp.
    enum Stage {
        FARM,
        PROCESSING,
        WAREHOUSE,
        DELIVERY,
        SUPERMARKET,
        SOLD
    }

    /// @notice One immutable audit entry for a product stage change.
    struct HistoryEntry {
        Stage stage;
        string location;
        string actorName;
        string actorRole;
        address actorAddress;
        uint256 timestamp;
    }

    /// @notice Product state returned by getProduct.
    struct Product {
        uint256 id;
        string name;
        string origin;
        string farmerId;
        Stage currentStage;
        string currentLocation;
        string currentActor;
        string currentActorRole;
        address registeredBy;
        uint256 createdAt;
        uint256 updatedAt;
        bool exists;
    }

    uint256 private nextProductId = 1;
    uint256[] private productIds;

    mapping(uint256 => Product) private products;
    mapping(uint256 => HistoryEntry[]) private productHistories;

    event ProductAdded(
        uint256 indexed productId,
        string name,
        string origin,
        string farmerId,
        address indexed farmerAddress,
        uint256 timestamp
    );

    event StageUpdated(
        uint256 indexed productId,
        Stage indexed newStage,
        string location,
        string actorName,
        string actorRole,
        address indexed actorAddress,
        uint256 timestamp
    );

    /// @notice Register a new food product at the FARM stage.
    /// @param name Name of the product, for example "Organic Apples".
    /// @param origin Farm or origin location.
    /// @param farmerId Farmer identifier used by the coursework system.
    /// @return productId The blockchain ID assigned to the new product.
    function addProduct(
        string calldata name,
        string calldata origin,
        string calldata farmerId
    ) external returns (uint256 productId) {
        require(bytes(name).length > 0, "Product name is required");
        require(bytes(origin).length > 0, "Origin is required");
        require(bytes(farmerId).length > 0, "Farmer ID is required");

        productId = nextProductId;
        nextProductId += 1;

        products[productId] = Product({
            id: productId,
            name: name,
            origin: origin,
            farmerId: farmerId,
            currentStage: Stage.FARM,
            currentLocation: origin,
            currentActor: farmerId,
            currentActorRole: "Farmer",
            registeredBy: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });

        productIds.push(productId);

        productHistories[productId].push(
            HistoryEntry({
                stage: Stage.FARM,
                location: origin,
                actorName: farmerId,
                actorRole: "Farmer",
                actorAddress: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit ProductAdded(productId, name, origin, farmerId, msg.sender, block.timestamp);
    }

    /// @notice Move a product to the next stage and append an audit entry.
    /// @dev Stages must advance by exactly one step to protect audit integrity.
    /// @param productId Product ID created by addProduct.
    /// @param newStage Numeric stage: FARM=0, PROCESSING=1, WAREHOUSE=2, DELIVERY=3, SUPERMARKET=4, SOLD=5.
    /// @param location Current location for this stage.
    /// @param actorName Human-readable name of the actor making the update.
    function updateStage(
        uint256 productId,
        Stage newStage,
        string calldata location,
        string calldata actorName
    ) external {
        require(products[productId].exists, "Product does not exist");
        require(bytes(location).length > 0, "Location is required");
        require(bytes(actorName).length > 0, "Actor name is required");
        require(products[productId].currentStage != Stage.SOLD, "Product already sold");
        require(
            uint8(newStage) == uint8(products[productId].currentStage) + 1,
            "Stage must advance by one step"
        );

        string memory actorRole = getActorRole(newStage);

        Product storage product = products[productId];
        product.currentStage = newStage;
        product.currentLocation = location;
        product.currentActor = actorName;
        product.currentActorRole = actorRole;
        product.updatedAt = block.timestamp;

        productHistories[productId].push(
            HistoryEntry({
                stage: newStage,
                location: location,
                actorName: actorName,
                actorRole: actorRole,
                actorAddress: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit StageUpdated(productId, newStage, location, actorName, actorRole, msg.sender, block.timestamp);
    }

    /// @notice Return complete product details for one product ID.
    function getProduct(uint256 productId) external view returns (Product memory) {
        require(products[productId].exists, "Product does not exist");
        return products[productId];
    }

    /// @notice Return the full audit trail for one product ID.
    function getProductHistory(uint256 productId) external view returns (HistoryEntry[] memory) {
        require(products[productId].exists, "Product does not exist");
        return productHistories[productId];
    }

    /// @notice Return every product ID registered in this contract.
    function getAllProductIds() external view returns (uint256[] memory) {
        return productIds;
    }

    /// @notice Return the total product count for dashboard summaries.
    function getProductCount() external view returns (uint256) {
        return productIds.length;
    }

    /// @notice Translate a stage into the actor role expected at that point.
    function getActorRole(Stage stage) public pure returns (string memory) {
        if (stage == Stage.FARM) return "Farmer";
        if (stage == Stage.PROCESSING) return "Processor";
        if (stage == Stage.WAREHOUSE) return "Warehouse Manager";
        if (stage == Stage.DELIVERY) return "Delivery Driver";
        if (stage == Stage.SUPERMARKET) return "Supermarket Manager";
        return "Customer";
    }
}
