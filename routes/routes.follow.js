const express = require("express");

const router = express.Router();
const { User, Follow } = require("../sequelize/models/index.js");
const { isLoggedIn } = require("../middleware/middleware.verifyToken.js");

// 팔로우 기능 라우터

// 사용자 팔로우 (Create)
router.post("/follow/:userId", isLoggedIn, async (req, res) => {
  const { userId } = req.params; // URL에서 팔로우할 사용자 ID 추출
  const followerId = res.locals.user.id; // 현재 로그인한 사용자의 ID

  // userId가 숫자가 아니거나 자기 자신인 경우 오류 반환
  if (isNaN(userId) || userId === `${followerId}`) {
    return res.status(400).json({ success: false, message: "잘못된 유저 ID이거나 자기 자신을 팔로우할 수 없습니다." });
  }

  try {
    // 팔로우 관계 생성 또는 확인
    const [follow, created] = await Follow.findOrCreate({
      where: { follower: followerId, following: userId },
    });

    // 이미 팔로우된 경우 오류 반환, 아니면 성공 응답
    if (created) {
      return res.status(200).json({ success: true, message: "팔로우가 성공적으로 되었습니다." });
    } else {
      return res.status(400).json({ success: false, message: "이미 팔로우한 사용자입니다." });
    }
  } catch (err) {
    // 팔로우 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "팔로우에 실패하였습니다." });
  }
});

// 사용자의 팔로잉 수 조회 (Read)
router.get("/follow/:userId", isLoggedIn, async (req, res) => {
  const userId = req.params.userId;

  try {
    // 해당 사용자가 팔로우하는 사용자의 수를 계산
    const followingCount = await Follow.count({
      where: { follower: userId },
    });

    // 팔로잉 수 반환
    return res.status(200).json({ success: true, followingCount });
  } catch (err) {
    // 팔로잉 수 조회 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "팔로잉 수를 가져오는데 실패하였습니다." });
  }
});

// 사용자가 팔로우하는 사용자 목록 조회 (Read)
router.get("/following/:userId", isLoggedIn, async (req, res) => {
  const userId = req.params.userId;

  try {
    // 해당 사용자가 팔로우하는 사용자의 목록을 조회
    const followingUsers = await Follow.findAll({
      attributes: ["id"],
      where: { follower: userId },
      include: [
        {
          model: User,
          as: "Following",
          attributes: ["id", "username"],
        },
      ],
    });

    // 팔로잉 사용자 목록 반환
    return res.status(200).json({ success: true, followingUsers });
  } catch (err) {
    // 팔로잉 사용자 목록 조회 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "팔로잉 목록을 가져오는데 실패하였습니다." });
  }
});

// 사용자 언팔로우 (Delete)
router.delete("/unfollow/:userId", isLoggedIn, async (req, res) => {
  const { userId } = req.params; // URL에서 언팔로우할 사용자 ID 추출
  const followerId = res.locals.user.id; // 현재 로그인한 사용자의 ID

  // userId가 숫자가 아닌 경우 오류 반환
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: "잘못된 유저 ID입니다." });
  }

  try {
    // 팔로우 관계 삭제
    const result = await Follow.destroy({
      where: { follower: followerId, following: userId },
    });

    // 언팔로우 성공 여부에 따른 응답
    if (result === 0) {
      return res.status(404).json({ success: false, message: "팔로우하지 않은 사용자입니다." });
    }

    return res.status(200).json({ success: true, message: "언팔로우가 성공적으로 되었습니다." });
  } catch (err) {
    // 언팔로우 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "언팔로우에 실패하였습니다." });
  }
});

module.exports = router; // 라우터 모듈 내보내기
