// 유저 CRUD

const express = require("express");

const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../sequelize/models/index.js");
const { isLoggedIn, isNotLoggedIn } = require("../middleware/middleware.verifyToken.js");
// const { mailVerify } = require("../middleware/middleware.Nodemailer.js");
// const s3Client = require("../config/awsS3.config.js");
// const uploadImage = require("../middleware/middleware.multer.js");

// // 회원가입
// router.post("/api/join", async (req, res) => {
//   try {
//     // 필수 입력 값 검증
//     if (!email || !password || !confirmPassword || !username) {
//       return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다" });
//     }

//     // 이메일 형식 검증
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ success: false, message: "유효하지 않은 이메일 형식입니다" });
//     }

//     // 비밀번호 강도 검증
//     if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
//       return res.status(400).json({ success: false, message: "비밀번호는 최소 6자 이상이며, 대소문자, 숫자, 하나 이상의 특수문자를 포함 해야합니다." });
//     }

//     // 비밀번호 일치 검증
//     if (password !== confirmPassword) {
//       return res.status(400).json({ success: false, message: "비밀번호가 일치하지 않습니다" });
//     }

//     // 이메일 중복 확인
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ success: false, message: "이미 사용 중인 이메일입니다" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ email, password: hashedPassword, username });

//     const { password: _, ...userData } = user.toJSON();
//     return res.status(201).json({ success: true, data: userData });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
//   }
// });

// // ================== 효진님 코드
// const express = require("express");
// const passport = require("passport");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const dotenv = require("dotenv");
// dotenv.config();

// const db = require("../sequelize/models");
// const User = db.User;

const authMiddleware = require("../middleware/middleware.verifyToken");

// const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user; // 로그인을 안 한 경우  passport.deserializeUser로부터 복원될 유저정보가 없으므로 null이 됨.
  next();
});

