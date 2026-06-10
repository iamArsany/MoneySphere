const express = require("express");
const controller = require("../controllers/categoryController");
const validate = require("../middlewares/validate");
const { authenticate, requireRole } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators");

const router = express.Router();

router.use(authenticate, requireRole("user", "admin"));
router.get("/", validate(schemas.listCategories), asyncHandler(controller.listCategories));

module.exports = router;
