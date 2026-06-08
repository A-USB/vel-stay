const jwt = require("jsonwebtoken");
const { users, clientUsers } = require("../models/store");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");

    // Check manager users first, then client users
    let user = users.find((u) => u.id === decoded.id);
    if (!user) user = clientUsers.find((u) => u.id === decoded.id);
    if (!user)
      return res.status(401).json({ error: "Invalid or expired token" });

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      // Manager-specific
      restaurantId: user.restaurantId || null,
      restaurant: user.restaurant || null,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Only allows managers through
const requireManager = (req, res, next) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ error: "Manager access required" });
  }
  next();
};

// Only allows clients through
const requireClient = (req, res, next) => {
  if (req.user.role !== "client") {
    return res.status(403).json({ error: "Client access required" });
  }
  next();
};

module.exports = { authenticate, requireManager, requireClient };
