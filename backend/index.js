const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────

// Auth (login + signup for both managers and clients)
app.use("/api/auth", require("./routes/auth"));

// Manager-facing routes (require manager role via middleware inside each file)
app.use("/api/reservations", require("./routes/reservations"));
app.use("/api/clients", require("./routes/clients"));
app.use("/api/menu", require("./routes/menu"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/settings", require("./routes/settings"));

// Client-facing routes
app.use("/api/establishments", require("./routes/establishments")); // browse places (both roles can access)
app.use("/api/client", require("./routes/client")); // client workspace (client role only)

// ─── Health check ──────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ─── 404 handler ──────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// ─── Error handler ────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
