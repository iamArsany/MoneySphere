const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/db");

async function start() {
  await prisma.$connect();
  app.listen(env.port, () => {
    console.log(`PFT API listening on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
