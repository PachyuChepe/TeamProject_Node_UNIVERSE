// config/db.config.js

const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  // [개발 단계] 로컬 환경 MySQL Workbench 8.0v 연결
  development: {
    host: process.env.LOCAL_MYSQL_HOST,
    port: process.env.LOCAL_MYSQL_PORT,
    username: process.env.LOCAL_MYSQL_USERNAME,
    password: process.env.LOCAL_MYSQL_PASSWORD,
    database: process.env.LOCAL_MYSQL_DATABASE_NAME,
    dialect: "mysql",
    logging: false, //콘솔창 쿼리 로그 off
  },

  // [개발 단계 원격 DB] CloudType MariaDB 10.5v 연결
  mariaDB: {
    host: process.env.CT_MYSQL_HOST,
    port: process.env.CT_MYSQL_PORT,
    username: process.env.CT_MYSQL_USERNAME,
    password: process.env.CT_MYSQL_PASSWORD,
    database: process.env.CT_MYSQL_DATABASE_NAME,
    dialect: "mysql",
    logging: false,
  },

  // [배포] AWS RDS MySQL 연결
  production: {
    host: process.env.RDS_MYSQL_HOST,
    port: process.env.RDS_MYSQL_PORT,
    username: process.env.RDS_MYSQL_USERNAME,
    password: process.env.RDS_MYSQL_PASSWORD,
    database: process.env.RDS_MYSQL_DATABASE_NAME,
    dialect: "mysql",
    logging: false,
  },

  init: function () {
    const env = process.env.NODE_ENV || "development";
    const config = this[env];
    return mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
    });
  },

  connect: function (conn) {
    conn.connect(function (err) {
      if (err) console.error("데이터베이스 연결 에러 : " + err);
      else console.log("데이터베이스 연결 성공");
    });
  },
};
