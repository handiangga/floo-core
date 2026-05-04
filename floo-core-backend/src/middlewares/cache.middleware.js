const redis = require("../config/redis");

// const cache = (keyGenerator) => {
//   return async (req, res, next) => {
//     try {
//       // 🔥 kalau redis tidak ready → lanjut aja
//       if (!redis) return next();

//       let key;

//       try {
//         key =
//           typeof keyGenerator === "function" ? keyGenerator(req) : keyGenerator;
//       } catch (err) {
//         console.log("CACHE KEY ERROR:", err.message);
//         return next();
//       }

//       let cached = null;

//       try {
//         cached = await redis.get(key);
//       } catch (err) {
//         console.log("REDIS GET ERROR:", err.message);
//         return next(); // 🔥 jangan block request
//       }

//       if (cached) {
//         return res.json(JSON.parse(cached));
//       }

//       const originalJson = res.json.bind(res);

//       res.json = async (body) => {
//         try {
//           await redis.setEx(key, 60, JSON.stringify(body));
//         } catch (err) {
//           console.log("REDIS SET ERROR:", err.message);
//         }

//         return originalJson(body);
//       };

//       next();
//     } catch (err) {
//       console.log("CACHE ERROR:", err.message);
//       next(); // 🔥 jangan pernah stop request
//     }
//   };
// };
const cache = () => {
  return (req, res, next) => {
    return next(); // 🔥 BYPASS TOTAL
  };
};

module.exports = cache;
