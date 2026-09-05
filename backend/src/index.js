const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const masterDataRoutes = require("./routes/masterData.routes");
const accountingRoutes = require("./routes/accounting.routes");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/master", masterDataRoutes);
app.use("/api/accounting", accountingRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
