const passport = require("passport");
const local = require("./localStarategy");
const kakao = require("./kakaoStrategy");

const db = require("../sequelize/models");
const User = db.User;

module.exports = () => {
  passport.serializeUser((user, done) => {
    // user === exUser
    done(null, user.id); // user id만 추출
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
    })
      .then((user) => {
        done(null, user);
      }) // req.user, req.session
      .catch((err) => done(err));
  });

  local();
  kakao();
};
