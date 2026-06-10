const express = require("express");
const controller = require("../controllers/budgetController");
const validate = require("../middlewares/validate");
const { authenticate, requireRole } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators");

const router = express.Router();

router.use(authenticate, requireRole("user", "admin"));
router.get("/", validate(schemas.listBudgets), asyncHandler(controller.listBudgets));
router.post("/", validate(schemas.budgetCreate), asyncHandler(controller.createBudget));
router.patch("/:id", validate(schemas.budgetUpdate), asyncHandler(controller.updateBudget));
router.delete("/:id", validate(schemas.idParam), asyncHandler(controller.deleteBudget));

module.exports = router;
