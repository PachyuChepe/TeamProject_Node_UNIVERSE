// config/env.config.js

require("dotenv").config();

module.exports = {
  SERVER_PORT: process.env.SERVER_PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET,
};
