const passport = require("passport");
const NaverStrategy = require("passport-naver-v2").Strategy;
const { User } = require("../sequelize/models"); // Sequelize User 모델
const { generateAccessToken, generateRefreshToken } = require("../utils/tokenManager.js");

// 네이버 로그인 전략 설정
passport.use(
  "naver",
  new NaverStrategy(
    {
      clientID: process.env.NAVER_CLIENT_ID, // 네이버 앱 클라이언트 ID
      clientSecret: process.env.NAVER_CLIENT_SECRET, // 네이버 앱 클라이언트 시크릿
      callbackURL: `${process.env.SERVER_URL}/api/naver/callback`, // 네이버 로그인 후 콜백 URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 네이버 ID로 사용자 검색
        const exUser = await User.findOne({
          where: { snsId: profile.id, provider: profile.provider },
        });
        if (exUser) {
          // 기존 사용자의 경우 JWT 토큰 생성
          const accessToken = generateAccessToken(exUser.id);
          const refreshToken = generateRefreshToken(exUser.id);
          return done(null, { accessToken, refreshToken }); // 사용자 정보와 토큰 반환
        } else {
          // 새 사용자의 경우 데이터베이스에 저장
          const newUser = await User.create({
            email: profile.email,
            username: profile.nickname,
            snsId: profile.id,
            provider: "naver",
          });
          // 새 사용자의 JWT 토큰 생성
          const accessToken = generateAccessToken(newUser.id);
          const refreshToken = generateRefreshToken(newUser.id);
          return done(null, { accessToken, refreshToken }); // 사용자 정보와 토큰 반환
        }
      } catch (error) {
        console.error(error); // 에러 로깅
        return done(error); // 에러 처리
      }
    },
  ),
);

module.exports = passport; // 모듈로 내보내기
