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
const passport = require("passport"); // ===== 효진님 코드
// const YAML = require("yamljs");
// const swaggerUi = require("swagger-ui-express");

// 데이터베이스 설정
const dbConfig = require("./config/db.config.js");
const conn = dbConfig.init();
dbConfig.connect(conn);

// 패스포트 설정
// const passportConfig = require("./passport");
// passportConfig();

// 익스프레스 앱 생성 및 설정
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // api 호출 시 form 형태의 데이터를 정상적으로 처리하기 위해
app.use(cookieParser());

// app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(morgan("dev", { stream: { write: (message) => logger.info(message.trim()) } }));

let serverPort = process.env.SERVER_PORT || 4000;

// app.use(cookieParser(process.env.COOKIE_SECRET)); // 저장된 connect.sid를 {connect.sid = 234567867654534} 형태의 객체로 만듬
// app.use(
//   session({
//     secret: process.env.COOKIE_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 1000 * 60 * 10, // 10분
//       httpOnly: false,
//       secure: false,
//     },
//     rolling: true, // 서버요청 생기면 다시 쿠키 유효시간 리셋
//   }),
// );

// app.use(passport.initialize()); // req.user, req.login, req.isAuthenticate, req.logout 생성
// app.use(passport.session()); // connect.sid라는 이름으로 세션 쿠키가 브라우저로 전송

app.use(express.static(path.join(__dirname, "front.public")));
app.use(
  cors({
    origin: [`http://localhost:${serverPort}`, `https://localhost:${serverPort}`],
    credentials: true,
  }),
);
const passport = require("./config/kakao.config.js");
app.use(passport.initialize());
// 라우터 설정
const userRouter = require("./routes/routes.user.js");
const postRouter = require("./routes/routes.post.js");
const commentRouter = require("./routes/routes.comment.js");
const likeRouter = require("./routes/routes.like.js");
const followRouter = require("./routes/routes.follow.js");
const kakaoRouter = require("./routes/routes.kakao.js");

app.use("/api", [userRouter, postRouter, commentRouter, likeRouter, followRouter, kakaoRouter]);

// Swagger API 문서 설정
// const apiSpec = YAML.load("swagger.yaml");

// Swagger API 로컬 서버 포트 변경
// apiSpec.servers = apiSpec.servers.map((server) => {
//   if (server.url.includes("localhost")) {
//     return {
//       ...server,
//       url: `http://localhost:${process.env.SERVER_PORT}`,
//     };
//   }
//   return server;
// });

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiSpec));

// 정적 파일 디렉토리 설정
app.use(express.static("front.views"));

// 기본 경로 설정
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "front.views", "index.html"));
// });

app.get("/", (req, res) => {
  fs.readFile("../front.views/index.html", function (err, data) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write(data);
    res.end();
  });
});

// 서버 생성 및 실행
let server;
if (fs.existsSync("./key.pem") && fs.existsSync("./cert.pem")) {
  const privateKey = fs.readFileSync(__dirname + "/key.pem", "utf8");

  const certificate = fs.readFileSync(__dirname + "/cert.pem", "utf8");

  const credentials = { key: privateKey, cert: certificate };
  server = https.createServer(credentials, app);
  server.listen(serverPort, () => console.log(`HTTPS server is running on port ${serverPort}`));
} else {
  server = app.listen(serverPort, () => console.log(`HTTP server is running on port ${serverPort}`));
}

module.exports = server;
