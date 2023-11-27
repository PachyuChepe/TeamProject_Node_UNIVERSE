// 유저 관련 기능을 위한 라우팅 설정
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // 비밀번호 암호화를 위한 bcrypt 모듈
const { User, Post, Follow } = require("../sequelize/models/index.js"); // 데이터베이스 모델 가져오기
const { mailVerify } = require("../middleware/middleware.Nodemailer.js"); // 이메일 인증을 위한 미들웨어
const passport = require("passport"); // 인증을 위한 passport 모듈
const s3Client = require("../config/awsS3.config.js"); // AWS S3 설정
const uploadImage = require("../middleware/middleware.multer.js"); // 이미지 업로드를 위한 미들웨어
const { isLoggedIn, isNotLoggedIn } = require("../middleware/middleware.verifyToken.js"); // 토큰 검증 미들웨어
const { generateAccessToken, generateRefreshToken } = require("../utils/tokenManager.js"); // 토큰 생성 유틸리티

// 회원가입 엔드포인트
router.post("/join", isNotLoggedIn, async (req, res) => {
  const { email, password, confirmPassword, username } = req.body;
  try {
    // 입력 값 검증: 이메일, 비밀번호, 비밀번호 확인, 사용자 이름
    if (!email || !password || !confirmPassword || !username) {
      return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다" });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "유효하지 않은 이메일 형식입니다" });
    }

    // 비밀번호 강도 검증: 최소 6자, 대문자, 숫자, 특수문자 포함
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({ success: false, message: "비밀번호는 최소 6자 이상이며, 대소문자, 숫자, 하나 이상의 특수문자를 포함 해야합니다." });
    }

    // 비밀번호 일치 여부 검증
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "비밀번호가 일치하지 않습니다" });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "이미 사용 중인 이메일입니다" });
    }

    // 비밀번호 해싱 및 사용자 생성
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, username, provider: "local" });

    // 생성된 사용자 정보 응답 (비밀번호 제외)
    const { password: _, ...userData } = user.toJSON();
    return res.status(201).json({ success: true, data: userData });
  } catch (error) {
    // 서버 오류 처리
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 로그인 엔드포인트
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 이메일을 통한 사용자 조회
    const user = await User.findOne({ where: { email } });

    // 사용자 존재 여부 확인
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
    }

    // 입력된 비밀번호와 저장된 비밀번호 일치 여부 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "패스워드가 일치하지 않습니다." });
    }

    // 토큰 생성 및 쿠키에 저장
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // 로그인 성공 응답
    res.cookie("Authorization", `Bearer ${accessToken}`);
    res.cookie("RefreshToken", refreshToken);

    res.status(200).json({ success: true, message: "로그인 성공", accessToken, refreshToken });
  } catch (error) {
    // 서버 오류 처리
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 현재 로그인한 사용자 정보 조회 엔드포인트
router.get("/user/me", isLoggedIn, async (req, res) => {
  try {
    // 로그인한 사용자 ID 추출
    const userId = res.locals.user.id;

    // 사용자 프로필 정보 조회
    const userProfile = await User.findByPk(userId, {
      attributes: ["username", "email", "profileDescription", "profilePictureUrl"],
    });

    // 사용자 존재 여부 확인
    if (!userProfile) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다" });
    }

    // 사용자의 게시글 수, 팔로워 수, 팔로잉 수 계산
    const postsCount = await Post.count({ where: { userId } });
    const followersCount = await Follow.count({ where: { following: userId } });
    const followingCount = await Follow.count({ where: { follower: userId } });

    // 사용자 정보 및 관련 통계 응답
    res.status(200).json({
      success: true,
      data: {
        userProfile,
        stats: {
          postsCount,
          followersCount,
          followingCount,
        },
      },
    });
  } catch (error) {
    // 서버 오류 처리
    // console.log(error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// router.get("/user/me", isLoggedIn, async (req, res) => {
//   try {
//     const { email, username, profileDescription, profilePictureUrl } = res.locals.user;

//     if (!email || !username) {
//       return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다" });
//     }

//     res.status(200).json({
//       success: true,
//       data: { username, email, profileDescription, profilePictureUrl },
//     });
//   } catch (error) {
//     // console.error(error);
//     res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
//   }
// });
// 회원 정보 수정 엔드포인트
router.put("/user/me", isLoggedIn, uploadImage.single("profilePictureUrl"), async (req, res) => {
  const { id } = res.locals.user;
  const { currentPassword, newPassword, username, profileDescription } = req.body;

  try {
    const user = await User.findByPk(id);

    // 사용자 존재 여부 확인
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
    }

    // 로컬 로그인 사용자의 경우 현재 비밀번호 검증
    if (user.provider === "local") {
      const passwordValidation = await bcrypt.compare(currentPassword, user.password);
      if (!passwordValidation) {
        return res.status(401).json({ success: false, message: "현재 비밀번호가 일치하지 않습니다." });
      }

      // 새 비밀번호 강도 검증
      if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
        return res.status(400).json({ success: false, message: "비밀번호는 최소 6자 이상이며, 대소문자, 숫자, 하나 이상의 특수문자를 포함해야 합니다." });
      }

      // 새 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // 프로필 이미지 업데이트 로직
    let profilePictureUrl = user.profilePictureUrl;
    if (req.file) {
      // 기존 이미지 삭제 로직
      if (user.profilePictureUrl) {
        const oldImageKey = user.profilePictureUrl.split("/").pop(); // S3 key 추출
        await s3Client
          .deleteObject({
            Bucket: process.env.BUCKET,
            Key: `folder/${oldImageKey}`,
          })
          .promise();
      }

      profilePictureUrl = req.file.location; // 새 이미지 URL 설정
    }

    // 사용자 정보 업데이트
    await user.update({ username, profileDescription, profilePictureUrl });
    res.status(200).json({ success: true, message: "사용자 정보가 성공적으로 업데이트되었습니다." });
  } catch (error) {
    // 서버 오류 처리
    console.error(error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 회원 탈퇴 엔드포인트
router.delete("/user", isLoggedIn, async (req, res) => {
  const { id } = res.locals.user;
  try {
    const user = await User.findByPk(id);

    // 사용자 존재 여부 확인
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
    }

    // 사용자 삭제 및 쿠키 제거
    await user.destroy();
    res.clearCookie("Authorization");
    res.clearCookie("RefreshToken");
    res.status(200).json({ success: true, message: "회원 탈퇴가 성공적으로 처리되었습니다." });
  } catch (error) {
    // 서버 오류 처리
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 로그아웃 엔드포인트
router.post("/logout", isLoggedIn, (req, res) => {
  // 로그아웃 시 쿠키 제거
  res.clearCookie("Authorization");
  res.clearCookie("RefreshToken");
  res.status(200).json({ success: true, message: "로그아웃 성공" });
});

// 카카오 로그인 엔드포인트
router.get("/kakao", passport.authenticate("kakao"));
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    session: false, // 세션 비사용 설정
    failureRedirect: "/", // 로그인 실패 시 리디렉션 주소
  }),
  (req, res) => {
    // 토큰을 쿠키에 저장 및 로그인 성공 시 리디렉션
    res.cookie("Authorization", `Bearer ${req.user.accessToken}`);
    res.cookie("RefreshToken", req.user.refreshToken);
    res.redirect("/");
  },
);

// 네이버 로그인 엔드포인트
router.get("/naver", passport.authenticate("naver"));
router.get(
  "/naver/callback",
  passport.authenticate("naver", {
    session: false, // 세션 비사용 설정
    failureRedirect: "/", // 로그인 실패 시 리디렉션 주소
  }),
  (req, res) => {
    // 토큰을 쿠키에 저장 및 로그인 성공 시 리디렉션
    res.cookie("Authorization", `Bearer ${req.user.accessToken}`);
    res.cookie("RefreshToken", req.user.refreshToken);
    res.redirect("/");
  },
);

// 사용자 인증 상태 확인 엔드포인트
router.get("/checkAuth", isLoggedIn, async (req, res) => {
  const { id } = res.locals.user;
  const user = await User.findByPk(id);

  // 인증 상태 및 사용자 정보 응답
  res.status(200).json({
    success: true,
    isAuthenticated: true,
    provider: user.provider, // 로그인 방식 (local, kakao, naver 등)
    message: "사용자가 인증되었습니다.",
  });
});

// 사용자 조회
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params; // URL에서 게시글 ID 추출
  const user = await User.findOne({ id: userId });
  // console.log(user.id);
  const { id, username, email, profilePictureUrl } = user;
  res.send({ id, username, email, profilePictureUrl });
});
module.exports = router;
