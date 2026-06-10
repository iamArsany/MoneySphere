const express = require("express");
const controller = require("../controllers/userController");
const validate = require("../middlewares/validate");
const { authenticate, requireRole } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators");

const router = express.Router();

router.use(authenticate, requireRole("user", "admin"));
router.get("/me", asyncHandler(controller.me));
router.patch("/me", validate(schemas.updateMe), asyncHandler(controller.updateMe));
router.delete("/me", asyncHandler(controller.deleteMe));

module.exports = router;
