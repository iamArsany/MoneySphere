const express = require("express");
const controller = require("../controllers/accountController");
const validate = require("../middlewares/validate");
const { authenticate, requireRole } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const schemas = require("../validators");

const router = express.Router();

router.use(authenticate, requireRole("user", "admin"));
router.get("/", validate(schemas.listAccounts), asyncHandler(controller.listAccounts));
router.post("/", validate(schemas.createAccount), asyncHandler(controller.createAccount));
router.post("/transfer", validate(schemas.transfer), asyncHandler(controller.transfer));
router.get("/:id", validate(schemas.idParam), asyncHandler(controller.getAccount));
router.patch("/:id", validate(schemas.updateAccount), asyncHandler(controller.updateAccount));
router.delete("/:id", validate(schemas.idParam), asyncHandler(controller.deleteAccount));

module.exports = router;
