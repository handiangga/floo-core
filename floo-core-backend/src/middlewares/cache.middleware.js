const getRedis = require("../config/redis");

const cache = (keyPrefix) => {
  return async (req, res, next) => {
    try {
      const redis = getRedis();

      if (!redis) return next();

      const key = keyPrefix + JSON.stringify(req.query);

      let cached;
      try {
        cached = await redis.get(key);
      } catch (err) {
        console.log("REDIS GET ERROR:", err.message);
        return next(); // 🔥 jangan lanjut cache
      }

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);

      res.json = async (body) => {
        try {
          await redis.setEx(key, 60, JSON.stringify(body));
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
