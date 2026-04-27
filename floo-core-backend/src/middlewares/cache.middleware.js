const redis = require("../config/redis");

const cache = (prefix) => {
  return async (req, res, next) => {
    try {
      if (!redis) return next();

      // 🔥 KEY LEBIH AMAN (include user + path + query)
      const userId = req.user?.id || "guest";
      const key = prefix + req.originalUrl + ":" + userId;

      let cached;

      try {
        cached = await redis.get(key);
      } catch (err) {
        console.log("REDIS GET ERROR:", err.message);
        return next();
      }

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);

      res.json = async (body) => {
        try {
          await redis.setEx(key, 60, JSON.stringify(body)); // 60 detik
        } catch (err) {
          console.log("REDIS SET ERROR:", err.message);
        }

        return originalJson(body);
      };

      next();
    } catch (err) {
      console.log("CACHE ERROR:", err.message);
      next();
    }
  };
};

module.exports = cache;
