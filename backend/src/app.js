const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const csrf = require("csurf");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const routes = require("./routes");
const docsRoutes = require("./routes/docsRoutes");
const errorHandler = require("./middlewares/errorHandler");
const { errorPayload } = require("./utils/response");

const app = express();

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: { useDefaults: true } }));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use(rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
if (env.enableCsrf) app.use(csrf({ cookie: { httpOnly: true, sameSite: "strict", secure: env.cookieSecure } }));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/docs", docsRoutes);
app.use("/v1", routes);
app.use(routes);

app.use((req, res) => res.status(404).json(errorPayload("NOT_FOUND", "The requested route was not found.")));
app.use(errorHandler);

module.exports = app;
