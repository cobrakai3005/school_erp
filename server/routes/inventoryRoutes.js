const express = require("express");
const validation = require("../validations/inventory");

const router = express.Router({ mergeParams: true });

const InventoryController = require("../controllers/InventoryController");

const {
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
} = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");

router.use(verifyToken, setSchoolContext);

// ITEMS
router.post(
  "/",
  isSchoolAdmin,
  validation.createItem,
  handleValidationErrors,
  InventoryController.createItem,
);
router.get("/", InventoryController.getAllItems);
router.put(
  "/:id",
  isSchoolAdmin,
  validation.updateItem,
  handleValidationErrors,
  InventoryController.updateItem,
);
router.delete("/:id", isSchoolAdmin, InventoryController.deleteItem);

module.exports = router;
