const passport = require("passport");
// const { Strategy: NaverStrategy, Profile: NaverProfile } = require("passport-naver-v2");
const NaverStrategy = require("passport-naver-v2").Strategy;
const { User } = require("../sequelize/models");
const { generateAccessToken, generateRefreshToken } = require("../utils/tokenManager.js");

passport.use(
  "naver",
  new NaverStrategy(
    {
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: "https://www.vitahub.site/api/naver/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const exUser = await User.findOne({
          where: { snsId: profile.id, provider: profile.provider },
        });
        if (exUser) {
          const accessToken = generateAccessToken(exUser.id);
          const refreshToken = generateRefreshToken(exUser.id);
          return done(null, { accessToken, refreshToken });
        } else {
          const newUser = await User.create({
            email: profile.email,
            username: profile.nickname,
            snsId: profile.id,
            provider: "naver",
          });
          const accessToken = generateAccessToken(newUser.id);
          const refreshToken = generateRefreshToken(newUser.id);
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
