// app.js

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const https = require("https");
const fs = require("fs");
const logger = require("./config/winston.config.js");
// const YAML = require("yamljs");
// const swaggerUi = require("swagger-ui-express");

// 환경 설정 및 데이터베이스 설정
const env = require("./config/env.config.js");
const dbConfig = require("./config/db.config.js");

const conn = dbConfig.init();
dbConfig.connect(conn);

// 익스프레스 앱 생성 및 설정
const app = express();
app.use(express.json());
app.use(cookieParser());

// app.use(morgan("dev"));
// app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(morgan("dev", { stream: { write: (message) => logger.info(message.trim()) } }));

app.use(
  cors({
    origin: [`http://localhost:${env.SERVER_PORT}`, `https://localhost:${env.SERVER_PORT}`],
    credentials: true,
  }),
);

// 라우터 설정
const userRouter = require("./routes/routes.user.js");
const postRouter = require("./routes/routes.post.js");

app.use("/api", [userRouter, postRouter]);

// Swagger API 문서 설정
// const apiSpec = YAML.load("swagger.yaml");

// Swagger API 로컬 서버 포트 변경
// apiSpec.servers = apiSpec.servers.map((server) => {
//   if (server.url.includes("localhost")) {
//     return {
//       ...server,
//       url: `http://localhost:${env.SERVER_PORT}`,
//     };
//   }
//   return server;
// });

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiSpec));

// 정적 파일 디렉토리 설정
app.use(express.static("front.views"));

// 기본 경로 설정
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "front.views", "index.html"));
});

// 서버 생성 및 실행
let server;
if (fs.existsSync("./key.pem") && fs.existsSync("./cert.pem")) {
  const privateKey = fs.readFileSync(__dirname + "/key.pem", "utf8");

  const certificate = fs.readFileSync(__dirname + "/cert.pem", "utf8");

  const credentials = { key: privateKey, cert: certificate };
  server = https.createServer(credentials, app);
  server.listen(env.SERVER_PORT, () => console.log(`HTTPS server is running on port ${env.SERVER_PORT}`));
} else {
  server = app.listen(env.SERVER_PORT, () => console.log(`HTTP server is running on port ${env.SERVER_PORT}`));
}

module.exports = server;
