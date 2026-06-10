const path = require("path");
const express = require("express");
const swaggerUi = require("swagger-ui-express");

const router = express.Router();
const apiSpecPath = path.resolve(__dirname, "../../api_spec.yaml");

router.get("/openapi.yaml", (req, res) => {
  res.type("application/yaml").sendFile(apiSpecPath);
});

router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: {
      url: "/docs/openapi.yaml"
    },
    customSiteTitle: "Personal Finance Tracker API Docs"
  })
);

module.exports = router;
