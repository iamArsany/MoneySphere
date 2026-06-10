const express = require("express");
const controller = require("../controllers/transactionController");
const validate = require("../middlewares/validate");
const { authenticate, requireRole } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators");

const router = express.Router();

router.use(authenticate, requireRole("user", "admin"));
router.get("/", validate(schemas.listTransactions), asyncHandler(controller.listTransactions));
router.post("/", validate(schemas.createTransaction), asyncHandler(controller.createTransaction));
router.delete("/bulk", validate(schemas.bulkDelete), asyncHandler(controller.bulkDelete));
router.get("/:id", validate(schemas.idParam), asyncHandler(controller.getTransaction));
router.patch("/:id", validate(schemas.updateTransaction), asyncHandler(controller.updateTransaction));
router.delete("/:id", validate(schemas.idParam), asyncHandler(controller.deleteTransaction));

module.exports = router;
