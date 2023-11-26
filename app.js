// app.js
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const https = require("https");
const fs = require("fs");
const logger = require("./config/winston.config.js");
require("dotenv").config(); // 환경 변수 설정
const dbConfig = require("./config/db.config.js");
const conn = dbConfig.init();
dbConfig.connect(conn);

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // 쿠키 파싱 미들웨어
app.use(morgan("dev", { stream: { write: (message) => logger.info(message.trim()) } })); // 로깅 미들웨어
let serverPort = process.env.SERVER_PORT || 4000; // 서버 포트 설정

app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 시크릿을 사용하여 쿠키 파싱
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 10, // 세션 쿠키의 유효 시간 설정 (10분)
      httpOnly: false,
      secure: false,
    },
    rolling: true, // 요청시 세션 유효시간 갱신
  }),
);

// 정적 파일 서빙 및 CORS 설정
app.use(express.static(path.join(__dirname, "front.public")));
app.use(
  cors({
    origin: [`http://localhost:${serverPort}`, `https://localhost:${serverPort}, https://www.vitahub.site, http://www.vitahub.site`],
    credentials: true, // 쿠키를 포함한 요청 허용
  }),
);

// OAuth 전략 설정
const kakao = require("./passport/token.kakaoStrategy.js");
const naver = require("./passport/token.naverStrategy.js");
app.use(kakao.initialize());
app.use(naver.initialize());

// 라우터 설정
const userRouter = require("./routes/routes.user.js");
const postRouter = require("./routes/routes.post.js");
const commentRouter = require("./routes/routes.comment.js");
const likeRouter = require("./routes/routes.like.js");
const followRouter = require("./routes/routes.follow.js");

// 라우터 연결
app.use("/api", [userRouter, postRouter, commentRouter, likeRouter, followRouter]);

// 프론트엔드 파일 서빙
app.use(express.static("front.views"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "front.views", "index.html"));
});

let server;
// HTTPS 서버 설정
if (fs.existsSync("./key.pem") && fs.existsSync("./cert.pem")) {
  const privateKey = fs.readFileSync(__dirname + "/key.pem", "utf8");
  const certificate = fs.readFileSync(__dirname + "/cert.pem", "utf8");
  const credentials = { key: privateKey, cert: certificate };
  server = https.createServer(credentials, app);
  server.listen(serverPort, () => console.log(`HTTPS server is running on port ${serverPort}`));
} else {
  // HTTP 서버 설정
  server = app.listen(serverPort, () => console.log(`HTTP server is running on port ${serverPort}`));
}
module.exports = server;
