const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const productRoutes = require("./routes/product");
const { contractAbi, contractAddress } = require("./config/contractConfig");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use("/api/product", productRoutes);
app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "Food Supply Chain DApp API",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/config", (req, res) => {
  res.json({
    contractAddress,
    contractAbi,
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.shortMessage || err.reason || err.message || "Unexpected server error";

  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(status).json({
    error: message,
  });
});

app.listen(PORT, () => {
  console.log(`Food Supply Chain DApp running at http://localhost:${PORT}`);
});
