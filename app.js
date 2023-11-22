// app.js

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const https = require("https");
const fs = require("fs");
const passport = require("passport");
// const YAML = require("yamljs");
// const swaggerUi = require("swagger-ui-express");

// 환경 설정 및 데이터베이스 설정
const env = require("./config/env.config.js");
const dbConfig = require("./config/db.config.js");
// 패스포트 설정
const passportConfig = require("./passport");

const conn = dbConfig.init();
dbConfig.connect(conn);

// 라우터 설정
const authRouter = require("./routes/routes.auth.js");
// const itemRouter = require("./routes/products.router.js");

// 익스프레스 앱 생성 및 설정
const app = express();
passportConfig(); // passport 설정
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "front.public")));
app.use(
  cors({
    origin: [`http://localhost:${env.SERVER_PORT}`, `https://localhost:${env.SERVER_PORT}`],
    credentials: true,
  }),
);
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  }),
);
// 로그인 인증 관련 설정
app.use(passport.initialize()); // req.user, req.login, req.isAuthenticate, req.logout 생성
app.use(passport.session()); // connect.sid라는 이름으로 세션 쿠키가 브라우저로 전송

app.use("/api", authRouter);

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
