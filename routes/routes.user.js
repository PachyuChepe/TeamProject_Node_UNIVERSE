// 유저 CRUD
// routes/user.router.js

const express = require("express");

const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../sequelize/models/index.js");
const env = require("../config/env.config.js");
const { isLoggedIn, isNotLoggedIn } = require("../middleware/middleware.verifyToken.js");
const { mailVerify } = require("../middleware/middleware.Nodemailer.js");

// 회원가입
router.post("/join", isNotLoggedIn, mailVerify, async (req, res) => {
  const { email, password, confirmPassword, username } = req.body;
  try {
    // 필수 입력 값 검증
    if (!email || !password || !confirmPassword || !username) {
      return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다" });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "유효하지 않은 이메일 형식입니다" });
    }

    // 비밀번호 강도 검증
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({ success: false, message: "비밀번호는 최소 6자 이상이며, 대소문자, 숫자, 하나 이상의 특수문자를 포함 해야합니다." });
    }

    // 비밀번호 일치 검증
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "비밀번호가 일치하지 않습니다" });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "이미 사용 중인 이메일입니다" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, username });

    const { password: _, ...userData } = user.toJSON();
    return res.status(201).json({ success: true, data: userData });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 로그인
router.post("/login", isNotLoggedIn, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "패스워드가 일치하지 않습니다." });
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "12h" });
    res.cookie("Authorization", `Bearer ${token}`);
    // res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });
    res.status(200).json({ success: true, message: "로그인 성공", token });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 사용자 조회
router.get("/user/me", isLoggedIn, async (req, res) => {
  try {
    const { email, username, profileDescription, profilePictureUrl } = res.locals.user;

    if (!email || !username) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다" });
    }

    res.status(200).json({
      success: true,
      data: { username, email, profileDescription, profilePictureUrl },
    });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 회원 정보 수정
router.put("/user/me", isLoggedIn, async (req, res) => {
  const { id } = res.locals.user;
  const { currentPassword, newPassword, username, profileDescription, profilePictureUrl } = req.body;
  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
    }

    const passwordValidation = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValidation) {
      return res.status(401).json({ success: false, message: "현재 비밀번호가 일치하지 않습니다." });
    }

    if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: "비밀번호는 최소 6자 이상이며, 대소문자, 숫자, 하나 이상의 특수문자를 포함해야 합니다." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword, username, profileDescription, profilePictureUrl });
    res.status(200).json({ success: true, message: "사용자 정보가 성공적으로 업데이트되었습니다." });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 회원 탈퇴
router.delete("/user", isLoggedIn, async (req, res) => {
  const { id } = res.locals.user;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
    }
    await user.destroy();
    res.clearCookie("Authorization");
    res.status(200).json({ success: true, message: "회원 탈퇴가 성공적으로 처리되었습니다." });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 로그아웃
router.post("/logout", isLoggedIn, (req, res) => {
  res.clearCookie("Authorization");
  res.status(200).json({ success: true, message: "로그아웃 성공" });
});

module.exports = router;
