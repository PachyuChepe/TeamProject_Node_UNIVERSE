const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const { User } = require("../sequelize/models"); // Sequelize User 모델 경로
const { generateAccessToken, generateRefreshToken } = require("../utils/tokenManager.js");

passport.use(
  "kakao",
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: `${process.env.SERVER_URL}/api/kakao/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const exUser = await User.findOne({ where: { snsId: profile.id, provider: "kakao" } });
        if (exUser) {
          // JWT 토큰 생성
          const accessToken = generateAccessToken(exUser.id);
          const refreshToken = generateRefreshToken(exUser.id);
          // 기존 사용자에 대한 정보와 토큰 반환
          return done(null, { accessToken, refreshToken });
        } else {
          const newUser = await User.create({
            email: profile._json.kakao_account.email,
            username: profile.displayName,
            snsId: profile.id,
            provider: "kakao",
          });
          // JWT 토큰 생성
          const accessToken = generateAccessToken(newUser.id);
          const refreshToken = generateRefreshToken(newUser.id);
          // 새 사용자에 대한 정보와 토큰 반환
          return done(null, { accessToken, refreshToken });
        }
      } catch (error) {
        console.error(error);
        return done(error);
      }
    },
  ),
);

module.exports = passport;
