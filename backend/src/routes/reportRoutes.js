const express = require("express");
const controller = require("../controllers/reportController");
const validate = require("../middlewares/validate");
const { authenticate, requireRole } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators");

const router = express.Router();

router.use(authenticate, requireRole("user", "admin"));
router.post("/generate", validate(schemas.report), asyncHandler(controller.generate));
router.post("/export/pdf", validate(schemas.report), asyncHandler(controller.exportPdf));
router.get("/history", asyncHandler(controller.history));

module.exports = router;
