const express = require("express");
const controller = require("../controllers/adminController");
const validate = require("../middlewares/validate");
const { authenticate, requireRole } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators");

const router = express.Router();

router.use(authenticate, requireRole("admin"));
router.get("/users", validate(schemas.adminUsers), asyncHandler(controller.listUsers));
router.patch("/users/:id/status", validate(schemas.adminStatus), asyncHandler(controller.updateUserStatus));
router.delete("/users/:id", validate(schemas.idParam), asyncHandler(controller.deleteUser));
router.get("/analytics", asyncHandler(controller.analytics));
router.get("/audit", validate(schemas.auditQuery), asyncHandler(controller.auditLog));
router.post("/categories", validate(schemas.categoryCreate), asyncHandler(controller.createCategory));
router.patch("/categories/:id", validate(schemas.categoryUpdate), asyncHandler(controller.updateCategory));
router.post("/broadcast", validate(schemas.broadcast), asyncHandler(controller.broadcast));

module.exports = router;
