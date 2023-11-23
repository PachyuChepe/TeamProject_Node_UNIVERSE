const express = require("express");
const passport = require("passport");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
dotenv.config();

const db = require("../sequelize/models");
const User = db.User;
const { isLoggedIn, isNotLoggedIn } = require("../middleware/middleware.verifyToken");

const router = express.Router();

// POST /join
router.post("/join", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash, email });
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
router.post('/login', async (req, res, next) => {
  try {
		// 아까 local로 등록한 인증과정 실행
    passport.authenticate('local', (passportError, user, info) => {
			// 인증이 실패했거나 유저 데이터가 없다면 에러 발생
      if (passportError || !user) {
        res.status(400).json({ message: info.reason });
        return;
      }
			// user데이터를 통해 로그인 진행
      req.login(user, { session: false }, (loginError) => {
        if (loginError) {
          res.send(loginError);
          return;
        }
		// 클라이언트에게 JWT생성 후 반환
		const token = jwt.sign(
			{ id: user.id, name: user.name, auth: user.auth },
			'jwt-secret-key'
		);
       res.json({ token });
      });
    })(req, res);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GET /auth/logout
router.get("/logout", passport.authenticate("jwt", { session: false }), (req, res) => {
  // req.logout();
  console.log("안녕");
  return res.send("로그아웃 되었습니다.");
});

// GET /auth/logout
router.get("/users/me", (req, res) => {
  console.log(user);
  return res.send("유저정보조회.");
});

module.exports = router;
