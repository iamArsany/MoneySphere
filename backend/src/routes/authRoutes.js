const express = require("express");
const controller = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { authenticate } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators");

const router = express.Router();

router.post("/register", validate(schemas.register), asyncHandler(controller.register));
router.post("/login", validate(schemas.login), asyncHandler(controller.login));
router.post("/logout", authenticate, asyncHandler(controller.logout));
router.post("/refresh", validate(schemas.refresh), asyncHandler(controller.refresh));
router.post("/forgot-password", validate(schemas.forgotPassword), asyncHandler(controller.forgotPassword));
router.post("/reset-password", validate(schemas.resetPassword), asyncHandler(controller.resetPassword));

module.exports = router;
