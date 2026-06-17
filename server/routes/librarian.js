const express = require("express");
const LibrarianController = require("../controllers/LibrarianController");
const librarianValidation = require("../validations/librarian");
const { handleValidationErrors } = require("../middleware/validation");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router({ mergeParams: true });

router.use(auth.verifyToken, auth.setSchoolContext);

// Create Librarian
router.post(
  "/",
  upload.single("profile_image"),
  auth.isSchoolAdmin,
  librarianValidation.createLibrarian,
  handleValidationErrors,
  LibrarianController.create,
);

// Get All Librarians
router.get("/", auth.isSchoolAdmin, LibrarianController.getAll);

// Get Librarian By ID
router.get(
  "/:id",
  auth.isSchoolAdmin,
  librarianValidation.librarianId,
  handleValidationErrors,
  LibrarianController.getById,
);

// Update Librarian
router.put(
  "/:id",
  upload.single("profile_image"),
  auth.isSchoolAdmin,
  librarianValidation.librarianId,
  librarianValidation.updateLibrarian,
  handleValidationErrors,
  LibrarianController.update,
);

// Delete Librarian
router.delete(
  "/:id",
  auth.isSchoolAdmin,
  librarianValidation.librarianId,
  handleValidationErrors,
  LibrarianController.delete,
);

module.exports = router;
