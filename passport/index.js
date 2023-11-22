const passport = require("passport");
const local = require("./localStrategy");

const db = require("../sequelize/models");
const User = db.User;

// controller - auth.js -> req.login() 호출되면 이쪽으로 옴
module.exports = () => {
  passport.serializeUser((user, done) => {
    // user === exUser
    done(null, user.id); // user id만 추출
  });
  // 세션 {234567867654534:1} {세션쿠기: 아이디} -> 메모리에 저장됨.
  // -> express-session에 설정한 대로 브라우저에 connect.sid 세션 쿠키 전송

  // cookieParser에 의해 객체 형태가 된 유저아이디를 찾음
  passport.deserializeUser((id, done) => {
    // id : 1
    User.findOne({
      // 찾은 아이디로 유저 정보를 복원시킴 -> 그 복원된 정보가 req.user 가 됨.
      where: { id },
      //   include: [
      //     {
      //       model: User,
      //       attributes: ['id', 'nick'],
      //       as: 'Followers',
      //     },
      //     {
      //       model: User,
      //       attributes: ['id', 'nick'],
      //       as: 'Followings',
      //     },
      //   ],
    })
      .then((user) => done(null, user)) // req.user, req.session
      .catch((err) => done(err));
  });

  local();
};
