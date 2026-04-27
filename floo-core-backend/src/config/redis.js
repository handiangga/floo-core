const { createClient } = require("redis");

let client = null;

async function initRedis() {
  try {
    client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    client.on("error", (err) => {
      if (err.code === "ECONNREFUSED") return;
      console.log("Redis Error:", err.message);
    });

    await client.connect();

    console.log("🔥 Redis connected");
  } catch (err) {
    console.log("⚠️ Redis disabled (not running)");
    client = null;
  }
}

initRedis();

// 🔥 EXPORT LANGSUNG INSTANCE
module.exports = client;
