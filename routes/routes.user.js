// 유저 CRUD
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Post, Follow } = require("../sequelize/models/index.js");
const { mailVerify } = require("../middleware/middleware.Nodemailer.js");
const passport = require("passport");
const s3Client = require("../config/awsS3.config.js");
const uploadImage = require("../middleware/middleware.multer.js");
const { isLoggedIn, isNotLoggedIn } = require("../middleware/middleware.verifyToken.js");
const { generateAccessToken, generateRefreshToken } = require("../utils/tokenManager.js");

// 회원가입
router.post("/join", isNotLoggedIn, async (req, res) => {
  const { email, password, confirmPassword, username } = req.body;
  try {
    // 필수 입력 값 검증
    if (!email || !password || !confirmPassword || !username) {
      return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다" });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "유효하지 않은 이메일 형식입니다" });
    }

    // 비밀번호 강도 검증
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({ success: false, message: "비밀번호는 최소 6자 이상이며, 대소문자, 숫자, 하나 이상의 특수문자를 포함 해야합니다." });
    }

    // 비밀번호 일치 검증
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "비밀번호가 일치하지 않습니다" });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "이미 사용 중인 이메일입니다" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, username, provider: "local" });

    const { password: _, ...userData } = user.toJSON();
    return res.status(201).json({ success: true, data: userData });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "패스워드가 일치하지 않습니다." });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie("Authorization", `Bearer ${accessToken}`);
    res.cookie("RefreshToken", refreshToken);

    res.status(200).json({ success: true, message: "로그인 성공", accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 사용자 조회
router.get("/user/me", isLoggedIn, async (req, res) => {
  try {
    const userId = res.locals.user.id;

    // 사용자 프로필 정보 조회
    const userProfile = await User.findByPk(userId, {
      attributes: ["username", "email", "profileDescription", "profilePictureUrl"],
    });

    if (!userProfile) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다" });
    }

    // 사용자의 게시글 수, 팔로우 수, 팔로잉 수 계산
    const postsCount = await Post.count({ where: { userId } });
    const followersCount = await Follow.count({ where: { following: userId } });
    const followingCount = await Follow.count({ where: { follower: userId } });

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
    console.log(error);
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

// 회원 정보 수정
router.put("/user/me", isLoggedIn, uploadImage.single("profilePictureUrl"), async (req, res) => {
  const { id } = res.locals.user;
  const { currentPassword, newPassword, username, profileDescription } = req.body;
  // console.log(req);

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
    }

    // 소셜 로그인 사용자가 아닌 경우에만 비밀번호 검증
    if (user.provider === "local") {
      const passwordValidation = await bcrypt.compare(currentPassword, user.password);
      if (!passwordValidation) {
        return res.status(401).json({ success: false, message: "현재 비밀번호가 일치하지 않습니다." });
      }

      if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
        return res.status(400).json({ success: false, message: "비밀번호는 최소 6자 이상이며, 대소문자, 숫자, 하나 이상의 특수문자를 포함해야 합니다." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // console.log(req.file);
    let profilePictureUrl = user.profilePictureUrl;
    // 새 이미지가 업로드된 경우
    if (req.file) {
      // 기존 이미지가 있는 경우, S3에서 삭제
      if (user.profilePictureUrl) {
        const oldImageKey = user.profilePictureUrl.split("/").pop(); // S3 key 추출
        await s3Client
          .deleteObject({
            Bucket: process.env.BUCKET,
            Key: `folder/${oldImageKey}`,
          })
          .promise();
      }

      profilePictureUrl = req.file.location; // 새 S3 URL
    }

    await user.update({ username, profileDescription, profilePictureUrl });
    res.status(200).json({ success: true, message: "사용자 정보가 성공적으로 업데이트되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 회원 탈퇴
router.delete("/user", isLoggedIn, async (req, res) => {
  const { id } = res.locals.user;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
    }
    await user.destroy();
    res.clearCookie("Authorization");
    res.clearCookie("RefreshToken");
    res.status(200).json({ success: true, message: "회원 탈퇴가 성공적으로 처리되었습니다." });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 로그아웃
router.post("/logout", isLoggedIn, (req, res) => {
  res.clearCookie("Authorization");
  res.clearCookie("RefreshToken");
  res.status(200).json({ success: true, message: "로그아웃 성공" });
});

// 카카오 로그인 구현
router.get("/kakao", passport.authenticate("kakao"));
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    session: false, // 세션 사용 안 함
    failureRedirect: "/", // 로그인 실패 시 리디렉트 주소
  }),
  (req, res) => {
    // HTTP Only Cookie에 토큰 저장
    res.cookie("Authorization", `Bearer ${req.user.accessToken}`);
    res.cookie("RefreshToken", req.user.refreshToken);

    // 로그인 성공 후 리디렉트 주소
    res.redirect("/");
  },
);

// 네이버 로그인 구현
router.get("/naver", passport.authenticate("naver"));
router.get(
  "/naver/callback",
  passport.authenticate("naver", {
    session: false, // 세션 사용 안 함
    failureRedirect: "/", // 로그인 실패 시 리디렉트 주소
  }),
  (req, res) => {
    // HTTP Only Cookie에 토큰 저장
    res.cookie("Authorization", `Bearer ${req.user.accessToken}`);
    res.cookie("RefreshToken", req.user.refreshToken);

    // 로그인 성공 후 리디렉트 주소
    res.redirect("/");
  },
);

// 사용자 인증
router.get("/checkAuth", isLoggedIn, async (req, res) => {
  const { id } = res.locals.user;
  const user = await User.findByPk(id);
  console.log(user.provider);
  res.status(200).json({
    success: true,
    isAuthenticated: true, // 로그인 로그아웃 스위치
    provider: user.provider, // 패스워드 인풋 스위치
    message: "사용자가 인증되었습니다.",
  });
});

module.exports = router;
