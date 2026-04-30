const API_BASE = "";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const stages = [
  { name: "Farm", role: "Farmer" },
  { name: "Processing", role: "Processor" },
  { name: "Warehouse", role: "Warehouse Manager" },
  { name: "Delivery", role: "Delivery Driver" },
  { name: "Supermarket", role: "Supermarket Manager" },
  { name: "Sold", role: "Customer" },
];

const state = {
  config: null,
  provider: null,
  signer: null,
  contract: null,
  walletAddress: null,
  products: [],
};

const els = {
  addProductForm: document.getElementById("addProductForm"),
  updateStageForm: document.getElementById("updateStageForm"),
  trackForm: document.getElementById("trackForm"),
  connectWalletBtn: document.getElementById("connectWalletBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  walletAddress: document.getElementById("walletAddress"),
  chainStatus: document.getElementById("chainStatus"),
  chainText: document.getElementById("chainText"),
  blockNumber: document.getElementById("blockNumber"),
  totalProducts: document.getElementById("totalProducts"),
  latestStage: document.getElementById("latestStage"),
  productsList: document.getElementById("productsList"),
  globalPipeline: document.getElementById("globalPipeline"),
  trackResult: document.getElementById("trackResult"),
  historyList: document.getElementById("historyList"),
  toast: document.getElementById("toast"),
};

document.addEventListener("DOMContentLoaded", async () => {
  registerEvents();
  renderPipeline(0, els.globalPipeline);
  await loadConfig();
  await loadBlockchainStatus();
  await loadProducts();
});

function registerEvents() {
  els.connectWalletBtn.addEventListener("click", connectWallet);
  els.refreshBtn.addEventListener("click", refreshDashboard);
  els.addProductForm.addEventListener("submit", handleAddProduct);
  els.updateStageForm.addEventListener("submit", handleUpdateStage);
  els.trackForm.addEventListener("submit", handleTrackProduct);

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => window.location.reload());
    window.ethereum.on("chainChanged", () => window.location.reload());
  }
}

async function loadConfig() {
  const response = await fetch(`${API_BASE}/api/config`);
  state.config = await response.json();
}

async function loadBlockchainStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/product/status`);
    const status = await response.json();

    if (!response.ok) {
      throw new Error(status.error || "Blockchain status unavailable");
    }

    els.chainStatus.className = "status-dot connected";
    els.chainText.textContent = `${status.network || "Sepolia"} (${status.chainId})`;
    els.blockNumber.textContent = status.blockNumber;
  } catch (error) {
    els.chainStatus.className = "status-dot error";
    els.chainText.textContent = "Backend not connected";
    showToast(error.message);
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    showToast("MetaMask is required. Install the browser extension and try again.");
    return;
  }

  if (!state.config || state.config.contractAddress === ZERO_ADDRESS) {
    showToast("Deploy the smart contract first, then update CONTRACT_ADDRESS in .env.");
    return;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  state.provider = new ethers.BrowserProvider(window.ethereum);
  state.signer = await state.provider.getSigner();
  state.walletAddress = await state.signer.getAddress();
  state.contract = new ethers.Contract(
    state.config.contractAddress,
    state.config.contractAbi,
    state.signer,
  );

  els.walletAddress.textContent = shortenAddress(state.walletAddress);
  els.connectWalletBtn.textContent = "Wallet Connected";
  showToast("MetaMask connected successfully.");
}

async function handleAddProduct(event) {
  event.preventDefault();
  await ensureWalletReady();

  const name = document.getElementById("productName").value.trim();
  const origin = document.getElementById("origin").value.trim();
  const farmerId = document.getElementById("farmerId").value.trim();

  try {
    setButtonLoading(event.submitter, true);
    const tx = await state.contract.addProduct(name, origin, farmerId);
    showToast("Transaction submitted. Waiting for confirmation...");
    await tx.wait();
    els.addProductForm.reset();
    await refreshDashboard();
    showToast("Product registered on the blockchain.");
  } catch (error) {
    showToast(readableError(error));
  } finally {
    setButtonLoading(event.submitter, false);
  }
}

async function handleUpdateStage(event) {
  event.preventDefault();
  await ensureWalletReady();

  const productId = document.getElementById("updateProductId").value;
  const newStage = document.getElementById("newStage").value;
  const location = document.getElementById("stageLocation").value.trim();
  const actorName = document.getElementById("actorName").value.trim();

  try {
    setButtonLoading(event.submitter, true);
    const tx = await state.contract.updateStage(productId, Number(newStage), location, actorName);
    showToast("Stage update submitted. Waiting for confirmation...");
    await tx.wait();
    els.updateStageForm.reset();
    await refreshDashboard();
    await displayProduct(productId);
    showToast("Product stage updated on the blockchain.");
  } catch (error) {
    showToast(readableError(error));
  } finally {
    setButtonLoading(event.submitter, false);
  }
}

async function handleTrackProduct(event) {
  event.preventDefault();
  const productId = document.getElementById("trackProductId").value;
  await displayProduct(productId);
}

async function refreshDashboard() {
  await loadBlockchainStatus();
  await loadProducts();
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/api/products`);
    const products = await response.json();

    if (!response.ok) {
      throw new Error(products.error || "Unable to load products");
    }

    state.products = products;
    renderProducts(products);
    updateSummary(products);
  } catch (error) {
    els.productsList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}

