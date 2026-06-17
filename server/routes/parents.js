const express = require("express");
const router = express.Router({ mergeParams: true });
const ParentController = require("../controllers/ParentControllers");
const {
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
} = require("../middleware/auth");
const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");
const upload = require("../middleware/upload");
router.use(verifyToken, setSchoolContext);
// POST: Create a parent
router.post(
  "/",

  isSchoolAdmin,
  upload.single("profile_image"),
  validationRules.createParent,
  handleValidationErrors,
  ParentController.createParent,
);

// GET: Get all parents (Filter by school_id in query)
router.get("/", ParentController.getAllParents);

// GET: Get specific parent
router.get(
  "/:id",
  validationRules.idParam,
  handleValidationErrors,
  ParentController.getParentById,
);

// PUT: Update parent
router.put(
  "/:id",
  isSchoolAdmin,
  // validationRules.updateParent,
  handleValidationErrors,
  upload.single("profile_image"),
  ParentController.updateParent,
);

// DELETE: Soft delete parent
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  ParentController.deleteParent,
);

module.exports = router;
