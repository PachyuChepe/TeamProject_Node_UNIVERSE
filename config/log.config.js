// config/log.config.js
const path = require("path");

module.exports = {
  combinedLog: path.join(__dirname, "../logs/combined.log"),
  errorLog: path.join(__dirname, "../logs/error.log"),
};