async function displayProduct(productId) {
  try {
    const response = await fetch(`${API_BASE}/api/product/${productId}`);
    const product = await response.json();

    if (!response.ok) {
      throw new Error(product.error || "Product not found");
    }

    els.trackResult.innerHTML = renderProductCard(product, true);
    renderHistory(product.history);
    renderPipeline(product.currentStage, els.globalPipeline);
  } catch (error) {
    els.trackResult.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    els.historyList.innerHTML = "";
  }
}

function renderProducts(products) {
  if (!products.length) {
    els.productsList.innerHTML = "<div class=\"empty-state\">No products registered yet.</div>";
    return;
  }

  els.productsList.innerHTML = products.map((product) => renderProductCard(product)).join("");

  document.querySelectorAll("[data-track-id]").forEach((button) => {
    button.addEventListener("click", () => displayProduct(button.dataset.trackId));
  });
}

function renderProductCard(product, includePipeline = false) {
  return `
    <article class="product-card">
      <div class="product-topline">
        <div>
          <h3>#${product.id} ${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.origin)} · ${escapeHtml(product.farmerId)}</p>
        </div>
        <span class="badge">${escapeHtml(product.currentStageName)}</span>
      </div>
      <div class="meta-grid">
        <span>Current Actor: <strong>${escapeHtml(product.currentActor)}</strong></span>
        <span>Role: <strong>${escapeHtml(product.currentActorRole)}</strong></span>
        <span>Location: <strong>${escapeHtml(product.currentLocation)}</strong></span>
        <span>Updated: <strong>${formatDate(product.updatedAtFormatted)}</strong></span>
      </div>
      ${includePipeline ? `<div class="pipeline compact">${pipelineMarkup(product.currentStage)}</div>` : ""}
      <button class="ghost-btn" type="button" data-track-id="${product.id}">View Audit Trail</button>
    </article>
  `;
}

function renderPipeline(currentStage, container) {
  container.innerHTML = pipelineMarkup(currentStage);
}

function pipelineMarkup(currentStage) {
  return stages.map((stage, index) => {
    let status = "pending";
    if (index < currentStage) status = "completed";
    if (index === currentStage) status = "current";

    return `
      <div class="stage-pill ${status}">
        <strong>${stage.name}</strong>
        <small>${stage.role}</small>
      </div>
    `;
  }).join("");
}

function renderHistory(history) {
  els.historyList.innerHTML = history.map((entry) => `
    <article class="history-item">
      <strong>${entry.stageName} · ${entry.actorRole}</strong>
      <p>${escapeHtml(entry.actorName)} updated product at ${escapeHtml(entry.location)}.</p>
      <small>${formatDate(entry.timestampFormatted)} · ${shortenAddress(entry.actorAddress)}</small>
    </article>
  `).join("");
}

function updateSummary(products) {
  els.totalProducts.textContent = products.length;
  const latest = products[products.length - 1];
  els.latestStage.textContent = latest ? latest.currentStageName : "None";

  if (latest) {
    renderPipeline(latest.currentStage, els.globalPipeline);
  }
}

async function ensureWalletReady() {
  if (!state.contract) {
    await connectWallet();
  }

  if (!state.contract) {
    throw new Error("MetaMask connection is required.");
  }
}

function setButtonLoading(button, loading) {
  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }

  button.disabled = loading;
  button.textContent = loading ? "Waiting for MetaMask..." : button.dataset.originalText || button.textContent;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 4200);
}

function readableError(error) {
  return error.shortMessage || error.reason || error.message || "Unexpected transaction error.";
}

function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
