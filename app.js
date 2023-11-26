// app.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const https = require("https");
const fs = require("fs");
const logger = require("./config/winston.config.js");

const dbConfig = require("./config/db.config.js");
const conn = dbConfig.init();
dbConfig.connect(conn);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(morgan("dev", { stream: { write: (message) => logger.info(message.trim()) } }));
let serverPort = process.env.SERVER_PORT || 4000;

app.use(express.static(path.join(__dirname, "front.public")));
app.use(
  cors({
    origin: [`http://localhost:${serverPort}`, `https://localhost:${serverPort}`],
    credentials: true,
  }),
);
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

app.use("/api", [userRouter, postRouter, commentRouter, likeRouter, followRouter]);

app.use(express.static("front.views"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "front.views", "index.html"));
});

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
