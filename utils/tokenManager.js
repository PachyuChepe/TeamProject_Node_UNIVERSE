const jwt = require("jsonwebtoken");

// Access 토큰 생성 함수
const generateAccessToken = (userId) => {
  // 사용자 ID를 이용하여 1시간 동안 유효한 JWT 생성
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Refresh 토큰 생성 함수
const generateRefreshToken = (userId) => {
  // 사용자 ID를 이용하여 7일 동안 유효한 JWT 생성
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

// 토큰 검증 함수
const verifyToken = (token, secret) => {
  try {
    // 주어진 토큰과 비밀키를 이용하여 토큰을 검증하고, 검증된 페이로드 반환
    return jwt.verify(token, secret);
  } catch (error) {
    // 검증 실패 시 null 반환
    return null;
  }
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
