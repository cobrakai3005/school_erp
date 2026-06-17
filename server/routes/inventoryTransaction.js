const express = require("express");
const router = express.Router({ mergeParams: true });

const InventoryController = require("../controllers/InventoryController");

const {
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
} = require("../middleware/auth");
const { createTransaction } = require("../validations/inventoryTransactions");

const { handleValidationErrors } = require("../middleware/validation");

router.use(verifyToken, setSchoolContext);

// CREATE TRANSACTION
router.post(
  "/",
  isSchoolAdmin,
  createTransaction,
  handleValidationErrors,
  InventoryController.addTransaction,
);

// GET TRANSACTIONS
router.get("/:item_id", InventoryController.getTransactions);

module.exports = router;
