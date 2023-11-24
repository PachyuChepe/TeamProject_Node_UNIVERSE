const express = require("express");

const router = express.Router();
const { User, Follow } = require("../sequelize/models/index.js");
const { isLoggedIn } = require("../middleware/middleware.verifyToken.js");

// 팔로우
router.post("/follow/:userId", isLoggedIn, async (req, res) => {
  const { userId } = req.params; // 팔로우할 사용자의 ID
  const followerId = res.locals.user.id; // 현재 로그인한 사용자의 ID

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: "잘못된 유저 ID입니다." });
  }

  if (userId === `${followerId}`) {
    return res.status(400).json({ success: false, message: "자기 자신을 팔로우할 수 없습니다." });
  }

  try {
    const [follow, created] = await Follow.findOrCreate({
      where: { follower: followerId, following: userId },
    });

    if (created) {
      return res.status(200).json({ success: true, message: "팔로우가 성공적으로 되었습니다." });
    } else {
      return res.status(400).json({ success: false, message: "이미 팔로우한 사용자입니다." });
    }
  } catch (err) {
    // console.error("Error in follow:", err);
    return res.status(500).json({ success: false, message: "팔로우에 실패하였습니다." });
  }
});

// 팔로우 숫자
router.get("/follow/:userId", isLoggedIn, async (req, res) => {
  const userId = req.params.userId;

  try {
    const followingCount = await Follow.count({
      where: { follower: userId },
    });

    return res.status(200).json({ success: true, followingCount });
  } catch (err) {
    // console.error("Error in getting following count:", err);
    return res.status(500).json({ success: false, message: "팔로잉 수를 가져오는데 실패하였습니다." });
  }
});

// 팔로우 유저 상세보기
router.get("/following/:userId", isLoggedIn, async (req, res) => {
  const userId = req.params.userId;

  try {
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

    return res.status(200).json({ success: true, followingUsers });
  } catch (err) {
    // console.error("Error in getting following users:", err);
    return res.status(500).json({ success: false, message: "팔로잉 목록을 가져오는데 실패하였습니다." });
  }
});

// 언팔로우
router.delete("/unfollow/:userId", isLoggedIn, async (req, res) => {
  const { userId } = req.params;
  const followerId = res.locals.user.id;

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: "잘못된 유저 ID입니다." });
  }

  try {
    const result = await Follow.destroy({
      where: { follower: followerId, following: userId },
    });

    if (result === 0) {
      return res.status(404).json({ success: false, message: "팔로우하지 않은 사용자입니다." });
    }

    return res.status(200).json({ success: true, message: "언팔로우가 성공적으로 되었습니다." });
  } catch (err) {
    // console.error("Error in unfollow:", err);
    return res.status(500).json({ success: false, message: "언팔로우에 실패하였습니다." });
  }
});

module.exports = router;
