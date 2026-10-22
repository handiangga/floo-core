require("dotenv").config();

const config = {
  use_env_variable: "DB_URL",
  dialect: "postgres",
};

// Preserve the existing Supabase/Render behavior by default. The VPS
// deployment explicitly sets DB_SSL=false because its PostgreSQL container
// is private to the Docker network and does not terminate TLS itself.
if (process.env.DB_SSL !== "false") {
  config.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

module.exports = {
  development: config,
  test: config,
  production: config,
};
