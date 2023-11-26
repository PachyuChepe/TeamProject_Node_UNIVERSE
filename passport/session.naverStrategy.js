// const passport = require("passport");
// const { Strategy: NaverStrategy, Profile: NaverProfile } = require("passport-naver-v2");

// const { User } = require("../sequelize/models/index.js");

// module.exports = () => {
//   passport.use(
//     new NaverStrategy(
//       /*
//        * clientID에 네이버 앱 아이디 추가
//        * clientSecret에 네이버 앱 시크릿 추가
//        * callbackURL: 네이버 로그인 후 네이버가 결과를 전송해줄 URL
//        * accessToken, refreshToken: 로그인 성공 후 네이버가 보내준 토큰
//        * profile: 네이버가 보내준 유저 정보. profile의 정보를 바탕으로 회원가입
//        */
//       {
//         clientID: process.env.NAVER_KEY,
//         clientSecret: process.env.NAVER_SECRET,
//         callbackURL: "/api/auth/naver/callback",
//       },
//       async (accessToken, refreshToken, profile, done) => {
//         try {
//           const exUser = await User.findOne({
//             // 네이버 플랫폼에서 로그인 했고 & 이메일 네이버 이메일이 일치할경우
//             where: { email: profile.email, provider: "naver" },
//           });
//           // 이미 가입된 네이버 프로필이면 그대로 로그인 성공
//           if (exUser) {
//             done(null, exUser);
//           } else {
//             // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
//             const newUser = await User.create({
//               email: profile.email,
//               nick: profile.name,
//               snsId: profile.id,
//               provider: "naver",
//             });
//             done(null, newUser);
//           }
//         } catch (error) {
//           console.error(error);
//           done(error);
//         }
//       },
//     ),
//   );
// };
