const { body } = require("express-validator");

const studyMaterialValidation = {
  // Create Studny Material
  createStudyMaterial: [
    body("class_id").notEmpty().isInt(),
    body("subject").notEmpty().isString(),
    body("title").notEmpty().isString(),
    body("file_type")
      .optional()
      .isIn(["pdf", "video", "document", "image", "other"]),
  ],
};

module.exports = studyMaterialValidation;
