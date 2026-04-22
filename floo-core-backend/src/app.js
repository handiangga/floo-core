const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routesImport = require("./routes");
const routes = routesImport.default || routesImport;

const errorHandler = require("./middlewares/errorHandler");

const app = express();

// 🔥 SECURITY (FIX CORP IMAGE)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// 🔥 CORS (BIAR FRONTEND BISA AKSES)
app.use(
  cors({
    origin: ["http://localhost:5173", "https://floo-core.vercel.app"],
    credentials: true,
  }),
);

// 🔥 LOGGER
app.use(morgan("dev"));

// 🔥 PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 STATIC FILE (UPLOAD IMAGE FIX)
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// 🔥 ROUTES
app.use("/api/v1", routes);

// 🔥 ERROR HANDLER
app.use(errorHandler);

module.exports = app;
