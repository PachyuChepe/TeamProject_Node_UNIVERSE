// 로그인 검증 미들웨어
// middleware/verifyToken.middleware.js

const jwt = require("jsonwebtoken");
const { User } = require("../sequelize/models/index.js");

exports.isLoggedIn = async (req, res, next) => {
  const { Authorization } = req.cookies;
  const [authType, authToken] = (Authorization ?? "").split(" ");
  // const [authType, authToken] = Authorization ? Authorization.split(" ") : "";

  if (!authToken || authType !== "Bearer") {
    return res.status(401).send({
      success: false,
      message: "로그인이 필요합니다.",
    });
  }

  try {
    const { userId } = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findByPk(userId);
    res.clearCookie("Authorization");
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "인증된 사용자를 찾을 수 없습니다.",
      });
    }
    res.locals.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      // JWT토큰이 만료될 경우 엑세스 토큰과 리프레시 토큰을 통해서 재발급 받아야되지만
      // 임시로 헤더에 있는 쿠키를 터트리는 것으로 유사구현
      res.clearCookie("Authorization");
      return res.status(401).send({
        success: false,
        message: "토큰이 만료되었습니다.",
      });
    } else {
      // res.clearCookie("Authorization");
      // console.error(err);
      return res.status(500).send({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  }
};

exports.isNotLoggedIn = async (req, res, next) => {
  const { Authorization } = req.cookies;

  const [authType, authToken] = (Authorization ?? "").split(" ");
  // const [authType, authToken] = Authorization ? Authorization.split(" ") : "";

  if (!authToken || authType !== "Bearer") {
    next();
    return;
  }
  try {
    jwt.verify(authToken, process.env.JWT_SECRET);

    res.status(401).send({
      success: false,
      message: "이미 로그인된 상태입니다",
    });
  } catch (error) {
    next();
  }
};

// ======= 효진님 로그인 미들웨어 (추후 코드 병합)

// const jwt = require("jsonwebtoken"); // jwt

// const dotenv = require("dotenv");
// dotenv.config();

// const db = require("../sequelize/models");
// const User = db.User;

// module.exports = async (req, res, next) => {
//   const { authorization } = req.headers;
//   const [authType, authToken] = (authorization || "").split(" ");

//   if (!authToken || authType !== "Bearer") {
//     res.status(401).send({
//       errorMessage: "로그인 후 이용 가능한 기능입니다.",
//     });
//     return;
//   }

//   try {
//     const { id } = jwt.verify(authToken, process.env.JWT_SECRET); // 암호화한 키 해독해 id 할당
//     const user = await User.findByPk(id); // 존재하는 id인 경우 user에 담김
//     res.locals.user = user; // 해당 id의 유저정보 res.locals에 담아 어디서든 호출 가능
//     next();
//   } catch (err) {
//     console.error(err);
//     res.status(401).send({
//       errorMessage: `로그인 후 이용 가능한 기능입니다.`,
//     });
//   }
// };
