const jwt = require("jsonwebtoken");
const { verifyToken, generateAccessToken } = require("../utils/tokenManager");
const { User } = require("../sequelize/models/index.js");

exports.isLoggedIn = async (req, res, next) => {
  const { Authorization, RefreshToken } = req.cookies;
  const [authType, authToken] = (Authorization ?? "").split(" ");

  if (!authToken || authType !== "Bearer") {
    return res.status(401).send({ success: false, message: "로그인이 필요합니다." });
  }

  const decoded = verifyToken(authToken, process.env.JWT_SECRET);
  if (decoded) {
    res.locals.user = await User.findByPk(decoded.userId);
    return next();
  }

  // 엑세스 토큰 만료 시 리프레시 토큰 확인
  if (RefreshToken) {
    const refreshDecoded = verifyToken(RefreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (refreshDecoded) {
      const newAccessToken = generateAccessToken(refreshDecoded.userId);
      res.cookie("Authorization", `Bearer ${newAccessToken}`);
      res.locals.user = await User.findByPk(refreshDecoded.userId);
      return next();
    }
  }

  return res.status(401).send({ success: false, message: "로그인이 필요합니다." });
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
