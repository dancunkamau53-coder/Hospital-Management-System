const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");

const { createSubscription } = require("../controllers/subscriptionController");

router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  createSubscription
);

module.exports = router;
