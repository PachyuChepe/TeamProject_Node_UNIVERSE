// 로그인 검증 미들웨어

// ======= 효진님 로그인 미들웨어 시작(추후 코드 병합)
exports.isLoggedIn = (req, res, next) => {
  // req.isAuthenticated() Passport 자체 내장 함수, 로그인 세션 존재여부 확인
  // ture 면 다음 라우터로 넘어감
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인이 필요합니다.");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  // false 면 다음 라우터로 넘어감
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent("이미 로그인한 상태입니다.");
    res.redirect(`/?error=${message}`);
  }
};

// ======= 효진님 로그인 미들웨어 종료(추후 코드 병합)

// middleware/verifyToken.middleware.js

// const jwt = require("jsonwebtoken");
// const { User } = require("../sequelize/models/index.js");

// exports.isLoggedIn = async (req, res, next) => {
//   const { Authorization } = req.cookies;
//   const [authType, authToken] = (Authorization ?? "").split(" ");
//   // const [authType, authToken] = Authorization ? Authorization.split(" ") : "";

//   if (!authToken || authType !== "Bearer") {
//     return res.status(401).send({
//       success: false,
//       message: "로그인이 필요합니다.",
//     });
//   }

//   try {
//     const { userId } = jwt.verify(authToken, process.env.JWT_SECRET);
//     const user = await User.findByPk(userId);
//     res.clearCookie("Authorization");
//     if (!user) {
//       return res.status(401).send({
//         success: false,
//         message: "인증된 사용자를 찾을 수 없습니다.",
//       });
//     }
//     res.locals.user = user;
//     next();
//   } catch (err) {
//     if (err instanceof jwt.TokenExpiredError) {
//       // JWT토큰이 만료될 경우 엑세스 토큰과 리프레시 토큰을 통해서 재발급 받아야되지만
//       // 임시로 헤더에 있는 쿠키를 터트리는 것으로 유사구현
//       res.clearCookie("Authorization");
//       return res.status(401).send({
//         success: false,
//         message: "토큰이 만료되었습니다.",
//       });
//     } else {
//       // res.clearCookie("Authorization");
//       // console.error(err);
//       return res.status(500).send({
//         success: false,
//         message: "서버 오류가 발생했습니다.",
//       });
//     }
//   }
// };

// exports.isNotLoggedIn = async (req, res, next) => {
//   const { Authorization } = req.cookies;

//   const [authType, authToken] = (Authorization ?? "").split(" ");
//   // const [authType, authToken] = Authorization ? Authorization.split(" ") : "";

//   if (!authToken || authType !== "Bearer") {
//     next();
//     return;
//   }
//   try {
//     jwt.verify(authToken, process.env.JWT_SECRET);

//     res.status(401).send({
//       success: false,
//       message: "이미 로그인된 상태입니다",
//     });
//   } catch (error) {
//     next();
//   }
// };
