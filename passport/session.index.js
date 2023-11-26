const passport = require("passport");
const local = require("./localStarategy");
const kakao = require("./kakaoStrategy");
const naver = require("./naverStrategy");

const db = require("../sequelize/models");
const User = db.User;

module.exports = () => {
  passport.serializeUser((user, done) => {
    // user === exUser
    done(null, user.id); // user id만 추출
  });
  // 추출했던 user id 이용해 인증 필요한 기능 사용시 해독해서 유저정보 보냄
  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
    })
      .then((user) => {
        done(null, user);
      }) // req.user, req.session
      .catch((err) => done(err));
  });

  local(); // 로컬로그인 호출
  kakao(); // 카카오로그인 호출
  naver(); // 네이버로그인 호출
};