// 회원가입
router.post("/join", async (req, res) => {
  try {
    // 이미 로그인을 한 경우 에러메세지 + 종료
    if (res.locals.user) {
      return res.status(400).send({
        errorMessage: "이미 로그인된 유저입니다.",
      });
    }
    const { email, username, password } = req.body;

    // 이메일 검증식 : 소문자 a~z 와 숫자 0~9까지 + @ + 소문자 a~z + . + 소문자 a~z (2~3 자리)의 형태로 가능
    let regex = new RegExp("[a-z0-9]+@[a-z]+.+[a-z]{2,3}");

    // 이메일 형식이 검증식을 통과 못할때 오류 + 조기리턴
    if (!regex.test(email)) {
      return res.status(400).send({
        errorMessage: "이메일 형식이 올바르지 않습니다.",
      });
    }

    // email 중복여부 확인
    const existsUsers = await User.findOne({
      where: { email },
    });

    // 중복된 이메일이면 오류 + 조기리턴
    if (existsUsers) {
      return res.status(400).send({
        errorMessage: "이메일이 이미 사용중입니다.",
      });
    }

    // // 비밀번호가 확인비밀번호가 다르거나 비번 길이가 6자 미만일때 오류 + 조기리턴
    // if (password !== confirmPassword || password.length < 6) {
    //   return res.status(400).send({
    //     errorMessage: "비밀번호 확인과 일치한 6자리 이상의 비밀번호를 입력해주세요.",
    //   });
    // }

    // 오류가 없을 경우 비밀번호 hash 처리 하여 유저 생성
    const hash = await bcrypt.hash(password, 10);

    await User.create({ email, username, password: hash });
    res.status(201).send({
      Message: `회원가입이 정상적으로 처리되었습니다. 가입된 유저 정보 -> 이메일 : ${email}, 이름: ${username}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ errorMessage: "서버오류" });
  }
});

// 로그인
router.post("/login", isNotLoggedIn, async (req, res) => {
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

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "12h" });
    res.cookie("Authorization", `Bearer ${token}`);
    // res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });
    res.status(200).json({ success: true, message: "로그인 성공", token });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 사용자 조회
router.get("/user/me", isLoggedIn, async (req, res) => {
  try {
    const { email, username, profileDescription, profilePictureUrl } = res.locals.user;

    if (!email || !username) {
      return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다" });
    }

    res.status(200).json({
      success: true,
      data: { username, email, profileDescription, profilePictureUrl },
    });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// // 회원 정보 수정
// router.put("/user/me", isLoggedIn, uploadImage.single("profilePictureUrl"), async (req, res) => {
//   const { id } = res.locals.user;
//   const { currentPassword, newPassword, username, profileDescription } = req.body;

//   try {
//     const user = await User.findByPk(id);

//     if (!user) {
//       return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
//     }

//     const passwordValidation = await bcrypt.compare(currentPassword, user.password);
//     if (!passwordValidation) {
//       return res.status(401).json({ success: false, message: "현재 비밀번호가 일치하지 않습니다." });
//     }

//     if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
//       return res.status(400).json({ success: false, message: "비밀번호는 최소 6자 이상이며, 대소문자, 숫자, 하나 이상의 특수문자를 포함해야 합니다." });
//     }

//     let profilePictureUrl = user.profilePictureUrl;
//     // 새 이미지가 업로드된 경우
//     if (req.file) {
//       // 기존 이미지가 있는 경우, S3에서 삭제
//       if (user.profilePictureUrl) {
//         const oldImageKey = user.profilePictureUrl.split("/").pop(); // S3 key 추출
//         await s3Client
//           .deleteObject({
//             Bucket: process.env.BUCKET,
//             Key: `folder/${oldImageKey}`,
//           })
//           .promise();
//       }

//       profilePictureUrl = req.file.location; // 새 S3 URL
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     await user.update({ password: hashedPassword, username, profileDescription, profilePictureUrl });
//     res.status(200).json({ success: true, message: "사용자 정보가 성공적으로 업데이트되었습니다." });
//   } catch (error) {
//     // console.error(error);
//     res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
//   }
// });

// // 회원 탈퇴
// router.delete("/user", isLoggedIn, async (req, res) => {
//   const { id } = res.locals.user;
//   try {
//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
//     }
//     await user.destroy();
//     res.clearCookie("Authorization");
//     res.status(200).json({ success: true, message: "회원 탈퇴가 성공적으로 처리되었습니다." });
//   } catch (error) {
//     // console.error(error);
//     res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
//   }
// });

// 로그아웃
router.post("/logout", isLoggedIn, (req, res) => {
  res.clearCookie("Authorization");
  res.status(200).json({ success: true, message: "로그아웃 성공" });
  router.post("/api/login", async (req, res) => {
    // 이미 로그인을 한 경우 에러메세지 + 종료
    if (res.locals.user) {
      return res.status(400).send({
        errorMessage: "이미 로그인된 유저입니다.",
      });
    }

    try {
      const { email, password } = req.body;

      // 해당 이메일의 유저정보 있는지 확인
      const user = await User.findOne({
        where: {
          email,
        },
      });

      // 정보가 있는 경우 비밀번호 검증
      const auth = await bcrypt.compare(password, user.password);

      // 사용자가 존재하지 않거나, 입력받은 비밀번호가 사용자의 비밀번호화 다를때
      if (!user || !auth) {
        return res.status(400).send({
          errorMessage: "이메일 또는 패스워드가 틀렸습니다.",
        });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "12h",
      });
      res.cookie("Authorization", `Bearer ${token}`);
      res.status(200).send({ message: "로그인에 성공하였습니다.", token });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ errorMessage: "서버오류" });
    }
  });
});

// // ========================== 효진님 코드
// // 카카오 로그인
// // /kakao로 요청오면, 카카오 로그인 페이지로 가게 되고, 카카오 서버를 통해 카카오 로그인을 하게 되면, 다음 라우터로 요청한다.
// router.get("/auth/kakao", passport.authenticate("kakao"));

// // 위에서 카카오 서버 로그인이 되면, 카카오 redirect url 설정에 따라 이쪽 라우터로 오게 된다.
// router.get(
//   "/auth/kakao/callback",
//   // 그리고 passport 로그인 전략에 의해 kakaoStrategy로 가서 카카오계정 정보와 DB를 비교해서 회원가입시키거나 로그인 처리하게 한다.
//   passport.authenticate("kakao", {
//     failureRedirect: "/?error=카카오로그인 실패", // kakaoStrategy에서 실패한다면 실행
//   }),
//   // kakaoStrategy에서 성공한다면 콜백 실행
//   (req, res) => {
//     res.redirect("/");
//   },
// );

// // 인증 성공시 마이페이지 조회 가능
// router.get("api/users/me", async (req, res) => {
//   const hello = "hello world";
//   try {
//     const user = await User.findOne({
//       where: {
//         email: res.locals.user.email,
//       },
//       attributes: ["id", "email", "username"],
//     });
//     res.status(200).send({ user });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({ errorMessage: "서버오류" });
//   }
// });

// router.get("api/logout", async (req, res) => {
//   // 이메일 로그인인 경우
//   if (req.cookies.includes("Bearer")) {
//     return res.clearCookie("Authorization");
//   }
//   // 소셜 로그인인 경우
//   req.logout();
// });

// // ===== 정선님 코드
// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");

// const { User } = require("../sequelize/models/index.js");

// // 회원가입 API
// router.post("/join", async (req, res) => {
//   try {
//     // 이메일, 이름, 비밀번호, 비밀번호 확인 정보를 받고
//     // 한줄 소개와 프로필 이미지는 기본을 사용
//     // -> models, migrations의 user에서 profile_description, profile_picture_url에 defaultValue를 설정해줌
//     const { email, username, password, confirmPassword } = req.body;

//     // 누락된 정보 각각 검사 status(400) - > 정상작동 확인
//     if (!email) return res.status(400).json({ message: "이메일을 입력하세요." });
//     if (!username) return res.status(400).json({ message: "이름을 입력하세요." });
//     if (!password) return res.status(400).json({ message: "비밀번호를 입력하세요." });
//     if (!confirmPassword) return res.status(400).json({ message: "비밀번호를 다시 한 번 입력하세요." });

// 인증 성공시 마이페이지 조회 가능
router.get("/users/me", isLoggedIn, async (req, res) => {
  const hello = "hello world";
  try {
    const user = await User.findOne({
      where: {
        email: res.locals.user.email,
      },
      attributes: ["id", "email", "username"],
    });
    res.status(200).send({ hello, user });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ errorMessage: "서버오류" });
  }
});

// router.get("/api/logout", async (req, res) => {
//   // 이메일 로그인인 경우
//   if (req.cookies.includes("Bearer")) {
//     return res.clearCookie("Authorization");
//   }
//   // 소셜 로그인인 경우
//   req.logout();
// });
//     // 비밀번호 - 비밀번호 확인 일치여부 검사 status(400) -> 정상작동 확인
//     if (password !== confirmPassword) return res.status(400).json({ message: "비밀번호와 비밀번호 확인이 일치하지 않습니다." });

//     // password 6자 이하인 경우 status(400) -> 정상작동 확인
//     if (password.length < 6) return res.status(400).json({ message: "비밀번호는 6자 이상이어야 합니다." });

//     // 이메일 형식이 아닌 경우 status(400) -> 정상작동 확인
//     let emailVaidationRegex = new RegExp("[a-z0-9._]+@[a-z]+.[a-z]{2,3}");
//     const isValidEmail = emailVaidationRegex.test(email);
//     if (!isValidEmail) return res.status(400).json({ message: "올바른 이메일 형식이 아닙니다." });

//     // 이미 가입되어 있는 이메일인 경우 status(404) -> 정상작동 확인
//     const isExistUser = await User.findOne({ where: { email: email } });
//     if (isExistUser) return res.status(404).json({ message: "이미 가입 되어있는 이메일입니다." });

//     // Hash된 비밀번호를 저장
//     const hashedPassword = bcrypt.hashSync(password, 10);

//     // db에 사용자 정보 저장
//     const newUser = await User.create({ email, username, password: hashedPassword });

//     // 가입완료 된 사용자 정보 비밀번호 빼고 반환
//     const { id, profileDescription, profilePictureUrl, createdAt } = newUser;
//     return res
//       .status(200)
//       .json({ message: "회원가입이 성공적으로 완료됐습니다.", data: { email, username, id, profileDescription, profilePictureUrl, createdAt } });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "예상치 못한 에러가 발생했습니다!" });
//   }
// });

module.exports = router;
