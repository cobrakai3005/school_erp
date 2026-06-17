const { body } = require("express-validator");

const classValidation = {
  createClass: [
    body("class_name").notEmpty().trim().withMessage("Class name is required"),
    body("class_code").notEmpty().trim().withMessage("Class code is required"),
  ],
};

module.exports = classValidation;
