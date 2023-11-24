const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const { User } = require("../sequelize/models"); // Sequelize User 모델 경로
const jwt = require("jsonwebtoken");

passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: "http://localhost:4000/api/kakao/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile._json.kakao_account.email, "뭐들어옴");
      try {
        const exUser = await User.findOne({ where: { snsId: profile.id, provider: "kakao" } });
        if (exUser) {
          // JWT 토큰 생성
          const token = jwt.sign({ id: exUser.id }, process.env.JWT_SECRET, { expiresIn: "12h" });
          // 기존 사용자에 대한 정보와 토큰 반환
          return done(null, { user: exUser, token });
        } else {
          const newUser = await User.create({
            email: profile._json.kakao_account.email,
            username: profile.displayName,
            snsId: profile.id,
            provider: profile.kakao,
          });
          // JWT 토큰 생성
          const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "12h" });
          // 새 사용자에 대한 정보와 토큰 반환
          return done(null, { user: newUser, token });
        }
      } catch (error) {
        console.error(error);
        done(error);
      }
    },
  ),
);

module.exports = passport;
