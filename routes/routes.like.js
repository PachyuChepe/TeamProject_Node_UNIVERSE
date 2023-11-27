const express = require("express");

const router = express.Router();
const { Post, PostLike, Comment, CommentLike } = require("../sequelize/models/index.js");
const { isLoggedIn } = require("../middleware/middleware.verifyToken.js");

// 좋아요 기능 라우터

// 게시물에 좋아요 추가 (Create)
router.post("/post/:postId/like", isLoggedIn, async (req, res) => {
  const { postId } = req.params; // URL에서 게시물 ID 추출
  const userId = res.locals.user.id; // 로그인한 사용자의 ID

  // postId가 숫자가 아닌 경우 오류 반환
  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 게시물 ID입니다." });
  }

  try {
    // 게시물 검증 및 자기 게시물에 좋아요 방지
    const post = await Post.findByPk(postId);
    if (!post || post.userId === userId) {
      return res.status(403).json({ success: false, message: "자신의 게시물에는 좋아요를 할 수 없습니다" });
    }

    // 게시물에 좋아요 추가
    const [like, created] = await PostLike.findOrCreate({
      where: { userId, postId },
    });

    // 좋아요 성공 또는 이미 좋아요한 게시물인 경우 처리
    return created
      ? res.status(200).json({ success: true, message: "게시물에 좋아요가 성공적으로 되었습니다" })
      : res.status(200).json({ success: false, message: "이미 좋아요한 게시물입니다" });
  } catch (err) {
    // 게시물 좋아요 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "게시물 좋아요에 실패하였습니다." });
  }
});

// 게시물에 대한 좋아요 수 조회 (Read)
router.get("/post/:postId/likes/count", async (req, res) => {
  const { postId } = req.params; // URL에서 게시물 ID 추출

  // postId가 숫자가 아닌 경우 오류 반환
  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 게시물 ID입니다." });
  }

  try {
    // 해당 게시물의 좋아요 수 계산
    const likesCount = await PostLike.count({ where: { postId } });
    return res.status(200).json({ success: true, likesCount });
  } catch (err) {
    // 게시물 좋아요 수 조회 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "좋아요 수를 가져오는데 실패하였습니다." });
  }
});

// 게시물에 대한 좋아요 삭제 (Delete)
router.delete("/post/:postId/like", isLoggedIn, async (req, res) => {
  const { postId } = req.params; // URL에서 게시물 ID 추출
  const userId = res.locals.user.id; // 로그인한 사용자의 ID

  // postId가 숫자가 아닌 경우 오류 반환
  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 게시물 ID입니다." });
  }

  try {
    // 좋아요 삭제
    const result = await PostLike.destroy({ where: { userId, postId } });
    return result
      ? res.status(200).json({ success: true, message: "게시물 좋아요가 취소되었습니다" })
      : res.status(404).json({ success: false, message: "좋아요가 없습니다." });
  } catch (err) {
    // 게시물 좋아요 삭제 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "게시물 좋아요 취소에 실패하였습니다." });
  }
});

// 댓글에 좋아요 추가 (Create)
router.post("/comment/:commentId/like", isLoggedIn, async (req, res) => {
  const { commentId } = req.params; // URL에서 댓글 ID 추출
  const userId = res.locals.user.id; // 로그인한 사용자의 ID

  // commentId가 숫자가 아닌 경우 오류 반환
  if (isNaN(commentId)) {
    return res.status(400).json({ success: false, message: "잘못된 댓글 ID입니다." });
  }

  try {
    // 댓글 검증 및 자기 댓글에 좋아요 방지
    const comment = await Comment.findByPk(commentId);
    if (!comment || comment.userId === userId) {
      return res.status(403).json({ success: false, message: "자신의 댓글에는 좋아요를 할 수 없습니다" });
    }

    // 댓글에 좋아요 추가
    const [like, created] = await CommentLike.findOrCreate({
      where: { userId, commentId },
    });

    // 좋아요 성공 또는 이미 좋아요한 댓글인 경우 처리
    return created
      ? res.status(200).json({ success: true, message: "댓글에 좋아요가 성공적으로 되었습니다" })
      : res.status(200).json({ success: false, message: "이미 좋아요한 댓글입니다" });
  } catch (err) {
    // 댓글 좋아요 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "댓글 좋아요에 실패하였습니다." });
  }
});

// 댓글에 대한 좋아요 수 조회 (Read)
router.get("/comment/:commentId/likes/count", async (req, res) => {
  const { commentId } = req.params; // URL에서 댓글 ID 추출

  // commentId가 숫자가 아닌 경우 오류 반환
  if (isNaN(commentId)) {
    return res.status(400).json({ success: false, message: "잘못된 댓글 ID입니다." });
  }

  try {
    // 해당 댓글의 좋아요 수 계산
    const likesCount = await CommentLike.count({ where: { commentId } });
    return res.status(200).json({ success: true, likesCount });
  } catch (err) {
    // 댓글 좋아요 수 조회 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "좋아요 수를 가져오는데 실패하였습니다." });
  }
});

// 댓글에 대한 좋아요 삭제 (Delete)
router.delete("/comment/:commentId/like", isLoggedIn, async (req, res) => {
  const { commentId } = req.params; // URL에서 댓글 ID 추출
  const userId = res.locals.user.id; // 로그인한 사용자의 ID

  // commentId가 숫자가 아닌 경우 오류 반환
  if (isNaN(commentId)) {
    return res.status(400).json({ success: false, message: "잘못된 댓글 ID입니다." });
  }

  try {
    // 좋아요 삭제
    const result = await CommentLike.destroy({ where: { userId, commentId } });
    return result
      ? res.status(200).json({ success: true, message: "댓글 좋아요가 취소되었습니다" })
      : res.status(404).json({ success: false, message: "좋아요가 없습니다." });
  } catch (err) {
    // 댓글 좋아요 삭제 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "댓글 좋아요 취소에 실패하였습니다." });
  }
});

module.exports = router; // 라우터 모듈 내보내기
