const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const {
  users,
  clientUsers,
  getRestaurantSettings,
} = require("../models/store");
const { authenticate } = require("../middleware/auth");
const {
  isEmail,
  isNonEmptyString,
  normalizeEmail,
} = require("../utils/validation");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ─── POST /api/auth/login ──────────────────────────────────────────────────
// Accepts: { email, password }
// Returns: { token, user } — user.role tells frontend where to route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email) || !isNonEmptyString(password)) {
      return res
        .status(400)
        .json({ error: "A valid email and password are required" });
    }

    // Search both manager users and client users
    let user = users.find(
      (u) => normalizeEmail(u.email) === normalizeEmail(email),
    );
    if (!user)
      user = clientUsers.find(
        (u) => normalizeEmail(u.email) === normalizeEmail(email),
      );
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId || null,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    const { password: _, ...userWithoutPw } = user;
    res.json({ token, user: userWithoutPw });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── POST /api/auth/signup ─────────────────────────────────────────────────
// Accepts: { name, email, password, role, restaurant? (manager only), phone? (client only) }
// role must be 'manager' or 'client'
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, restaurant, phone } = req.body;

    if (
      !isNonEmptyString(name) ||
      !isEmail(email) ||
      !isNonEmptyString(password)
    ) {
      return res
        .status(400)
        .json({ error: "Name, valid email, and password are required" });
    }
    if (!["manager", "client"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Role must be 'manager' or 'client'" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    // Check email uniqueness across both user pools
    const emailTaken =
      users.some((u) => normalizeEmail(u.email) === normalizeEmail(email)) ||
      clientUsers.some(
        (u) => normalizeEmail(u.email) === normalizeEmail(email),
      );
    if (emailTaken)
      return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    if (role === "manager") {
      const restaurantName = isNonEmptyString(restaurant)
        ? restaurant.trim()
        : "My Restaurant";
      const restaurantId = uuidv4();
      const newUser = {
        id: uuidv4(),
        restaurantId,
        name: name.trim(),
        email: normalizeEmail(email),
        password: hashed,
        role: "manager",
        restaurant: restaurantName,
        avatar: null,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      getRestaurantSettings(restaurantId, restaurantName);

      const token = jwt.sign(
        {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          restaurantId,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );
      const { password: _, ...userWithoutPw } = newUser;
      return res.status(201).json({ token, user: userWithoutPw });
    }

    if (role === "client") {
      const newClientUser = {
        id: uuidv4(),
        name: name.trim(),
        email: normalizeEmail(email),
        password: hashed,
        role: "client",
        phone: phone || "",
        avatar: null,
        createdAt: new Date().toISOString(),
      };
      clientUsers.push(newClientUser);

      const token = jwt.sign(
        {
          id: newClientUser.id,
          email: newClientUser.email,
          role: newClientUser.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );
      const { password: _, ...userWithoutPw } = newClientUser;
      return res.status(201).json({ token, user: userWithoutPw });
    }
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
router.get("/me", authenticate, (req, res) => {
  let user = users.find((u) => u.id === req.user.id);
  if (!user) user = clientUsers.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { password: _, ...userWithoutPw } = user;
  res.json(userWithoutPw);
});

// ─── POST /api/auth/logout ─────────────────────────────────────────────────
router.post("/logout", authenticate, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
