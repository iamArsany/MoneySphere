const express = require("express");
const controller = require("../controllers/notificationController");
const validate = require("../middlewares/validate");
const { authenticate, requireRole } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators");

const router = express.Router();

router.use(authenticate, requireRole("user", "admin"));
router.get("/", validate(schemas.listNotifications), asyncHandler(controller.listNotifications));
router.patch("/read-all", asyncHandler(controller.markAllRead));
router.get("/preferences", asyncHandler(controller.getPreferences));
router.patch("/preferences", validate(schemas.preferences), asyncHandler(controller.updatePreferences));
router.patch("/:id/read", validate(schemas.idParam), asyncHandler(controller.markRead));

module.exports = router;
