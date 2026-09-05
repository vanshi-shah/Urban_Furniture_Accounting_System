require("dotenv/config");
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { initSocket } = require("./socket");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const submissionRoutes = require("./routes/submission.routes");
const masterDataRoutes = require("./routes/masterData.routes");
const accountingRoutes = require("./routes/accounting.routes");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/master", masterDataRoutes);
app.use("/api/accounting", accountingRoutes);
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/reports", require("./routes/report.routes"));

// Use the error handler from Jaini's branch if possible, otherwise fallback
if (typeof errorHandler === "function") {
  app.use(errorHandler);
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });
}

const httpServer = createServer(app);
if (typeof initSocket === "function") {
  initSocket(httpServer);
}

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
