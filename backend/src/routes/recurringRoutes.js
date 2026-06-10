const express = require("express");
const controller = require("../controllers/recurringController");
const validate = require("../middlewares/validate");
const { authenticate, requireRole } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators");

const router = express.Router();

router.use(authenticate, requireRole("user", "admin"));
router.get("/", asyncHandler(controller.listRecurring));
router.post("/", validate(schemas.recurringCreate), asyncHandler(controller.createRecurring));
router.patch("/:id", validate(schemas.recurringUpdate), asyncHandler(controller.updateRecurring));
router.delete("/:id", validate(schemas.idParam), asyncHandler(controller.deleteRecurring));
router.post("/:id/skip", validate(schemas.idParam), asyncHandler(controller.skipNext));

module.exports = router;
