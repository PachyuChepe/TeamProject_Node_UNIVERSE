const express = require("express");
const passport = require("passport");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();
const db = require("../sequelize/models");
const User = db.User;
const { isLoggedIn, isNotLoggedIn } = require("../middleware/middleware.verifyToken");

const router = express.Router();

// POST /join
// router.post('/join', isNotLoggedIn, join)
router.post("/join", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    await User.create({ username, password, email });
    res.status(201).send({
      Message: `회원가입이 정상적으로 처리되었습니다. 가입된 유저 정보 -> 이메일 : ${email}, 이름: ${username}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ errorMessage: "서버오류" });
  }
});

// POST /login
// 미들웨어(index) 에서 로그인 되었는지 여부 확인후 로그인이 안되어있는 경우 컨트롤러(auth)의 로그인 함수 호출
router.post("/login", isNotLoggedIn, async (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    // localStrategy 에서 done 호출되면 해당 코드 실행
    if (authError) {
      // 서버 오류로 로그인 실패
      console.error(authError);
      return res.status(500).send({ message: "서버 오류입니다." });
    }
    if (!user) {
      // 해당 유저가 없는 경우
      return res.send({ message: "존재하지 않는 유저입니다." });
    }
    // 로그인 성공 시 -> passport -> index.js로 감
    return req.login(user, (loginError) => {
      // 서버 오류로 로그인 실패
      if (loginError) {
        console.error(loginError);
        return res.send({ message: "로그인 과정에서 오류가 생겼습니다." });
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "12h",
      });
      return res.send({ token: token });
    });
  })(req, res, next);
});

// GET /auth/logout
// router.get("/logout", isLoggedIn, logout);

module.exports = router;
