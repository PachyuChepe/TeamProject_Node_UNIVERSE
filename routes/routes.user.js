// 유저 CRUD
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const db = require("../sequelize/models");
const User = db.User;

const authMiddleware = require("../middleware/middleware.verifyToken");

const router = express.Router();

// 회원가입
router.post("/join", async (req, res) => {
  try {
    // 이미 로그인을 한 경우 에러메세지 + 종료
    if (res.locals.user) {
      return res.status(400).send({
        errorMessage: "이미 로그인된 유저입니다.",
      });
    }
    const { email, username, password } = req.body;

    // 이메일 검증식 : 소문자 a~z 와 숫자 0~9까지 + @ + 소문자 a~z + . + 소문자 a~z (2~3 자리)의 형태로 가능
    let regex = new RegExp("[a-z0-9]+@[a-z]+.+[a-z]{2,3}");

    // 이메일 형식이 검증식을 통과 못할때 오류 + 조기리턴
    if (!regex.test(email)) {
      return res.status(400).send({
        errorMessage: "이메일 형식이 올바르지 않습니다.",
      });
    }

    // email 중복여부 확인
    const existsUsers = await User.findOne({
      where: { email },
    });

    // 중복된 이메일이면 오류 + 조기리턴
    if (existsUsers) {
      return res.status(400).send({
        errorMessage: "이메일이 이미 사용중입니다.",
      });
    }

    // 비밀번호가 확인비밀번호가 다르거나 비번 길이가 6자 미만일때 오류 + 조기리턴
    if (password !== confirmPassword || password.length < 6) {
      return res.status(400).send({
        errorMessage: "비밀번호 확인과 일치한 6자리 이상의 비밀번호를 입력해주세요.",
      });
    }

    // 오류가 없을 경우 비밀번호 hash 처리 하여 유저 생성
    const hash = await bcrypt.hash(password, 10);

    await User.create({ email, username, password: hash });
    res.status(201).send({
      Message: `회원가입이 정상적으로 처리되었습니다. 가입된 유저 정보 -> 이메일 : ${email}, 이름: ${username}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ errorMessage: "서버오류" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  // 이미 로그인을 한 경우 에러메세지 + 종료
  if (res.locals.user) {
    return res.status(400).send({
      errorMessage: "이미 로그인된 유저입니다.",
    });
  }

  try {
    const { email, password } = req.body;

    // 해당 이메일의 유저정보 있는지 확인
    const user = await User.findOne({
      where: {
        email,
      },
    });

    // 정보가 있는 경우 비밀번호 검증
    const auth = await bcrypt.compare(password, user.password);

    // 사용자가 존재하지 않거나, 입력받은 비밀번호가 사용자의 비밀번호화 다를때
    if (!user || !auth) {
      return res.status(400).send({
        errorMessage: "이메일 또는 패스워드가 틀렸습니다.",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    res.send({ 토큰: token });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ errorMessage: "서버오류" });
  }
});

// 인증 성공시 마이페이지 조회 가능
router.get("/users/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        email: res.locals.user.email,
      },
      attributes: ["id", "email", "username"],
    });
    res.status(200).send({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ errorMessage: "서버오류" });
  }
});

module.exports = router;
