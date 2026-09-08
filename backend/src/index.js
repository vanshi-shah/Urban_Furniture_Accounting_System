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
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or any localhost/127.0.0.1 dev origin
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, message: "Urban Furniture Accounting System API is active" }));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/master", masterDataRoutes);
app.use("/api/accounting", accountingRoutes);
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/reports", require("./routes/report.routes"));
app.use("/api/budgets", require("./routes/budget.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

// Global centralized error handling middleware
app.use(errorHandler);

const httpServer = createServer(app);
if (typeof initSocket === "function") {
  initSocket(httpServer);
}

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
