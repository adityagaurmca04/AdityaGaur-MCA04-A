require("dotenv").config();

const app = require("./app");
const connectToDatabase = require("./config/db");

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set to a secret of at least 32 characters");
  }

  await connectToDatabase();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Student management API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exitCode = 1;
});
