const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const { User } = require("../sequelize/models"); // Sequelize User 모델
const { generateAccessToken, generateRefreshToken } = require("../utils/tokenManager.js");

// 카카오 로그인 전략 설정
passport.use(
  "kakao",
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_CLIENT_ID, // 카카오 앱의 클라이언트 ID
      callbackURL: `${process.env.SERVER_URL}/api/kakao/callback`, // 카카오 로그인 후 콜백 URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 사용자 데이터베이스에서 카카오 ID로 사용자 검색
        const exUser = await User.findOne({ where: { snsId: profile.id, provider: "kakao" } });
        if (exUser) {
          // 기존 사용자의 경우 JWT 토큰 생성
          const accessToken = generateAccessToken(exUser.id);
          const refreshToken = generateRefreshToken(exUser.id);
          return done(null, { accessToken, refreshToken }); // 사용자 정보와 토큰 반환
        } else {
          // 새 사용자의 경우 데이터베이스에 저장
          const newUser = await User.create({
            email: profile._json.kakao_account.email,
            username: profile.displayName,
            snsId: profile.id,
            provider: "kakao",
          });
          // 새 사용자의 JWT 토큰 생성
          const accessToken = generateAccessToken(newUser.id);
          const refreshToken = generateRefreshToken(newUser.id);
          return done(null, { accessToken, refreshToken }); // 사용자 정보와 토큰 반환
        }
      } catch (error) {
        console.error(error);
        return done(error); // 에러 발생 시 처리
      }
    },
  ),
);

module.exports = passport; // 모듈로 내보내기
