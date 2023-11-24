const express = require("express");
const passport = require("../config/kakao.config.js");
const router = express.Router();

router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    session: false, // 세션 사용 안 함
    failureRedirect: "/", // 로그인 실패 시 리디렉트 주소
  }),
  (req, res) => {
    console.log(req.user.token);
    // HTTP Only Cookie에 토큰 저장

    res.cookie("Authorization", `Bearer ${req.user.token}`, {
      session: false,
      // httpOnly: true,
      // secure: process.env.NODE_ENV === 'production', // HTTPS에서만 쿠키를 전송
      // maxAge: 12 * 60 * 60 * 1000, // 쿠키 유효 시간 설정 (12시간)
    });

    // 로그인 성공 후 리디렉트 주소
    res.redirect("/");
  },
);

module.exports = router;
