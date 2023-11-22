// 유저 CRUD
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const { User } = require("../sequelize/models/index.js");

// 회원가입 API
router.post("/join", async (req, res) => {
  try {
    // 이메일, 이름, 비밀번호, 비밀번호 확인 정보를 받고
    // 한줄 소개와 프로필 이미지는 기본을 사용
    // -> models, migrations의 user에서 profile_description, profile_picture_url에 defaultValue를 설정해줌
    const { email, username, password, confirmPassword } = req.body;

    // 누락된 정보 각각 검사 status(400) - > 정상작동 확인
    if (!email) return res.status(400).json({ message: "이메일을 입력하세요." });
    if (!username) return res.status(400).json({ message: "이름을 입력하세요." });
    if (!password) return res.status(400).json({ message: "비밀번호를 입력하세요." });
    if (!confirmPassword) return res.status(400).json({ message: "비밀번호를 다시 한 번 입력하세요." });

    // 비밀번호 - 비밀번호 확인 일치여부 검사 status(400) -> 정상작동 확인
    if (password !== confirmPassword) return res.status(400).json({ message: "비밀번호와 비밀번호 확인이 일치하지 않습니다." });

    // password 6자 이하인 경우 status(400) -> 정상작동 확인
    if (password.length < 6) return res.status(400).json({ message: "비밀번호는 6자 이상이어야 합니다." });

    // 이메일 형식이 아닌 경우 status(400) -> 정상작동 확인
    let emailVaidationRegex = new RegExp("[a-z0-9._]+@[a-z]+.[a-z]{2,3}");
    const isValidEmail = emailVaidationRegex.test(email);
    if (!isValidEmail) return res.status(400).json({ message: "올바른 이메일 형식이 아닙니다." });

    // 이미 가입되어 있는 이메일인 경우 status(404) -> 정상작동 확인
    const isExistUser = await User.findOne({ where: { email: email } });
    if (isExistUser) return res.status(404).json({ message: "이미 가입 되어있는 이메일입니다." });

    // Hash된 비밀번호를 저장
    const hashedPassword = bcrypt.hashSync(password, 10);

    // db에 사용자 정보 저장
    const newUser = await User.create({ email, username, password: hashedPassword });

    // 가입완료 된 사용자 정보 비밀번호 빼고 반환
    const { id, profileDescription, profilePictureUrl, createdAt } = newUser;
    return res
      .status(200)
      .json({ message: "회원가입이 성공적으로 완료됐습니다.", data: { email, username, id, profileDescription, profilePictureUrl, createdAt } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "예상치 못한 에러가 발생했습니다!" });
  }
});

module.exports = router;
