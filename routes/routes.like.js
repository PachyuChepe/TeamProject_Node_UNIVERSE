const express = require("express");

const router = express.Router();
const { Post, PostLike, Comment, CommentLike } = require("../sequelize/models/index.js");
const { isLoggedIn } = require("../middleware/middleware.verifyToken.js");

// 게시물에 좋아요 추가
router.post("/post/:postId/like", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  const userId = res.locals.user.id; // 세션 또는 토큰에서 사용자 ID를 가정

  try {
    // 사용자가 자신의 게시물에 좋아요를 하는 것을 방지
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "게시물을 찾을 수 없습니다." });
    }

    if (post.userId === userId) {
      return res.status(403).json({ success: false, message: "자신의 게시물에는 좋아요를 할 수 없습니다" });
    }

    // 게시물에 좋아요
    const [like, created] = await PostLike.findOrCreate({
      where: { userId, postId },
    });

    console.log("좋아요!!!", like);

    if (created) {
      return res.status(200).json({ success: true, message: "게시물에 좋아요가 성공적으로 되었습니다" });
    } else {
      return res.status(200).json({ success: false, message: "이미 좋아요한 게시물입니다" });
    }
  } catch (err) {
    console.error("Error in likePost:", err);
    return res.status(500).json({ success: false, message: "게시물 좋아요에 실패하였습니다." });
  }
});

// 게시물에 대한 좋아요 삭제
router.delete("/post/:postId/like", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  const userId = res.locals.user.id;

  try {
    // 좋아요 레코드 찾기 및 삭제
    const like = await PostLike.findOne({
      where: { userId, postId },
    });

    if (!like) {
      return res.status(404).json({ success: false, message: "좋아요가 없습니다." });
    }

    await like.destroy();
    return res.status(200).json({ success: true, message: "게시물 좋아요가 취소되었습니다" });
  } catch (err) {
    console.error("Error in unlikePost:", err);
    return res.status(500).json({ success: false, message: "게시물 좋아요 취소에 실패하였습니다." });
  }
});

// 댓글에 좋아요 추가
router.post("/comment/:commentId/like", isLoggedIn, async (req, res) => {
  const { commentId } = req.params;
  const userId = res.locals.user.id; // 세션 또는 토큰에서 사용자 ID를 가정

  try {
    // 사용자가 자신의 댓글에 좋아요를 하는 것을 방지
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "댓글을 찾을 수 없습니다." });
    }

    if (comment.userId === userId) {
      return res.status(403).json({ success: false, message: "자신의 댓글에는 좋아요를 할 수 없습니다" });
    }

    // 댓글에 좋아요
    const [like, created] = await CommentLike.findOrCreate({
      where: { userId, commentId },
    });

    console.log("좋아요!!!", like);

    if (created) {
      return res.status(200).json({ success: true, message: "댓글에 좋아요가 성공적으로 되었습니다" });
    } else {
      return res.status(200).json({ success: false, message: "이미 좋아요한 댓글입니다" });
    }
  } catch (err) {
    console.error("Error in likeComment:", err);
    return res.status(500).json({ success: false, message: "댓글 좋아요에 실패하였습니다." });
  }
});

// 댓글에 대한 좋아요 삭제
router.delete("/comment/:commentId/like", isLoggedIn, async (req, res) => {
  const { commentId } = req.params;
  const userId = res.locals.user.id;

  try {
    // 좋아요 레코드 찾기 및 삭제
    const like = await CommentLike.findOne({
      where: { userId, commentId },
    });

    if (!like) {
      return res.status(404).json({ success: false, message: "좋아요가 없습니다." });
    }

    await like.destroy();
    return res.status(200).json({ success: true, message: "댓글 좋아요가 취소되었습니다" });
  } catch (err) {
    console.error("Error in unlikeComment:", err);
    return res.status(500).json({ success: false, message: "댓글 좋아요 취소에 실패하였습니다." });
  }
});

module.exports = router;
