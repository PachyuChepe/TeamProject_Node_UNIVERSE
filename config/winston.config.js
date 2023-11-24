const winston = require("winston");
const logConfig = require("../config/log.config");
const { combine, timestamp, printf, colorize } = winston.format;

// 사용자 정의 로그 포맷
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// 색상이 적용된 Winston 로거 인스턴스 생성
const logger = winston.createLogger({
  level: "info",
  format: combine(colorize(), timestamp(), myFormat),
  transports: [
    new winston.transports.Console(), // 콘솔에 로그 출력
    new winston.transports.File({ filename: logConfig.combinedLog }),
    new winston.transports.File({ filename: logConfig.errorLog, level: "error" }),
  ],
});

module.exports = logger;
