const { Prisma } = require("@prisma/client");
const { errorPayload } = require("../utils/response");

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json(errorPayload("CONFLICT", "A record with this value already exists.", err.meta));
    }
    if (err.code === "P2025") {
      return res.status(404).json(errorPayload("NOT_FOUND", "The requested record was not found."));
    }
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = statusCode === 500 ? "Something went wrong. Please try again later." : err.message;
  return res.status(statusCode).json(errorPayload(code, message, err.details));
}

module.exports = errorHandler;
