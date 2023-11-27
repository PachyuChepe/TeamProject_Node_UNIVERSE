const jwt = require("jsonwebtoken");
const { verifyToken, generateAccessToken } = require("../utils/tokenManager");
const { User } = require("../sequelize/models/index.js");

// 로그인 상태를 확인하는 미들웨어
exports.isLoggedIn = async (req, res, next) => {
  const { Authorization, RefreshToken } = req.cookies;
  const [authType, authToken] = (Authorization ?? "").split(" ");

  // Bearer 토큰이 없거나 유효하지 않은 경우 401 응답
  if (!authToken || authType !== "Bearer") {
    return res.status(401).send({ success: false, message: "로그인이 필요합니다." });
  }

  // 액세스 토큰 검증
  const decoded = verifyToken(authToken, process.env.JWT_SECRET);
  if (decoded) {
    res.locals.user = await User.findByPk(decoded.userId); // 사용자 정보 저장
    return next(); // 다음 미들웨어로 이동
  }

  // 액세스 토큰이 만료되었을 경우 리프레시 토큰으로 재발급 시도
  if (RefreshToken) {
    const refreshDecoded = verifyToken(RefreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (refreshDecoded) {
      const newAccessToken = generateAccessToken(refreshDecoded.userId);
      res.cookie("Authorization", `Bearer ${newAccessToken}`); // 새 액세스 토큰 발급
      res.locals.user = await User.findByPk(refreshDecoded.userId); // 사용자 정보 저장
      return next(); // 다음 미들웨어로 이동
    }
  }

  // 인증 실패 시 401 응답
  return res.status(401).send({ success: false, message: "로그인이 필요합니다." });
};

// 로그인되지 않은 상태를 확인하는 미들웨어
exports.isNotLoggedIn = async (req, res, next) => {
  const { Authorization } = req.cookies;
  const [authType, authToken] = (Authorization ?? "").split(" ");

  // Bearer 토큰이 없거나 유효하지 않은 경우 다음 미들웨어로 이동
  if (!authToken || authType !== "Bearer") {
    next();
    return;
  }
  try {
    jwt.verify(authToken, process.env.JWT_SECRET);

    // 이미 로그인된 상태일 경우 401 응답
    res.status(401).send({
      success: false,
      message: "이미 로그인된 상태입니다",
    });
  } catch (error) {
    next(); // 토큰 검증 실패 시 다음 미들웨어로 이동
  }
};
