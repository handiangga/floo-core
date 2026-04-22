const { createClient } = require("redis");

let client = null;

async function initRedis() {
  try {
    const redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    // 🔥 HANDLE ERROR (tapi jangan spam)
    redisClient.on("error", (err) => {
      if (err.code === "ECONNREFUSED") return; // skip spam
      console.log("Redis Error:", err.message);
    });

    await redisClient.connect();

    console.log("🔥 Redis connected");
    client = redisClient;
  } catch (err) {
    console.log("⚠️ Redis disabled (not running)");
    client = null;
  }
}

initRedis();

module.exports = () => client;
