const express = require("express");
const router = express.Router({ mergeParams: true });
const transportManagerValidation = require("../validations/studyMaterials");
const StudyMaterialController = require("../controllers/StudyMaterialController");

const {
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
  checkPermission,
} = require("../middleware/auth");

const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");
const upload = require("../middleware/upload");

// auth + school context
router.use(verifyToken, setSchoolContext);

// CREATE
router.post(
  "/",
  isSchoolAdmin,
  upload.single("file"),
  transportManagerValidation.createStudyMaterial,
  handleValidationErrors,
  StudyMaterialController.create,
);

// GET ALL
router.get(
  "/",
  checkPermission("study_materials", "read"),
  StudyMaterialController.getAll,
);

// GET BY ID
router.get(
  "/:id",
  validationRules.idParam,
  handleValidationErrors,
  checkPermission("study_materials", "read"),
  StudyMaterialController.getById,
);

// UPDATE
router.put(
  "/:id",
  isSchoolAdmin,
  upload.single("file"),
  validationRules.idParam,
  handleValidationErrors,
  StudyMaterialController.update,
);

// DELETE
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  StudyMaterialController.delete,
);

module.exports = router;
